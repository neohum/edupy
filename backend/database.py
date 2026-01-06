import os
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import logging
from functools import wraps
from cachetools import TTLCache
import threading

logger = logging.getLogger(__name__)

# 캐시 설정 (TTL: 5분, 최대 100개 항목)
_query_cache = TTLCache(maxsize=100, ttl=300)
_cache_lock = threading.Lock()


def cached(cache_key_func):
    """쿼리 결과 캐싱 데코레이터"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = cache_key_func(*args, **kwargs)

            # 캐시에서 조회
            with _cache_lock:
                if cache_key in _query_cache:
                    logger.debug(f"Cache hit: {cache_key}")
                    return _query_cache[cache_key]

            # 캐시 미스 - 실제 쿼리 실행
            result = func(*args, **kwargs)

            # 결과 캐싱
            with _cache_lock:
                _query_cache[cache_key] = result

            logger.debug(f"Cache miss: {cache_key}")
            return result
        return wrapper
    return decorator


def clear_cache():
    """캐시 수동 클리어"""
    with _cache_lock:
        _query_cache.clear()
    logger.info("Query cache cleared")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "edupy.db")

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

    # 분석 테이블 초기화
    init_analytics_tables()

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
    오류 보고 저장 (최적화된 중복 체크)

    Returns:
        dict: {
            'success': bool,
            'error_id': int (새로 저장된 경우),
            'duplicate': bool,
            'existing_error': dict (중복인 경우)
        }
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # INSERT OR IGNORE 시도 (UNIQUE 제약조건이 있다면 중복 시 무시)
        cursor.execute("""
            INSERT OR IGNORE INTO error_reports (level, activity, error_message, user_code, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (level, activity, error_message, user_code, timestamp))

        error_id = cursor.lastrowid

        # lastrowid가 0이면 중복으로 인해 삽입되지 않음
        if error_id == 0 or cursor.rowcount == 0:
            # 기존 오류 조회
            existing_error = check_duplicate_error(level, activity, error_message)
            if existing_error:
                logger.info(f"Duplicate error found: ID {existing_error['id']}")
                return {
                    'success': False,
                    'duplicate': True,
                    'existing_error': existing_error,
                    'message': '이미 접수된 오류입니다.'
                }

        conn.commit()

        # 캐시 무효화
        clear_cache()

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

@cached(lambda: "error_statistics")
def get_error_statistics() -> Dict:
    """오류 통계 조회 (캐싱 적용)"""
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

        # 캐시 무효화
        clear_cache()

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

# ==================== 분석 관련 함수 ====================

