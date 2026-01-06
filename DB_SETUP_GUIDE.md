# 데이터베이스 설정 가이드

EduPy는 **SQLite**와 **PostgreSQL** 두 가지 데이터베이스를 지원합니다.

- **SQLite**: 간단한 설정, 소규모 프로젝트에 적합 (기본값)
- **PostgreSQL**: 프로덕션 환경, 대규모 프로젝트에 권장

---

## 📌 옵션 1: SQLite 사용 (기본값)

별도 설정 없이 바로 사용 가능합니다.

```bash
# .env 파일에서 DATABASE_URL을 설정하지 않으면 자동으로 SQLite 사용
docker-compose up -d
```

**장점**:
- 별도 DB 설치 불필요
- 설정이 간단함
- 파일 기반으로 백업 용이

**단점**:
- 동시 접속 성능 제한
- 대규모 데이터 처리 시 느림

---

## 📌 옵션 2: PostgreSQL 사용 (호스트 설치)

### 1. PostgreSQL 설치

#### macOS (개발 환경)

```bash
# Homebrew로 설치
brew install postgresql@15

# PostgreSQL 시작
brew services start postgresql@15

# DB 생성
createdb edupy

# 사용자 생성 및 권한 부여
psql postgres << EOF
CREATE USER edupy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE edupy TO edupy_user;
ALTER DATABASE edupy OWNER TO edupy_user;
EOF
```

#### Ubuntu/Debian (서버 환경)

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# DB 및 사용자 생성
sudo -u postgres psql << EOF
CREATE DATABASE edupy;
CREATE USER edupy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE edupy TO edupy_user;
ALTER DATABASE edupy OWNER TO edupy_user;
EOF

# 외부 접속 허용 (도커 컨테이너에서 접속하기 위해)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/15/main/postgresql.conf

# 접속 허용 설정 추가
echo "host    all             all             172.16.0.0/12            md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf

# PostgreSQL 재시작
sudo systemctl restart postgresql
```

#### CentOS/RHEL (서버 환경)

```bash
# PostgreSQL 설치
sudo dnf install -y postgresql15-server postgresql15-contrib

# 초기화
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# 시작
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# DB 및 사용자 생성
sudo -u postgres psql << EOF
CREATE DATABASE edupy;
CREATE USER edupy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE edupy TO edupy_user;
ALTER DATABASE edupy OWNER TO edupy_user;
EOF

# 외부 접속 허용
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/15/data/postgresql.conf
echo "host    all             all             172.16.0.0/12            md5" | sudo tee -a /var/lib/pgsql/15/data/pg_hba.conf

# PostgreSQL 재시작
sudo systemctl restart postgresql-15
```

### 2. 환경 변수 설정

`.env` 파일을 수정하여 DATABASE_URL을 설정하세요:

```bash
# .env 파일 복사
cp .env.example .env

# .env 파일 수정
nano .env
```

다음 내용 추가:

```bash
# PostgreSQL 사용
DATABASE_URL=postgresql://edupy_user:your_secure_password@host.docker.internal:5432/edupy
```

**주의사항**:
- `your_secure_password`를 실제 비밀번호로 변경하세요
- `host.docker.internal`은 도커 컨테이너에서 호스트에 접속하기 위한 특수 호스트명입니다

### 3. 연결 테스트

```bash
# PostgreSQL 연결 테스트
psql "postgresql://edupy_user:your_secure_password@localhost:5432/edupy" -c "SELECT version();"
```

### 4. 도커 컨테이너 재시작

```bash
# 기존 컨테이너 중지
docker-compose down

# 새 설정으로 시작
docker-compose up -d --build
```

---

## 🔄 SQLite에서 PostgreSQL로 마이그레이션

기존 SQLite 데이터를 PostgreSQL로 이전하는 방법:

### 1. pgloader 사용 (권장)

```bash
# pgloader 설치 (Ubuntu)
sudo apt install pgloader

# 마이그레이션 실행
pgloader \
  sqlite://backend/edupy.db \
  postgresql://edupy_user:your_password@localhost:5432/edupy
```

### 2. 수동 백업/복원

```bash
# 1. SQLite 데이터 덤프
sqlite3 backend/edupy.db .dump > backup.sql

# 2. PostgreSQL용으로 SQL 수정 (자동 증가 등)
sed -i 's/AUTOINCREMENT/SERIAL/g' backup.sql

# 3. PostgreSQL로 복원
psql "postgresql://edupy_user:your_password@localhost:5432/edupy" < backup.sql
```

---

## 🔍 데이터베이스 확인

### SQLite 사용 중인지 확인

```bash
# 컨테이너 로그 확인
docker-compose logs backend | grep -i "database"

# "Using SQLite database" 메시지가 나오면 SQLite 사용 중
```

### PostgreSQL 사용 중인지 확인

```bash
# 컨테이너 로그 확인
docker-compose logs backend | grep -i "database"

# "Using PostgreSQL database" 메시지가 나오면 PostgreSQL 사용 중
```

### 직접 데이터베이스 접속

#### SQLite

```bash
# 호스트에서
sqlite3 backend/edupy.db

# 도커 컨테이너 내부에서
docker exec -it edupy-backend sqlite3 /app/edupy.db
```

#### PostgreSQL

```bash
# 호스트에서
psql "postgresql://edupy_user:your_password@localhost:5432/edupy"

# 도커 컨테이너에서 (호스트 DB에 접속)
docker exec -it edupy-backend psql "postgresql://edupy_user:your_password@host.docker.internal:5432/edupy"
```

---

## 🛟 문제 해결

### PostgreSQL 연결 오류

**증상**: `could not connect to server`

**해결책**:
1. PostgreSQL이 실행 중인지 확인
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. 방화벽 확인
   ```bash
   # 5432 포트 열기 (Linux)
   sudo ufw allow 5432/tcp
   ```

3. `pg_hba.conf` 설정 확인
   ```bash
   # 도커 네트워크에서 접속 허용되었는지 확인
   cat /etc/postgresql/15/main/pg_hba.conf | grep 172.16
   ```

### 권한 오류

**증상**: `permission denied for database`

**해결책**:
```sql
-- PostgreSQL에 접속해서 실행
GRANT ALL PRIVILEGES ON DATABASE edupy TO edupy_user;
ALTER DATABASE edupy OWNER TO edupy_user;
```

### 도커 컨테이너에서 호스트에 접속 불가

**증상**: `host.docker.internal` 연결 실패

**해결책** (Linux):
```yaml
# docker-compose.yml에 이미 추가되어 있음
extra_hosts:
  - "host.docker.internal:host-gateway"
```

---

## 📊 성능 비교

| 항목 | SQLite | PostgreSQL |
|------|--------|-----------|
| 설치 | 불필요 | 필요 |
| 설정 복잡도 | ⭐ | ⭐⭐⭐ |
| 동시 접속 | 제한적 | 우수 |
| 쓰기 성능 | 보통 | 우수 |
| 읽기 성능 | 우수 | 우수 |
| 데이터 크기 | < 100GB | 무제한 |
| 백업 | 파일 복사 | pg_dump |
| 권장 용도 | 개발/테스트 | 프로덕션 |

---

## 💡 추천 설정

- **개발 환경**: SQLite (간단하고 빠름)
- **테스트 서버**: PostgreSQL (프로덕션과 동일한 환경)
- **프로덕션**: PostgreSQL (안정성과 성능)

---

## 📝 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org/)
- [Docker 네트워킹](https://docs.docker.com/network/)
