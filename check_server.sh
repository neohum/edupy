#!/bin/bash
# edupy.org 서버 상태 진단 스크립트

echo "======================================"
echo "EduPy 서버 상태 진단"
echo "======================================"
echo ""

# 1. 시스템 정보
echo "📊 시스템 정보:"
echo "  Uptime: $(uptime -p)"
echo "  메모리: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "  디스크: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " 사용)"}')"
echo ""

# 2. PM2 상태
echo "🔄 PM2 애플리케이션 상태:"
if command -v pm2 &> /dev/null; then
    pm2 status
else
    echo "  ❌ PM2가 설치되지 않음"
fi
echo ""

# 3. Nginx 상태
echo "🌐 Nginx 상태:"
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        echo "  ✅ Nginx 실행 중"
        sudo nginx -t 2>&1 | grep -E 'test|successful'
    else
        echo "  ❌ Nginx 중지됨"
    fi
else
    echo "  ❌ Nginx가 설치되지 않음"
fi
echo ""

# 4. 포트 리스닝 확인
echo "🔌 포트 리스닝 상태:"
check_port() {
    if sudo lsof -i :$1 &> /dev/null; then
        echo "  ✅ 포트 $1 리스닝 중"
    else
        echo "  ❌ 포트 $1 리스닝 안 됨"
    fi
}

check_port 80    # HTTP
check_port 443   # HTTPS
check_port 8000  # 백엔드
check_port 5173  # 프론트엔드
echo ""

# 5. 방화벽 상태
echo "🔥 방화벽 상태:"
if command -v ufw &> /dev/null; then
    sudo ufw status | head -5
else
    echo "  UFW 설치 안 됨"
fi
echo ""

# 6. DNS 확인
echo "🌍 DNS 확인:"
if command -v nslookup &> /dev/null; then
    nslookup edupy.org | grep -A 1 "Name:"
else
    echo "  nslookup 명령 없음"
fi
echo ""

# 7. 로컬 연결 테스트
echo "🧪 로컬 연결 테스트:"
test_url() {
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$1" | grep -q "200\|301\|302"; then
        echo "  ✅ $1"
    else
        echo "  ❌ $1"
    fi
}

test_url "http://localhost:8000/api/health"
test_url "http://localhost:5173"
test_url "http://localhost:80"
echo ""

# 8. 외부 접속 확인
echo "🌐 외부 접속 확인:"
PUBLIC_IP=$(curl -s ifconfig.me)
echo "  공인 IP: $PUBLIC_IP"
test_url "http://$PUBLIC_IP"
echo ""

# 9. 최근 에러 로그
echo "📝 최근 Nginx 에러 (5줄):"
if [ -f /var/log/nginx/error.log ]; then
    sudo tail -5 /var/log/nginx/error.log
else
    echo "  로그 파일 없음"
fi
echo ""

# 10. 권장 사항
echo "======================================"
echo "💡 권장 조치:"
echo "======================================"

# PM2 확인
if ! pm2 list | grep -q "online"; then
    echo "  ⚠️  PM2 앱 시작 필요: pm2 start all"
fi

# Nginx 확인
if ! systemctl is-active --quiet nginx; then
    echo "  ⚠️  Nginx 시작 필요: sudo systemctl start nginx"
fi

# 포트 80 확인
if ! sudo lsof -i :80 &> /dev/null; then
    echo "  ⚠️  포트 80 리스닝 안 됨 - Nginx 확인 필요"
fi

# 포트 8000 확인
if ! sudo lsof -i :8000 &> /dev/null; then
    echo "  ⚠️  백엔드(8000) 시작 필요"
fi

# 포트 5173 확인
if ! sudo lsof -i :5173 &> /dev/null; then
    echo "  ⚠️  프론트엔드(5173) 시작 필요"
fi

echo ""
echo "======================================"
echo "🚀 빠른 수정:"
echo "======================================"
echo "  전체 재시작: ~/restart_all.sh"
echo "  PM2 재시작: pm2 restart all"
echo "  Nginx 재시작: sudo systemctl restart nginx"
echo ""
