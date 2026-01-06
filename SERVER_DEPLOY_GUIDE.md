# 서버 배포 가이드

## 환경 변수 업데이트

### 1. 서버에 SSH 접속

```bash
ssh user@edupy.org
# 또는
ssh user@your-server-ip
```

### 2. 프로젝트 디렉토리로 이동

```bash
cd /path/to/edupy
```

### 3. 환경 변수 파일 업데이트

#### 방법 1: .env 파일 직접 수정

```bash
# .env 파일 편집
nano .env

# 또는 vim 사용
vim .env
```

다음 내용을 확인/수정:

```bash
# 오류 보고를 받을 이메일 주소
ERROR_REPORT_EMAIL=neohum77@gmail.com

# 발신자 이메일 (Resend에서 인증된 도메인)
FROM_EMAIL=noreply@edupy.dev

# Resend API Key (필수)
RESEND_API_KEY=re_your_actual_api_key
```

#### 방법 2: 환경 변수 직접 설정 (Docker 사용 시)

```bash
# docker-compose.yml에서 환경 변수 설정
nano docker-compose.yml
```

backend 서비스의 environment 섹션에 추가:

```yaml
services:
  backend:
    environment:
      - ERROR_REPORT_EMAIL=neohum77@gmail.com
      - FROM_EMAIL=noreply@edupy.dev
      - RESEND_API_KEY=${RESEND_API_KEY}
```

### 4. 변경사항 적용

#### Docker 사용 시

```bash
# 컨테이너 재시작
docker-compose down
docker-compose up -d

# 또는 backend만 재시작
docker-compose restart backend
```

#### 일반 서버 (systemd) 사용 시

```bash
# 서비스 재시작
sudo systemctl restart edupy-backend

# 또는 uvicorn 프로세스 재시작
sudo systemctl restart uvicorn
```

### 5. 확인

```bash
# 로그 확인 (Docker)
docker-compose logs -f backend

# 로그 확인 (systemd)
sudo journalctl -u edupy-backend -f

# 환경 변수가 제대로 로드되었는지 확인
docker-compose exec backend env | grep ERROR_REPORT_EMAIL
```

---

## 빠른 업데이트 스크립트

서버에서 실행:

```bash
#!/bin/bash

# 환경 변수 업데이트
cat > .env << EOF
ENVIRONMENT=production
ERROR_REPORT_EMAIL=neohum77@gmail.com
FROM_EMAIL=noreply@edupy.dev
RESEND_API_KEY=re_your_actual_api_key
CORS_ORIGINS=https://edupy.dev,https://www.edupy.dev
DEBUG=false
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
EOF

# Docker 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs -f backend
```

---

## Resend 설정 확인

오류 보고 이메일이 제대로 작동하려면:

### 1. Resend 계정 확인

1. https://resend.com 로그인
2. API Keys 메뉴에서 API 키 확인
3. Domains 메뉴에서 `edupy.dev` 도메인이 인증되었는지 확인

### 2. 도메인 인증 (아직 안 했다면)

```bash
# DNS 레코드 추가 필요
# Resend 대시보드에서 제공하는 DNS 레코드를 도메인 DNS에 추가

# 예시:
# TXT _resend.edupy.dev -> "resend-verification=..."
# MX edupy.dev -> "feedback-smtp.us-east-1.amazonses.com" (priority: 10)
```

### 3. 테스트 이메일 발송

```bash
# 서버에서 테스트 실행
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@edupy.dev",
    "to": "neohum77@gmail.com",
    "subject": "Test Email",
    "text": "This is a test email from EduPy"
  }'
```

---

## 문제 해결

### 이메일이 오지 않는 경우

#### 1. 환경 변수 확인

```bash
# Docker 컨테이너 내부에서 확인
docker-compose exec backend python -c "import os; print(os.getenv('ERROR_REPORT_EMAIL'))"
docker-compose exec backend python -c "import os; print(os.getenv('FROM_EMAIL'))"
docker-compose exec backend python -c "import os; print(os.getenv('RESEND_API_KEY'))"
```

#### 2. Resend 로그 확인

1. https://resend.com/emails 에서 이메일 전송 로그 확인
2. 실패 메시지 확인

#### 3. 서버 로그 확인

```bash
# 에러 관련 로그 검색
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -i email
```

#### 4. 방화벽 확인

```bash
# SMTP 포트 확인 (587, 465, 25)
sudo netstat -tuln | grep -E '587|465|25'

# 방화벽 규칙 확인
sudo ufw status
```

### FROM_EMAIL 도메인 인증 안 된 경우

Resend에서는 인증된 도메인에서만 이메일을 보낼 수 있습니다.

**해결 방법:**

1. **옵션 1**: `edupy.dev` 도메인 인증
   - Resend 대시보드에서 DNS 레코드 추가

2. **옵션 2**: Resend에서 제공하는 기본 도메인 사용 (개발 환경만)
   ```bash
   FROM_EMAIL=onboarding@resend.dev
   ```

---

## 배포 체크리스트

- [ ] `.env` 파일에 `ERROR_REPORT_EMAIL=neohum77@gmail.com` 설정
- [ ] `FROM_EMAIL`이 인증된 도메인으로 설정됨
- [ ] `RESEND_API_KEY`가 유효한 API 키로 설정됨
- [ ] Docker 컨테이너 재시작
- [ ] 환경 변수가 제대로 로드되었는지 확인
- [ ] 테스트 이메일 발송 확인
- [ ] 관리자 대시보드에서 오류 보고 기능 테스트

---

## 현재 설정 (2026-01-06)

```bash
ERROR_REPORT_EMAIL=neohum77@gmail.com
FROM_EMAIL=noreply@edupy.dev
RESEND_API_KEY=REDACTED_RESEND_KEY
```

**주의**: RESEND_API_KEY는 실제 프로덕션 키로 변경해야 합니다!
