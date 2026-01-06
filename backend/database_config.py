import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import logging

logger = logging.getLogger(__name__)

# 환경 변수에서 DB 설정 읽기
DATABASE_URL = os.getenv("DATABASE_URL")

# DATABASE_URL이 없으면 SQLite 사용 (기본값)
if not DATABASE_URL:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, "edupy.db")
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    ASYNC_DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"
    logger.info(f"Using SQLite database at {DATABASE_PATH}")
else:
    # PostgreSQL URL 변환 (postgresql:// -> postgresql+asyncpg://)
    if DATABASE_URL.startswith("postgresql://"):
        ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    else:
        ASYNC_DATABASE_URL = DATABASE_URL
    logger.info("Using PostgreSQL database")

# SQLAlchemy 엔진 생성
if "sqlite" in DATABASE_URL:
    # SQLite용 설정
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL용 설정
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    async_engine = create_async_engine(ASYNC_DATABASE_URL, pool_pre_ping=True)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Base 클래스
Base = declarative_base()


def get_db():
    """동기 DB 세션 생성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db():
    """비동기 DB 세션 생성"""
    async with AsyncSessionLocal() as session:
        yield session


def get_database_type():
    """현재 사용 중인 데이터베이스 타입 반환"""
    if "sqlite" in DATABASE_URL:
        return "sqlite"
    elif "postgresql" in DATABASE_URL:
        return "postgresql"
    else:
        return "unknown"
