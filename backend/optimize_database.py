"""
데이터베이스 최적화 스크립트
기존 테이블에 UNIQUE 제약조건 및 최적화 적용
"""

import sqlite3
import os
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "edupy.db")


def backup_database():
    """데이터베이스 백업"""
    backup_path = DATABASE_PATH + f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    import shutil
    shutil.copy2(DATABASE_PATH, backup_path)
    logger.info(f"Database backed up to: {backup_path}")
    return backup_path


def optimize_error_reports_table():
    """error_reports 테이블에 UNIQUE 제약조건 추가"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        logger.info("Starting optimization of error_reports table...")

        # 1. 기존 테이블 구조 확인
        cursor.execute("PRAGMA table_info(error_reports)")
        columns = cursor.fetchall()
        logger.info(f"Current table has {len(columns)} columns")

        # 2. 중복 데이터 확인
        cursor.execute("""
            SELECT level, activity, error_message, COUNT(*) as count
            FROM error_reports
            GROUP BY level, activity, error_message
            HAVING count > 1
        """)
        duplicates = cursor.fetchall()

        if duplicates:
            logger.warning(f"Found {len(duplicates)} groups of duplicate errors")
            for dup in duplicates[:5]:  # 처음 5개만 표시
                logger.warning(f"  - {dup[0]}/{dup[1]}: {dup[3]} duplicates")

        # 3. 임시 테이블 생성 (UNIQUE 제약조건 포함)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS error_reports_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT NOT NULL,
                activity TEXT NOT NULL,
                error_message TEXT NOT NULL,
                user_code TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                resolved BOOLEAN DEFAULT 0,
                resolved_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(level, activity, error_message)
            )
        """)
        logger.info("Created new table with UNIQUE constraint")

        # 4. 중복 제거하여 데이터 복사 (가장 최근 것만 유지)
        cursor.execute("""
            INSERT INTO error_reports_new
            (id, level, activity, error_message, user_code,
             timestamp, resolved, resolved_at, created_at)
            SELECT
                MIN(id) as id,
                level,
                activity,
                error_message,
                user_code,
                MAX(timestamp) as timestamp,
                MAX(resolved) as resolved,
                MAX(resolved_at) as resolved_at,
                MAX(created_at) as created_at
            FROM error_reports
            GROUP BY level, activity, error_message
        """)

        rows_copied = cursor.rowcount
        logger.info(f"Copied {rows_copied} unique error reports")

        # 5. 기존 테이블 백업 및 교체
        cursor.execute("DROP TABLE IF EXISTS error_reports_old")
        cursor.execute("ALTER TABLE error_reports RENAME TO error_reports_old")
        cursor.execute("ALTER TABLE error_reports_new RENAME TO error_reports")
        logger.info("Replaced old table with optimized version")

        # 6. 인덱스 재생성
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_level ON error_reports(level)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity ON error_reports(activity)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON error_reports(timestamp)")
        logger.info("Recreated indexes")

        conn.commit()
        logger.info("✓ Error reports table optimization completed successfully")

        return True

    except Exception as e:
        conn.rollback()
        logger.error(f"✗ Optimization failed: {e}")
        return False
    finally:
        conn.close()


def add_analytics_indexes():
    """분석 테이블에 추가 인덱스 생성"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        logger.info("Adding additional indexes for analytics...")

        # 복합 인덱스로 쿼리 성능 향상
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_sessions_active
            ON user_sessions(is_active, start_time)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_page_views_session_path
            ON page_views(session_id, page_path, timestamp)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_code_executions_curriculum
            ON code_executions(curriculum_type, timestamp)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_error_reports_resolved
            ON error_reports(resolved, created_at)
        """)

        conn.commit()
        logger.info("✓ Additional indexes created successfully")
        return True

    except Exception as e:
        conn.rollback()
        logger.error(f"✗ Index creation failed: {e}")
        return False
    finally:
        conn.close()


def vacuum_database():
    """데이터베이스 최적화 및 공간 회수"""
    conn = sqlite3.connect(DATABASE_PATH)

    try:
        logger.info("Running VACUUM to optimize database file...")
        conn.execute("VACUUM")
        logger.info("✓ Database vacuumed successfully")
        return True
    except Exception as e:
        logger.error(f"✗ VACUUM failed: {e}")
        return False
    finally:
        conn.close()


def analyze_database():
    """통계 수집하여 쿼리 플래너 최적화"""
    conn = sqlite3.connect(DATABASE_PATH)

    try:
        logger.info("Running ANALYZE to update statistics...")
        conn.execute("ANALYZE")
        logger.info("✓ Database analyzed successfully")
        return True
    except Exception as e:
        logger.error(f"✗ ANALYZE failed: {e}")
        return False
    finally:
        conn.close()


def get_database_stats():
    """데이터베이스 통계 출력"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        # 파일 크기
        file_size = os.path.getsize(DATABASE_PATH) / 1024 / 1024
        logger.info(f"\n{'='*60}")
        logger.info(f"Database Statistics")
        logger.info(f"{'='*60}")
        logger.info(f"File size: {file_size:.2f} MB")

        # 테이블별 row 수
        tables = ['error_reports', 'admin_users', 'user_sessions', 'page_views',
                  'code_executions', 'learning_progress']

        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                logger.info(f"{table}: {count:,} rows")
            except:
                logger.info(f"{table}: N/A")

        # 인덱스 개수
        cursor.execute("""
            SELECT COUNT(*) FROM sqlite_master
            WHERE type='index' AND name NOT LIKE 'sqlite_%'
        """)
        index_count = cursor.fetchone()[0]
        logger.info(f"Total indexes: {index_count}")
        logger.info(f"{'='*60}\n")

    finally:
        conn.close()


def main():
    """메인 최적화 프로세스"""
    logger.info("=" * 60)
    logger.info("Database Optimization Script")
    logger.info("=" * 60)

    if not os.path.exists(DATABASE_PATH):
        logger.error(f"Database not found: {DATABASE_PATH}")
        return

    # 1. 백업
    logger.info("\n[Step 1/6] Backing up database...")
    backup_path = backup_database()

    # 2. 현재 통계
    logger.info("\n[Step 2/6] Current database statistics...")
    get_database_stats()

    # 3. 테이블 최적화
    logger.info("\n[Step 3/6] Optimizing error_reports table...")
    if not optimize_error_reports_table():
        logger.error("Failed to optimize error_reports table. Aborting.")
        return

    # 4. 인덱스 추가
    logger.info("\n[Step 4/6] Adding additional indexes...")
    add_analytics_indexes()

    # 5. VACUUM
    logger.info("\n[Step 5/6] Vacuuming database...")
    vacuum_database()

    # 6. ANALYZE
    logger.info("\n[Step 6/6] Analyzing database...")
    analyze_database()

    # 최종 통계
    logger.info("\n[Final] Updated database statistics...")
    get_database_stats()

    logger.info("\n" + "=" * 60)
    logger.info("✓ Optimization completed successfully!")
    logger.info(f"✓ Backup saved at: {backup_path}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
