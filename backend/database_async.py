"""
최적화된 비동기 데이터베이스 모듈
- aiosqlite를 사용한 비동기 DB 작업
- 연결 풀링으로 성능 개선
- 캐싱 레이어로 반복 쿼리 최적화
"""

import os
import aiosqlite
import asyncio
from datetime import datetime
from typing import List, Dict, Optional
from functools import wraps
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "edupy.db")

# 연결 풀 설정
MAX_CONNECTIONS = 10
connection_pool = []
pool_lock = asyncio.Lock()

# 캐시 설정 (TTL: 5분, 최대 100개 항목)
query_cache = TTLCache(maxsize=100, ttl=300)
cache_lock = asyncio.Lock()


def cached(cache_key_func):
    """쿼리 결과 캐싱 데코레이터"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = cache_key_func(*args, **kwargs)

            # 캐시에서 조회
            async with cache_lock:
                if cache_key in query_cache:
                    logger.debug(f"Cache hit: {cache_key}")
                    return query_cache[cache_key]

            # 캐시 미스 - 실제 쿼리 실행
            result = await func(*args, **kwargs)

            # 결과 캐싱
            async with cache_lock:
                query_cache[cache_key] = result

            logger.debug(f"Cache miss: {cache_key}")
            return result
        return wrapper
    return decorator


async def get_db_connection():
    """연결 풀에서 데이터베이스 연결 획득"""
    async with pool_lock:
        if connection_pool:
            conn = connection_pool.pop()
            logger.debug(f"Reusing connection from pool ({len(connection_pool)} remaining)")
            return conn

    # 풀이 비어있으면 새 연결 생성
    conn = await aiosqlite.connect(DATABASE_PATH)
    conn.row_factory = aiosqlite.Row
    logger.debug("Created new database connection")
    return conn


async def return_db_connection(conn):
    """연결을 풀로 반환"""
    async with pool_lock:
        if len(connection_pool) < MAX_CONNECTIONS:
            connection_pool.append(conn)
            logger.debug(f"Returned connection to pool ({len(connection_pool)} connections)")
        else:
            await conn.close()
            logger.debug("Pool full, closed connection")


async def init_database():
    """데이터베이스 초기화 및 테이블 생성"""
    conn = await get_db_connection()

    try:
        # 오류 보고 테이블 생성 (UNIQUE 제약조건 추가로 중복 방지)
        await conn.execute("""
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(level, activity, error_message)
            )
        """)

        # 관리자 테이블 생성
        await conn.execute("""
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

        # 인덱스 생성
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_level ON error_reports(level)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_activity ON error_reports(activity)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON error_reports(timestamp)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_username ON admin_users(username)")

        await conn.commit()

        # 분석 테이블 초기화
        await init_analytics_tables()

        logger.info("Database initialized successfully")
    finally:
        await return_db_connection(conn)