def init_analytics_tables():
    """분석 테이블 초기화"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 사용자 세션 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            user_agent TEXT,
            device_type TEXT,
            browser TEXT,
            os TEXT,
            screen_width INTEGER,
            screen_height INTEGER,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            is_active BOOLEAN DEFAULT 1
        )
    """)

    # 페이지 조회 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            page_path TEXT NOT NULL,
            page_title TEXT,
            referrer TEXT,
            duration_seconds INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 코드 실행 기록 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS code_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            page_path TEXT,
            curriculum_type TEXT,
            level_name TEXT,
            activity_name TEXT,
            execution_result TEXT,
            error_message TEXT,
            execution_time_ms INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 학습 진도 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            curriculum_type TEXT,
            level_index INTEGER,
            activity_index INTEGER,
            total_activities INTEGER,
            completed_count INTEGER,
            completion_percentage REAL,
            last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 인덱스 생성
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON user_sessions(start_time)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_code_executions_session_id ON code_executions(session_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_code_executions_timestamp ON code_executions(timestamp)")

    conn.commit()
    conn.close()
    logger.info("Analytics tables initialized successfully")

def save_session(session_id: str, user_agent: str, device_type: str, browser: str,
                 os: str, screen_width: int, screen_height: int) -> bool:
    """새 세션 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT OR IGNORE INTO user_sessions
            (session_id, user_agent, device_type, browser, os, screen_width, screen_height)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (session_id, user_agent, device_type, browser, os, screen_width, screen_height))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save session: {e}")
        return False
    finally:
        conn.close()

def update_session_end(session_id: str) -> bool:
    """세션 종료 시간 업데이트"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE user_sessions
            SET end_time = CURRENT_TIMESTAMP, is_active = 0
            WHERE session_id = ?
        """, (session_id,))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to update session end: {e}")
        return False
    finally:
        conn.close()

def save_page_view(session_id: str, page_path: str, page_title: str, referrer: str) -> int:
    """페이지 조회 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO page_views (session_id, page_path, page_title, referrer)
            VALUES (?, ?, ?, ?)
        """, (session_id, page_path, page_title, referrer))

        view_id = cursor.lastrowid
        conn.commit()
        return view_id
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save page view: {e}")
        return -1
    finally:
        conn.close()

def update_page_view_duration(session_id: str, page_path: str, duration_seconds: int) -> bool:
    """페이지 체류 시간 업데이트"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE page_views
            SET duration_seconds = ?
            WHERE id = (
                SELECT id FROM page_views
                WHERE session_id = ? AND page_path = ?
                ORDER BY timestamp DESC
                LIMIT 1
            )
        """, (duration_seconds, session_id, page_path))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to update page view duration: {e}")
        return False
    finally:
        conn.close()

def save_code_execution(session_id: str, page_path: str, curriculum_type: str,
                        level_name: str, activity_name: str, execution_result: str,
                        error_message: str, execution_time_ms: int) -> int:
    """코드 실행 기록 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO code_executions
            (session_id, page_path, curriculum_type, level_name, activity_name,
             execution_result, error_message, execution_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (session_id, page_path, curriculum_type, level_name, activity_name,
              execution_result, error_message, execution_time_ms))

        exec_id = cursor.lastrowid
        conn.commit()
        return exec_id
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save code execution: {e}")
        return -1
    finally:
        conn.close()

def save_learning_progress(session_id: str, curriculum_type: str, level_index: int,
                          activity_index: int, total_activities: int,
                          completed_count: int, completion_percentage: float) -> bool:
    """학습 진도 저장"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 기존 진도 확인 및 업데이트 또는 새로 생성
        cursor.execute("""
            INSERT INTO learning_progress
            (session_id, curriculum_type, level_index, activity_index,
             total_activities, completed_count, completion_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_id, curriculum_type) DO UPDATE SET
                level_index = excluded.level_index,
                activity_index = excluded.activity_index,
                total_activities = excluded.total_activities,
                completed_count = excluded.completed_count,
                completion_percentage = excluded.completion_percentage,
                last_activity_at = CURRENT_TIMESTAMP
        """, (session_id, curriculum_type, level_index, activity_index,
              total_activities, completed_count, completion_percentage))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save learning progress: {e}")
        return False
    finally:
        conn.close()

@cached(lambda days=7: f"analytics_overview_{days}")
def get_analytics_overview(days: int = 7) -> Dict:
    """분석 개요 통계 조회 (캐싱 적용)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 오늘 방문자 수
        cursor.execute("""
            SELECT COUNT(DISTINCT session_id) as today_visitors
            FROM user_sessions
            WHERE DATE(start_time) = DATE('now')
        """)
        today_visitors = cursor.fetchone()['today_visitors'] or 0

        # 총 세션 수 (지정된 기간)
        cursor.execute("""
            SELECT COUNT(*) as total_sessions
            FROM user_sessions
            WHERE start_time >= datetime('now', ?)
        """, (f'-{days} days',))
        total_sessions = cursor.fetchone()['total_sessions'] or 0

        # 코드 실행 횟수 (지정된 기간)
        cursor.execute("""
            SELECT COUNT(*) as total_executions
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        total_executions = cursor.fetchone()['total_executions'] or 0

        # 현재 활성 사용자 (최근 5분 이내 활동)
        cursor.execute("""
            SELECT COUNT(DISTINCT session_id) as active_users
            FROM page_views
            WHERE timestamp >= datetime('now', '-5 minutes')
        """)
        active_users = cursor.fetchone()['active_users'] or 0

        # 총 페이지 조회수 (지정된 기간)
        cursor.execute("""
            SELECT COUNT(*) as total_page_views
            FROM page_views
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        total_page_views = cursor.fetchone()['total_page_views'] or 0

        # 평균 세션 시간 (초)
        cursor.execute("""
            SELECT AVG(
                CASE
                    WHEN end_time IS NOT NULL
                    THEN (julianday(end_time) - julianday(start_time)) * 86400
                    ELSE 0
                END
            ) as avg_session_duration
            FROM user_sessions
            WHERE start_time >= datetime('now', ?) AND end_time IS NOT NULL
        """, (f'-{days} days',))
        avg_session_duration = cursor.fetchone()['avg_session_duration'] or 0

        # 코드 실행 성공률
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN error_message IS NULL OR error_message = '' THEN 1 ELSE 0 END) as success
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        exec_stats = cursor.fetchone()
        success_rate = (exec_stats['success'] / exec_stats['total'] * 100) if exec_stats['total'] > 0 else 0

        return {
            "today_visitors": today_visitors,
            "total_sessions": total_sessions,
            "total_executions": total_executions,
            "active_users": active_users,
            "total_page_views": total_page_views,
            "avg_session_duration": round(avg_session_duration, 2),
            "code_success_rate": round(success_rate, 1)
        }
    finally:
        conn.close()

def get_daily_visitors(days: int = 7) -> List[Dict]:
    """일별 방문자 추이"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                DATE(start_time) as date,
                COUNT(DISTINCT session_id) as visitors,
                COUNT(*) as sessions
            FROM user_sessions
            WHERE start_time >= datetime('now', ?)
            GROUP BY DATE(start_time)
            ORDER BY date ASC
        """, (f'-{days} days',))

        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_page_view_stats(days: int = 7) -> List[Dict]:
    """페이지별 조회수 통계"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                page_path,
                page_title,
                COUNT(*) as views,
                AVG(duration_seconds) as avg_duration
            FROM page_views
            WHERE timestamp >= datetime('now', ?)
            GROUP BY page_path
            ORDER BY views DESC
            LIMIT 10
        """, (f'-{days} days',))

        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

