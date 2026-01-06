#!/bin/bash
# 빠른 502 에러 해결 스크립트
# 서버에서 이 스크립트를 실행하세요

echo "=========================================="
echo "  502 Bad Gateway 에러 빠른 해결"
echo "=========================================="
echo ""

# 1. nginx 설정 백업
echo "1. 현재 nginx 설정 백업 중..."
sudo cp /etc/nginx/sites-available/edupy /etc/nginx/sites-available/edupy.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ 백업 완료"
echo ""

# 2. /api 프록시 추가 여부 확인
echo "2. nginx 설정 확인 중..."
if sudo grep -q "location /api" /etc/nginx/sites-available/edupy; then
    echo "✓ /api 경로가 이미 설정되어 있습니다."
    echo ""
    echo "다른 문제일 수 있습니다. 백엔드 상태를 확인하세요:"
    echo "  cd /app/edupy"
    echo "  docker compose ps"
    echo "  docker compose logs backend"
else
    echo "⚠ /api 경로가 설정되어 있지 않습니다. 추가합니다..."
    echo ""

    # 3. HTTPS server 블록 찾기 및 /api 추가
    echo "3. nginx 설정에 /api 프록시 추가 중..."

    # /ws 위에 /api 추가
    sudo sed -i '/location \/ws {/i \
    # Proxy API requests to backend\
    location /api {\
        proxy_pass http://localhost:8000;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_read_timeout 86400;\
    }\
\
' /etc/nginx/sites-available/edupy

    echo "✓ /api 프록시 추가 완료"
fi
echo ""

# 4. nginx 설정 테스트
echo "4. nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo "✓ nginx 설정 테스트 통과"
    echo ""

    # 5. nginx 재시작
    echo "5. nginx 재시작 중..."
    sudo systemctl reload nginx
    echo "✓ nginx 재시작 완료"
    echo ""

    echo "=========================================="
    echo "  ✅ 완료!"
    echo "=========================================="
    echo ""
    echo "이제 https://edupy.org/api/admin/login 을 테스트하세요."
    echo ""
    echo "API 테스트:"
    echo "  curl http://localhost:8000/api/health"
    echo ""
else
    echo "❌ nginx 설정 테스트 실패"
    echo "백업에서 복원:"
    echo "  sudo cp /etc/nginx/sites-available/edupy.backup.* /etc/nginx/sites-available/edupy"
    exit 1
fi