async def save_error_report(level: str, activity: str, error_message: str, user_code: str, timestamp: str) -> Dict:
    """
    오류 보고 저장 (UNIQUE 제약조건으로 자동 중복 방지)

    Returns:
        dict: {
            'success': bool,
            'error_id': int (새로 저장된 경우),
            'duplicate': bool,
            'existing_error': dict (중복인 경우)
        }
    """
    conn = await get_db_connection()

    try:
        # INSERT OR IGNORE로 중복 시 자동 무시
        cursor = await conn.execute("""
            INSERT OR IGNORE INTO error_reports (level, activity, error_message, user_code, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (level, activity, error_message, user_code, timestamp))

        error_id = cursor.lastrowid

        # lastrowid가 0이면 중복으로 인해 삽입되지 않음
        if error_id == 0:
            # 기존 오류 조회
            cursor = await conn.execute("""
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, created_at
                FROM error_reports
                WHERE level = ? AND activity = ? AND error_message = ?
            """, (level, activity, error_message))

            row = await cursor.fetchone()
            if row:
                existing_error = {
                    'id': row['id'],
                    'level': row['level'],
                    'activity': row['activity'],
                    'error_message': row['error_message'],
                    'user_code': row['user_code'],
                    'timestamp': row['timestamp'],
                    'resolved': bool(row['resolved']),
                    'created_at': row['created_at']
                }
                logger.info(f"Duplicate error found: ID {existing_error['id']}")
                return {
                    'success': False,
                    'duplicate': True,
                    'existing_error': existing_error,
                    'message': '이미 접수된 오류입니다.'
                }

        await conn.commit()
        logger.info(f"New error report saved with ID: {error_id}")
        return {
            'success': True,
            'duplicate': False,
            'error_id': error_id,
            'message': '오류가 성공적으로 접수되었습니다.'
        }
    except Exception as e:
        await conn.rollback()
        logger.error(f"Error saving error report: {e}")
        raise
    finally:
        await return_db_connection(conn)


async def get_error_reports(limit: int = 100, offset: int = 0, filter_status: str = 'all') -> List[Dict]:
    """오류 보고 목록 조회"""
    conn = await get_db_connection()

    try:
        if filter_status == 'resolved':
            query = """
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                WHERE resolved = 1
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """
        elif filter_status == 'unresolved':
            query = """
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                WHERE resolved = 0
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """
        else:
            query = """
                SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
                FROM error_reports
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """

        cursor = await conn.execute(query, (limit, offset))
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await return_db_connection(conn)


@cached(lambda: "error_statistics")
async def get_error_statistics() -> Dict:
    """오류 통계 조회 (캐싱 적용)"""
    conn = await get_db_connection()

    try:
        # 전체 오류 수 및 해결된 오류 수를 한 번에 조회
        cursor = await conn.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved
            FROM error_reports
        """)
        counts = await cursor.fetchone()
        total_errors = counts['total'] or 0
        resolved_errors = counts['resolved'] or 0
        unresolved_errors = total_errors - resolved_errors

        # 레벨별 오류 수
        cursor = await conn.execute("""
            SELECT level, COUNT(*) as count
            FROM error_reports
            GROUP BY level
            ORDER BY count DESC
        """)
        errors_by_level = [dict(row) for row in await cursor.fetchall()]

        # 활동별 오류 수
        cursor = await conn.execute("""
            SELECT activity, COUNT(*) as count
            FROM error_reports
            GROUP BY activity
            ORDER BY count DESC
            LIMIT 10
        """)
        errors_by_activity = [dict(row) for row in await cursor.fetchall()]

        # 자주 발생하는 오류 메시지
        cursor = await conn.execute("""
            SELECT error_message, COUNT(*) as count
            FROM error_reports
            GROUP BY error_message
            ORDER BY count DESC
            LIMIT 5
        """)
        common_errors = [dict(row) for row in await cursor.fetchall()]

        # 최근 7일간 오류 추이
        cursor = await conn.execute("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM error_reports
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """)
        recent_trend = [dict(row) for row in await cursor.fetchall()]

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
        await return_db_connection(conn)


async def get_error_by_id(error_id: int) -> Optional[Dict]:
    """특정 오류 보고 조회"""
    conn = await get_db_connection()

    try:
        cursor = await conn.execute("""
            SELECT id, level, activity, error_message, user_code, timestamp, resolved, resolved_at, created_at
            FROM error_reports
            WHERE id = ?
        """, (error_id,))

        row = await cursor.fetchone()
        return dict(row) if row else None
    finally:
        await return_db_connection(conn)


async def toggle_error_resolved(error_id: int) -> bool:
    """오류 해결 상태 토글"""
    conn = await get_db_connection()

    try:
        cursor = await conn.execute("SELECT resolved FROM error_reports WHERE id = ?", (error_id,))
        row = await cursor.fetchone()

        if not row:
            return False

        current_status = row['resolved']
        new_status = 0 if current_status else 1

        if new_status:
            await conn.execute("""
                UPDATE error_reports
                SET resolved = 1, resolved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (error_id,))
        else:
            await conn.execute("""
                UPDATE error_reports
                SET resolved = 0, resolved_at = NULL
                WHERE id = ?
            """, (error_id,))

        await conn.commit()

        # 캐시 무효화
        async with cache_lock:
            query_cache.clear()

        logger.info(f"Error {error_id} resolved status changed to {new_status}")
        return True
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to toggle error {error_id}: {str(e)}")
        return False
    finally:
        await return_db_connection(conn)


async def save_fixed_code(error_id: int, fixed_code: str, explanation: str) -> bool:
    """AI가 수정한 코드를 데이터베이스에 저장"""
    conn = await get_db_connection()

    try:
        await conn.execute("""
            UPDATE error_reports
            SET fixed_code = ?, fix_explanation = ?
            WHERE id = ?
        """, (fixed_code, explanation, error_id))

        await conn.commit()
        logger.info(f"Fixed code saved for error {error_id}")
        return True
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to save fixed code: {e}")
        return False
    finally:
        await return_db_connection(conn)


# ==================== 관리자 관련 함수 ====================

async def create_admin_user(username: str, password_hash: str) -> bool:
    """관리자 사용자 생성"""
    conn = await get_db_connection()

    try:
        await conn.execute("""
            INSERT INTO admin_users (username, password_hash)
            VALUES (?, ?)
        """, (username, password_hash))

        await conn.commit()
        logger.info(f"Admin user created: {username}")
        return True
    except aiosqlite.IntegrityError:
        logger.warning(f"Admin user already exists: {username}")
        return False
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to create admin user: {e}")
        return False
    finally:
        await return_db_connection(conn)


