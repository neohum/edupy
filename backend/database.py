import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

DATABASE_PATH = "edupy.db"

def get_db_connection():
    """데이터베이스 연결 생성"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # 딕셔너리 형태로 결과 반환
    return conn

def init_database():
    """데이터베이스 초기화 및 테이블 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 오류 보고 테이블 생성
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS error_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            activity TEXT NOT NULL,
            error_message TEXT NOT NULL,
            user_code TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            resolved BOOLEAN DEFAULT 0,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 인덱스 생성 (검색 성능 향상)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_level ON error_reports(level)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_activity ON error_reports(activity)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_timestamp ON error_reports(timestamp)
    """)
    
    conn.commit()
    conn.close()
    
    logger.info("Database initialized successfully")

def save_error_report(level: str, activity: str, error_message: str, user_code: str, timestamp: str) -> int:
    """오류 보고 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO error_reports (level, activity, error_message, user_code, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (level, activity, error_message, user_code, timestamp))
    
    error_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    logger.info(f"Error report saved with ID: {error_id}")
    return error_id

def get_error_reports(limit: int = 100, offset: int = 0, filter_status: str = 'all') -> List[Dict]:
    """오류 보고 목록 조회 (SQL Injection 방지)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 필터링 조건 추가 (파라미터화된 쿼리 사용)
        if filter_status == 'resolved':
            cursor.execute("""
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                WHERE resolved = 1
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))
        elif filter_status == 'unresolved':
            cursor.execute("""
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                WHERE resolved = 0
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))
        else:  # 'all'
            cursor.execute("""
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))

        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_error_statistics() -> Dict:
    """오류 통계 조회 (최적화된 단일 연결)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 전체 오류 수 및 해결된 오류 수를 한 번에 조회
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved
            FROM error_reports
        """)
        counts = cursor.fetchone()
        total_errors = counts['total']
        resolved_errors = counts['resolved']
        unresolved_errors = total_errors - resolved_errors

        # 레벨별 오류 수
        cursor.execute("""
            SELECT level, COUNT(*) as count
            FROM error_reports
            GROUP BY level
            ORDER BY count DESC
        """)
        errors_by_level = [dict(row) for row in cursor.fetchall()]

        # 활동별 오류 수 (상위 10개)
        cursor.execute("""
            SELECT activity, COUNT(*) as count
            FROM error_reports
            GROUP BY activity
            ORDER BY count DESC
            LIMIT 10
        """)
        errors_by_activity = [dict(row) for row in cursor.fetchall()]

        # 자주 발생하는 오류 메시지 (상위 5개)
        cursor.execute("""
            SELECT error_message, COUNT(*) as count
            FROM error_reports
            GROUP BY error_message
            ORDER BY count DESC
            LIMIT 5
        """)
        common_errors = [dict(row) for row in cursor.fetchall()]

        # 최근 7일간 오류 추이
        cursor.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM error_reports
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """)
        recent_trend = [dict(row) for row in cursor.fetchall()]

        return {
            "total_errors": total_errors,
            "resolved_errors": resolved_errors,
            "unresolved_errors": unresolved_errors,
            "errors_by_level": errors_by_level,
            "errors_by_activity": errors_by_activity,
            "common_errors": common_errors,
            "recent_trend": recent_trend
        }
    finally:
        conn.close()

def get_error_by_id(error_id: int) -> Optional[Dict]:
    """특정 오류 보고 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
            FROM error_reports
            WHERE id = ?
        """, (error_id,))

        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def toggle_error_resolved(error_id: int) -> bool:
    """오류 해결 상태 토글 (트랜잭션 안전성 개선)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 현재 상태 확인
        cursor.execute("SELECT resolved FROM error_reports WHERE id = ?", (error_id,))
        row = cursor.fetchone()

        if not row:
            return False

        current_status = row['resolved']
        new_status = 0 if current_status else 1

        # 상태 업데이트 (단일 쿼리로 최적화)
        if new_status:
            cursor.execute("""
                UPDATE error_reports
                SET resolved = 1, resolved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (error_id,))
        else:
            cursor.execute("""
                UPDATE error_reports
                SET resolved = 0, resolved_at = NULL
                WHERE id = ?
            """, (error_id,))

        conn.commit()
        logger.info(f"Error {error_id} resolved status changed to {new_status}")
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to toggle error {error_id}: {str(e)}")
        return False
    finally:
        conn.close()

