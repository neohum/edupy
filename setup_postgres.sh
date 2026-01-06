#!/bin/bash

# EduPy PostgreSQL 설정 스크립트
# 이 스크립트는 PostgreSQL을 설치하고 EduPy 데이터베이스를 설정합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "========================================="
echo "  EduPy PostgreSQL 설정 스크립트"
echo "========================================="
echo ""

# OS 감지
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ -f /etc/debian_version ]]; then
    OS="debian"
elif [[ -f /etc/redhat-release ]]; then
    OS="redhat"
fi

echo "감지된 OS: $OS"
echo ""

# PostgreSQL 설치 확인
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL이 이미 설치되어 있습니다."
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    echo "   버전: $PSQL_VERSION"
else
    echo "❌ PostgreSQL이 설치되어 있지 않습니다."
    read -p "PostgreSQL을 설치하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS" == "macos" ]]; then
            echo "Homebrew로 PostgreSQL 설치 중..."
            brew install postgresql@15
            brew services start postgresql@15
        elif [[ "$OS" == "debian" ]]; then
            echo "apt로 PostgreSQL 설치 중..."
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        elif [[ "$OS" == "redhat" ]]; then
            echo "dnf로 PostgreSQL 설치 중..."
            sudo dnf install -y postgresql15-server postgresql15-contrib
            sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
            sudo systemctl start postgresql-15
            sudo systemctl enable postgresql-15
        fi
        echo "✅ PostgreSQL 설치 완료"
    else
        echo "설치를 취소했습니다."
        exit 0
    fi
fi

echo ""
echo "----------------------------------------"
echo "  데이터베이스 설정"
echo "----------------------------------------"

# 기본값
DB_NAME="edupy"
DB_USER="edupy_user"

# 사용자 입력
read -p "데이터베이스 이름 (기본: edupy): " input_db_name
DB_NAME=${input_db_name:-$DB_NAME}

read -p "사용자 이름 (기본: edupy_user): " input_db_user
DB_USER=${input_db_user:-$DB_USER}

read -sp "비밀번호 입력: " DB_PASSWORD
echo ""

if [[ -z "$DB_PASSWORD" ]]; then
    echo "❌ 비밀번호는 필수입니다."
    exit 1
fi

echo ""
echo "설정 정보:"
echo "  데이터베이스: $DB_NAME"
echo "  사용자: $DB_USER"
echo "  비밀번호: ********"
echo ""

read -p "위 설정으로 진행하시겠습니까? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "설정을 취소했습니다."
    exit 0
fi

# PostgreSQL 설정
echo ""
echo "PostgreSQL 데이터베이스 생성 중..."

if [[ "$OS" == "macos" ]]; then
    # macOS
    psql postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "데이터베이스가 이미 존재합니다."
    psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "사용자가 이미 존재합니다."
    psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    psql postgres -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
else
    # Linux
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "데이터베이스가 이미 존재합니다."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "사용자가 이미 존재합니다."
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
fi

echo "✅ PostgreSQL 데이터베이스 설정 완료"

# Linux에서 외부 접속 허용 설정
if [[ "$OS" != "macos" ]]; then
    echo ""
    read -p "도커 컨테이너에서 접속할 수 있도록 설정하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS" == "debian" ]]; then
            PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
            PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
            PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
        elif [[ "$OS" == "redhat" ]]; then
            PG_CONF="/var/lib/pgsql/15/data/postgresql.conf"
            PG_HBA="/var/lib/pgsql/15/data/pg_hba.conf"
        fi

        echo "PostgreSQL 설정 파일 수정 중..."
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF" || true
        sudo bash -c "echo 'host    all             all             172.16.0.0/12            md5' >> $PG_HBA"

        if [[ "$OS" == "debian" ]]; then
            sudo systemctl restart postgresql
        elif [[ "$OS" == "redhat" ]]; then
            sudo systemctl restart postgresql-15
        fi

        echo "✅ 외부 접속 설정 완료"
    fi
fi

# .env 파일 업데이트
echo ""
echo "----------------------------------------"
echo "  환경 변수 설정"
echo "----------------------------------------"

ENV_FILE=".env"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@host.docker.internal:5432/$DB_NAME"

if [[ ! -f "$ENV_FILE" ]]; then
    echo ".env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example "$ENV_FILE"
fi

# DATABASE_URL 추가 또는 업데이트
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # 이미 존재하면 주석 처리하고 새로 추가
    sed -i.bak "s|^DATABASE_URL=.*|# DATABASE_URL (이전 설정)\n# &\nDATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
else
    # 없으면 추가
    echo "" >> "$ENV_FILE"
    echo "# PostgreSQL 데이터베이스 설정" >> "$ENV_FILE"
    echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
fi

echo "✅ .env 파일 업데이트 완료"

# 연결 테스트
echo ""
echo "----------------------------------------"
echo "  연결 테스트"
echo "----------------------------------------"

if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ PostgreSQL 연결 성공!"
else
    echo "❌ PostgreSQL 연결 실패. 설정을 확인하세요."
    exit 1
fi

# 완료
echo ""
echo "========================================="
echo "  설정 완료!"
echo "========================================="
echo ""
echo "다음 명령어로 도커 컨테이너를 재시작하세요:"
echo ""
echo "  docker-compose down"
echo "  docker-compose up -d --build"
echo ""
echo "데이터베이스 접속:"
echo "  psql \"$DATABASE_URL\""
echo ""
echo "자세한 내용은 DB_SETUP_GUIDE.md를 참고하세요."
echo ""