async def get_admin_user(username: str) -> Optional[Dict]:
    """관리자 사용자 조회"""
    conn = await get_db_connection()

    try:
        cursor = await conn.execute("""
            SELECT id, username, password_hash, totp_secret, totp_enabled, created_at, last_login
            FROM admin_users
            WHERE username = ?
        """, (username,))

        row = await cursor.fetchone()
        return dict(row) if row else None
    finally:
        await return_db_connection(conn)


async def update_admin_totp(username: str, totp_secret: str, enabled: bool = True) -> bool:
    """관리자 TOTP 설정 업데이트"""
    conn = await get_db_connection()

    try:
        await conn.execute("""
            UPDATE admin_users
            SET totp_secret = ?, totp_enabled = ?
            WHERE username = ?
        """, (totp_secret, 1 if enabled else 0, username))

        await conn.commit()
        logger.info(f"TOTP updated for admin: {username}")
        return True
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to update TOTP: {e}")
        return False
    finally:
        await return_db_connection(conn)


async def update_admin_last_login(username: str) -> bool:
    """관리자 마지막 로그인 시간 업데이트"""
    conn = await get_db_connection()

    try:
        await conn.execute("""
            UPDATE admin_users
            SET last_login = CURRENT_TIMESTAMP
            WHERE username = ?
        """, (username,))

        await conn.commit()
        return True
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to update last login: {e}")
        return False
    finally:
        await return_db_connection(conn)


# ==================== 분석 관련 함수 ====================

async def init_analytics_tables():
    """분석 테이블 초기화"""
    conn = await get_db_connection()

    try:
        # 사용자 세션 테이블
        await conn.execute("""
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
        await conn.execute("""
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
        await conn.execute("""
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
        await conn.execute("""
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
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON user_sessions(start_time)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_code_executions_session_id ON code_executions(session_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_code_executions_timestamp ON code_executions(timestamp)")

        await conn.commit()
        logger.info("Analytics tables initialized successfully")
    finally:
        await return_db_connection(conn)


@cached(lambda days=7: f"analytics_overview_{days}")
async def get_analytics_overview(days: int = 7) -> Dict:
    """분석 개요 통계 조회 (캐싱 적용)"""
    conn = await get_db_connection()

    try:
        # 오늘 방문자 수
        cursor = await conn.execute("""
            SELECT COUNT(DISTINCT session_id) as today_visitors
            FROM user_sessions
            WHERE DATE(start_time) = DATE('now')
        """)
        today_visitors = (await cursor.fetchone())['today_visitors'] or 0

        # 총 세션 수
        cursor = await conn.execute("""
            SELECT COUNT(*) as total_sessions
            FROM user_sessions
            WHERE start_time >= datetime('now', ?)
        """, (f'-{days} days',))
        total_sessions = (await cursor.fetchone())['total_sessions'] or 0

        # 코드 실행 횟수
        cursor = await conn.execute("""
            SELECT COUNT(*) as total_executions
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        total_executions = (await cursor.fetchone())['total_executions'] or 0

        # 현재 활성 사용자
        cursor = await conn.execute("""
            SELECT COUNT(DISTINCT session_id) as active_users
            FROM page_views
            WHERE timestamp >= datetime('now', '-5 minutes')
        """)
        active_users = (await cursor.fetchone())['active_users'] or 0

        # 총 페이지 조회수
        cursor = await conn.execute("""
            SELECT COUNT(*) as total_page_views
            FROM page_views
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        total_page_views = (await cursor.fetchone())['total_page_views'] or 0

        # 평균 세션 시간
        cursor = await conn.execute("""
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
        avg_session_duration = (await cursor.fetchone())['avg_session_duration'] or 0

        # 코드 실행 성공률
        cursor = await conn.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN error_message IS NULL OR error_message = '' THEN 1 ELSE 0 END) as success
            FROM code_executions
            WHERE timestamp >= datetime('now', ?)
        """, (f'-{days} days',))
        exec_stats = await cursor.fetchone()
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
        await return_db_connection(conn)


async def save_session(session_id: str, user_agent: str, device_type: str, browser: str,
                       os: str, screen_width: int, screen_height: int) -> bool:
    """새 세션 저장"""
    conn = await get_db_connection()

    try:
        await conn.execute("""
            INSERT OR IGNORE INTO user_sessions
            (session_id, user_agent, device_type, browser, os, screen_width, screen_height)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (session_id, user_agent, device_type, browser, os, screen_width, screen_height))

        await conn.commit()
        return True
    except Exception as e:
        await conn.rollback()
        logger.error(f"Failed to save session: {e}")
        return False
    finally:
        await return_db_connection(conn)


async def clear_cache():
    """캐시 수동 클리어 (데이터 업데이트 후 호출)"""
    async with cache_lock:
        query_cache.clear()
    logger.info("Query cache cleared")


async def close_all_connections():
    """모든 데이터베이스 연결 종료 (애플리케이션 종료 시)"""
    async with pool_lock:
        while connection_pool:
            conn = connection_pool.pop()
            await conn.close()
    logger.info("All database connections closed")
