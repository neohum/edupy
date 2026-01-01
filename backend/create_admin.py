#!/usr/bin/env python3
"""
관리자 계정 생성 스크립트

환경 변수:
  ADMIN_USERNAME: 관리자 사용자명 (필수)
  ADMIN_PASSWORD: 관리자 비밀번호 (필수)

사용법:
  ADMIN_USERNAME=admin ADMIN_PASSWORD=your_password python create_admin.py
"""
import os
import bcrypt
from database import init_database, create_admin_user, get_admin_user
from dotenv import load_dotenv
import logging

# .env 파일 로드
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # 데이터베이스 초기화
    init_database()

    # 환경 변수에서 관리자 계정 정보 가져오기
    username = os.getenv("ADMIN_USERNAME")
    password = os.getenv("ADMIN_PASSWORD")

    if not username or not password:
        logger.error("❌ ADMIN_USERNAME과 ADMIN_PASSWORD 환경 변수를 설정해주세요.")
        logger.info("예시: ADMIN_USERNAME=admin ADMIN_PASSWORD=your_password python create_admin.py")
        return

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
        logger.info("⚠️  Please change the password after first login.")
    else:
        logger.error(f"❌ Failed to create admin user '{username}'")

if __name__ == "__main__":
    main()

