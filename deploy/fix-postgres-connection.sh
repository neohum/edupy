#!/bin/bash
# PostgreSQL 연결 문제 진단 및 해결 스크립트
# Docker 컨테이너에서 호스트 PostgreSQL에 연결하기 위한 설정

set -e

echo "=========================================="
echo "  PostgreSQL 연결 문제 진단 및 해결"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 1. Docker 게이트웨이 IP 찾기
echo "1. Docker 브릿지 네트워크 게이트웨이 IP 확인..."
DOCKER_GATEWAY=$(docker network inspect bridge | grep -oP '(?<="Gateway": ")[^"]*' | head -1)
if [ -z "$DOCKER_GATEWAY" ]; then
    DOCKER_GATEWAY="172.17.0.1"
    print_warning "기본 게이트웨이 IP 사용: $DOCKER_GATEWAY"
else
    print_success "Docker 게이트웨이 IP: $DOCKER_GATEWAY"
fi
echo ""

# 2. PostgreSQL이 외부 연결을 수신하는지 확인
echo "2. PostgreSQL 수신 주소 확인..."
LISTEN_ADDRESSES=$(sudo -u postgres psql -t -c "SHOW listen_addresses;" 2>/dev/null | xargs)
echo "   현재 listen_addresses: $LISTEN_ADDRESSES"

if [ "$LISTEN_ADDRESSES" != "*" ] && [ "$LISTEN_ADDRESSES" != "0.0.0.0" ]; then
    print_warning "PostgreSQL이 외부 연결을 수신하지 않습니다."
    echo ""
    echo "PostgreSQL 설정을 수정하시겠습니까? (y/n)"
    read -r CONFIRM

    if [ "$CONFIRM" = "y" ]; then
        echo "postgresql.conf 파일 위치 찾기..."
        PG_CONF=$(sudo -u postgres psql -t -c "SHOW config_file;" | xargs)
        echo "   설정 파일: $PG_CONF"

        # 백업 생성
        sudo cp "$PG_CONF" "$PG_CONF.backup.$(date +%Y%m%d_%H%M%S)"

        # listen_addresses 수정
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"
        sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/g" "$PG_CONF"

        print_success "listen_addresses가 '*'로 변경되었습니다."
    fi
else
    print_success "PostgreSQL이 모든 인터페이스에서 수신 중입니다."
fi
echo ""

# 3. pg_hba.conf 확인 및 수정
echo "3. PostgreSQL 인증 설정(pg_hba.conf) 확인..."
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
echo "   설정 파일: $PG_HBA"

# Docker 네트워크 대역 확인
if ! sudo grep -q "172.17.0.0/16" "$PG_HBA" 2>/dev/null; then
    print_warning "Docker 네트워크 대역이 pg_hba.conf에 없습니다."
    echo ""
    echo "Docker 네트워크 접근 권한을 추가하시겠습니까? (y/n)"
    read -r CONFIRM

    if [ "$CONFIRM" = "y" ]; then
        # 백업 생성
        sudo cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"

        # Docker 네트워크 대역 추가
        echo "# Docker containers" | sudo tee -a "$PG_HBA" > /dev/null
        echo "host    edupy    edupy_user    172.17.0.0/16    md5" | sudo tee -a "$PG_HBA" > /dev/null
        echo "host    all      all           172.17.0.0/16    md5" | sudo tee -a "$PG_HBA" > /dev/null

        print_success "Docker 네트워크 접근 권한이 추가되었습니다."
    fi
else
    print_success "Docker 네트워크 접근 권한이 이미 설정되어 있습니다."
fi
echo ""

# 4. PostgreSQL 재시작 여부 확인
if [ "$CONFIRM" = "y" ]; then
    echo "4. PostgreSQL을 재시작하시겠습니까? (y/n)"
    read -r RESTART

    if [ "$RESTART" = "y" ]; then
        echo "PostgreSQL 재시작 중..."
        sudo systemctl restart postgresql
        sleep 3

        if sudo systemctl is-active --quiet postgresql; then
            print_success "PostgreSQL이 성공적으로 재시작되었습니다."
        else
            print_error "PostgreSQL 재시작 실패. 로그를 확인하세요."
            exit 1
        fi
    fi
fi
echo ""

# 5. .env 파일 업데이트
echo "5. .env 파일의 DATABASE_URL 업데이트..."
ENV_FILE="/app/edupy/.env"

if [ -f "$ENV_FILE" ]; then
    # 백업 생성
    sudo cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

    # DATABASE_URL 업데이트 (host.docker.internal -> Docker 게이트웨이 IP)
    NEW_DATABASE_URL="postgresql://edupy_user:REDACTED_PG_PASSWORD@${DOCKER_GATEWAY}:5432/edupy"

    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        sudo sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${NEW_DATABASE_URL}|" "$ENV_FILE"
    else
        echo "DATABASE_URL=${NEW_DATABASE_URL}" | sudo tee -a "$ENV_FILE" > /dev/null
    fi

    print_success "DATABASE_URL이 업데이트되었습니다: $NEW_DATABASE_URL"
else
    print_warning ".env 파일을 찾을 수 없습니다: $ENV_FILE"
fi
echo ""

# 6. 연결 테스트
echo "6. PostgreSQL 연결 테스트..."
DB_PASSWORD="REDACTED_PG_PASSWORD"
export PGPASSWORD=$DB_PASSWORD

if psql -h "$DOCKER_GATEWAY" -U edupy_user -d edupy -c "SELECT version();" > /dev/null 2>&1; then
    print_success "PostgreSQL 연결 성공!"
else
    print_error "PostgreSQL 연결 실패. 다음을 확인하세요:"
    echo "   - PostgreSQL이 $DOCKER_GATEWAY:5432에서 수신 중인지"
    echo "   - 사용자 이름과 비밀번호가 올바른지"
    echo "   - pg_hba.conf에 Docker 네트워크 접근 권한이 있는지"
fi
unset PGPASSWORD
echo ""

# 7. Docker 컨테이너 재시작
echo "7. Docker 컨테이너를 재시작하시겠습니까? (y/n)"
read -r RESTART_DOCKER

if [ "$RESTART_DOCKER" = "y" ]; then
    echo "Docker 컨테이너 재시작 중..."
    cd /app/edupy
    docker compose down
    docker compose up -d

    echo "컨테이너 시작 대기 중..."
    sleep 10

    echo "컨테이너 상태:"
    docker compose ps

    echo ""
    echo "백엔드 로그 (최근 30줄):"
    docker compose logs --tail=30 backend
fi
echo ""

echo "=========================================="
echo "  완료!"
echo "=========================================="
echo ""
echo "요약:"
echo "  - Docker 게이트웨이 IP: $DOCKER_GATEWAY"
echo "  - DATABASE_URL: postgresql://edupy_user:****@${DOCKER_GATEWAY}:5432/edupy"
echo ""
echo "문제가 계속되면 다음을 확인하세요:"
echo "  1. docker compose logs backend"
echo "  2. sudo tail -f /var/log/postgresql/postgresql-*.log"
echo "  3. sudo netstat -tlnp | grep 5432"
echo ""