@cached(lambda: "device_distribution")
def get_device_distribution() -> Dict:
    """기기 및 브라우저 분포 (캐싱 적용)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 기기 유형 분포
        cursor.execute("""
            SELECT device_type, COUNT(*) as count
            FROM user_sessions
            WHERE device_type IS NOT NULL
            GROUP BY device_type
            ORDER BY count DESC
        """)
        devices = [dict(row) for row in cursor.fetchall()]

        # 브라우저 분포
        cursor.execute("""
            SELECT browser, COUNT(*) as count
            FROM user_sessions
            WHERE browser IS NOT NULL
            GROUP BY browser
            ORDER BY count DESC
        """)
        browsers = [dict(row) for row in cursor.fetchall()]

        # OS 분포
        cursor.execute("""
            SELECT os, COUNT(*) as count
            FROM user_sessions
            WHERE os IS NOT NULL
            GROUP BY os
            ORDER BY count DESC
        """)
        operating_systems = [dict(row) for row in cursor.fetchall()]

        return {
            "devices": devices,
            "browsers": browsers,
            "operating_systems": operating_systems
        }
    finally:
        conn.close()

@cached(lambda days=7: f"code_execution_stats_{days}")
def get_code_execution_stats(days: int = 7) -> Dict:
    """코드 실행 통계 (캐싱 적용)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 일별 실행 추이
        cursor.execute("""
            SELECT
                DATE(timestamp) as date,
                COUNT(*) as total,
                SUM(CASE WHEN error_message IS NULL OR error_message = '' THEN 1 ELSE 0 END) as success,
                SUM(CASE WHEN error_message IS NOT NULL AND error_message != '' THEN 1 ELSE 0 END) as failed
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
            GROUP BY DATE(timestamp)
            ORDER BY date ASC
        """, (f'-{days} days',))
        daily_stats = [dict(row) for row in cursor.fetchall()]

        # 커리큘럼별 실행 통계
        cursor.execute("""
            SELECT
                curriculum_type,
                COUNT(*) as total,
                SUM(CASE WHEN error_message IS NULL OR error_message = '' THEN 1 ELSE 0 END) as success
            FROM code_executions
            WHERE timestamp >= datetime('now', ?) AND curriculum_type IS NOT NULL
            GROUP BY curriculum_type
            ORDER BY total DESC
        """, (f'-{days} days',))
        curriculum_stats = [dict(row) for row in cursor.fetchall()]

        # 평균 실행 시간
        cursor.execute("""
            SELECT AVG(execution_time_ms) as avg_time
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        avg_time = cursor.fetchone()['avg_time'] or 0

        return {
            "daily_stats": daily_stats,
            "curriculum_stats": curriculum_stats,
            "avg_execution_time_ms": round(avg_time, 2)
        }
    finally:
        conn.close()

def get_recent_activity(limit: int = 20) -> List[Dict]:
    """최근 활동 목록"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 페이지 조회와 코드 실행을 합쳐서 최근 활동 조회
        cursor.execute("""
            SELECT * FROM (
                SELECT
                    'page_view' as type,
                    session_id,
                    page_path as detail,
                    page_title as title,
                    timestamp
                FROM page_views
                UNION ALL
                SELECT
                    'code_execution' as type,
                    session_id,
                    COALESCE(curriculum_type, 'unknown') || ' - ' || COALESCE(level_name, '') as detail,
                    CASE WHEN error_message IS NULL OR error_message = '' THEN '성공' ELSE '실패' END as title,
                    timestamp
                FROM code_executions
            )
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))

        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_hourly_activity(days: int = 1) -> List[Dict]:
    """시간대별 활동 통계"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                strftime('%H', timestamp) as hour,
                COUNT(*) as activity_count
            FROM page_views
            WHERE timestamp >= datetime('now', ?)
            GROUP BY strftime('%H', timestamp)
            ORDER BY hour ASC
        """, (f'-{days} days',))

        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()
