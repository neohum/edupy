#!/bin/bash

echo "========================================="
echo "  EduPy 오류 보고 이메일 업데이트"
echo "========================================="
echo ""

# 서버 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일을 찾을 수 없습니다."
    echo "   현재 디렉토리: $(pwd)"
    exit 1
fi

# 백업
echo "1. 기존 .env 파일 백업 중..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ 백업 완료"
echo ""

# 이메일 업데이트
echo "2. ERROR_REPORT_EMAIL 업데이트 중..."
if grep -q "^ERROR_REPORT_EMAIL=" .env; then
    # 이미 존재하면 교체
    sed -i.bak 's/^ERROR_REPORT_EMAIL=.*/ERROR_REPORT_EMAIL=neohum77@gmail.com/' .env
    echo "✅ ERROR_REPORT_EMAIL 업데이트 완료"
else
    # 없으면 추가
    echo "ERROR_REPORT_EMAIL=neohum77@gmail.com" >> .env
    echo "✅ ERROR_REPORT_EMAIL 추가 완료"
fi
echo ""

# 현재 설정 확인
echo "3. 현재 설정 확인:"
echo "-----------------------------------"
grep "ERROR_REPORT_EMAIL" .env || echo "ERROR_REPORT_EMAIL 설정을 찾을 수 없습니다"
grep "FROM_EMAIL" .env || echo "FROM_EMAIL 설정을 찾을 수 없습니다"
grep "RESEND_API_KEY" .env | sed 's/=.*/=***HIDDEN***/' || echo "RESEND_API_KEY 설정을 찾을 수 없습니다"
echo "-----------------------------------"
echo ""

# 도커 재시작 확인
read -p "도커 컨테이너를 재시작하시겠습니까? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "4. 도커 컨테이너 재시작 중..."

    # Docker Compose 사용
    if [ -f "docker-compose.yml" ]; then
        echo "   docker-compose down..."
        docker-compose down

        echo "   docker-compose up -d..."
        docker-compose up -d

        echo "✅ 컨테이너 재시작 완료"
        echo ""

        # 로그 확인
        echo "5. 백엔드 로그 확인 (10초):"
        echo "-----------------------------------"
        timeout 10 docker-compose logs -f backend || true
        echo "-----------------------------------"
    else
        echo "❌ docker-compose.yml을 찾을 수 없습니다."
        echo "   수동으로 컨테이너를 재시작하세요:"
        echo "   docker restart edupy-backend"
    fi
else
    echo ""
    echo "⚠️  변경사항을 적용하려면 다음 명령어를 실행하세요:"
    echo "   docker-compose restart backend"
    echo "   또는"
    echo "   docker-compose down && docker-compose up -d"
fi

echo ""
echo "========================================="
echo "  완료!"
echo "========================================="
echo ""
echo "📧 오류 보고 이메일: neohum77@gmail.com"
echo ""
echo "테스트 방법:"
echo "1. https://edupy.org/admin/dashboard 접속"
echo "2. 오류 보고 항목 클릭"
echo "3. 'Send Email' 버튼 클릭"
echo "4. neohum77@gmail.com에서 이메일 확인"
echo ""
