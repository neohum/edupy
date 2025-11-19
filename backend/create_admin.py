#!/usr/bin/env python3
"""
관리자 계정 생성 스크립트
"""
import bcrypt
from database import init_database, create_admin_user, get_admin_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # 데이터베이스 초기화
    init_database()

    # 관리자 계정 정보
    username = "neohum"
    password = "min9610012@"

    # 기존 계정 확인
    existing_user = get_admin_user(username)
    if existing_user:
        logger.info(f"Admin user '{username}' already exists.")
        return

    # 비밀번호 해싱 (bcrypt 직접 사용)
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    # 관리자 계정 생성
    if create_admin_user(username, password_hash):
        logger.info(f"✅ Admin user '{username}' created successfully!")
        logger.info(f"Username: {username}")
        logger.info(f"Password: {password}")
        logger.info("⚠️  Please change the password after first login.")
    else:
        logger.error(f"❌ Failed to create admin user '{username}'")

if __name__ == "__main__":
    main()

