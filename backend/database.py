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
            fixed_code TEXT,
            fix_explanation TEXT,
            timestamp TEXT NOT NULL,
            resolved BOOLEAN DEFAULT 0,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 관리자 테이블 생성
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            totp_secret TEXT,
            totp_enabled BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
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

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_username ON admin_users(username)
    """)

    conn.commit()
    conn.close()

    logger.info("Database initialized successfully")

def check_duplicate_error(level: str, activity: str, error_message: str) -> Optional[Dict]:
    """
    중복 오류 체크

    Args:
        level: 레벨 정보
        activity: 활동 정보
        error_message: 오류 메시지

    Returns:
        중복된 오류가 있으면 해당 오류 정보 반환, 없으면 None
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, level, activity, error_message, user_code, timestamp, resolved, created_at
            FROM error_reports
            WHERE level = ? AND activity = ? AND error_message = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (level, activity, error_message))

        row = cursor.fetchone()

        if row:
            return {
                'id': row['id'],
                'level': row['level'],
                'activity': row['activity'],
                'error_message': row['error_message'],
                'user_code': row['user_code'],
                'timestamp': row['timestamp'],
                'resolved': bool(row['resolved']),
                'created_at': row['created_at']
            }
        return None
    finally:
        conn.close()


def save_error_report(level: str, activity: str, error_message: str, user_code: str, timestamp: str) -> Dict:
    """
    오류 보고 저장 (중복 체크 포함)

    Returns:
        dict: {
            'success': bool,
            'error_id': int (새로 저장된 경우),
            'duplicate': bool,
            'existing_error': dict (중복인 경우)
        }
    """
    # 중복 체크
    existing_error = check_duplicate_error(level, activity, error_message)

    if existing_error:
        logger.info(f"Duplicate error found: ID {existing_error['id']}")
        return {
            'success': False,
            'duplicate': True,
            'existing_error': existing_error,
            'message': '이미 접수된 오류입니다.'
        }

    # 중복이 아니면 새로 저장
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO error_reports (level, activity, error_message, user_code, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (level, activity, error_message, user_code, timestamp))

        error_id = cursor.lastrowid
        conn.commit()

        logger.info(f"New error report saved with ID: {error_id}")
        return {
            'success': True,
            'duplicate': False,
            'error_id': error_id,
            'message': '오류가 성공적으로 접수되었습니다.'
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error saving error report: {e}")
        raise
    finally:
        conn.close()

def check_duplicate_error_by_page(page: str, error_message: str) -> Optional[Dict]:
    """
    페이지와 오류 메시지로 중복 오류 확인 (파이게임 만들기용)

    Args:
        page: 페이지 이름 (예: "파이게임 만들기 - 사과 먹기 게임")
        error_message: 오류 메시지

    Returns:
        중복된 오류가 있으면 해당 오류 정보 반환, 없으면 None
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # level 필드에 페이지 정보가 저장되어 있다고 가정
        cursor.execute("""
            SELECT id, level, activity, error_message, user_code, timestamp, resolved, created_at
            FROM error_reports
            WHERE level = ? AND error_message LIKE ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (page, f"%{error_message}%"))

        row = cursor.fetchone()

        if row:
            return {
                'id': row['id'],
                'level': row['level'],
                'activity': row['activity'],
                'error_message': row['error_message'],
                'user_code': row['user_code'],
                'timestamp': row['timestamp'],
                'resolved': bool(row['resolved']),
                'created_at': row['created_at']
            }
        return None
    finally:
        conn.close()

def save_new_error_report(page: str, error_type: str, description: str, code: str, output: str) -> int:
    """
    새로운 오류 보고 저장 (파이게임 만들기용)

    Args:
        page: 페이지 이름
        error_type: 오류 유형
        description: 오류 설명
        code: 사용자 코드
        output: 실행 결과

    Returns:
        저장된 오류의 ID
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        cursor.execute("""
            INSERT INTO error_reports (level, activity, error_message, user_code, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (page, error_type, output, code, timestamp))

        error_id = cursor.lastrowid
        conn.commit()

        logger.info(f"New error report saved with ID: {error_id}")
        return error_id
    except Exception as e:
        conn.rollback()
        logger.error(f"Error saving new error report: {e}")
        raise
    finally:
        conn.close()

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
        total_errors = counts['total'] or 0
        resolved_errors = counts['resolved'] or 0
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

def save_fixed_code(error_id: int, fixed_code: str, explanation: str) -> bool:
    """AI가 수정한 코드를 데이터베이스에 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE error_reports
            SET fixed_code = ?, fix_explanation = ?
            WHERE id = ?
        """, (fixed_code, explanation, error_id))

        conn.commit()
        logger.info(f"Fixed code saved for error {error_id}")
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save fixed code: {e}")
        return False
    finally:
        conn.close()

# ==================== 관리자 관련 함수 ====================

def create_admin_user(username: str, password_hash: str) -> bool:
    """관리자 사용자 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO admin_users (username, password_hash)
            VALUES (?, ?)
        """, (username, password_hash))

        conn.commit()
        logger.info(f"Admin user created: {username}")
        return True
    except sqlite3.IntegrityError:
        logger.warning(f"Admin user already exists: {username}")
        return False
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to create admin user: {e}")
        return False
    finally:
        conn.close()

def get_admin_user(username: str) -> Optional[Dict]:
    """관리자 사용자 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, username, password_hash, totp_secret, totp_enabled, created_at, last_login
            FROM admin_users
            WHERE username = ?
        """, (username,))

        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def update_admin_totp(username: str, totp_secret: str, enabled: bool = True) -> bool:
    """관리자 TOTP 설정 업데이트"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE admin_users
            SET totp_secret = ?, totp_enabled = ?
            WHERE username = ?
        """, (totp_secret, 1 if enabled else 0, username))

        conn.commit()
        logger.info(f"TOTP updated for admin: {username}")
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to update TOTP: {e}")
        return False
    finally:
        conn.close()

def update_admin_last_login(username: str) -> bool:
    """관리자 마지막 로그인 시간 업데이트"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE admin_users
            SET last_login = CURRENT_TIMESTAMP
            WHERE username = ?
        """, (username,))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to update last login: {e}")
        return False
    finally:
        conn.close()

