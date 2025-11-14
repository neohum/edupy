# 환경 설정 가이드

EduPy는 개발 모드와 서비스 모드를 지원합니다.

## 환경 변수 설명

### ENVIRONMENT
애플리케이션 실행 환경을 지정합니다.

- `development`: 개발 모드
  - 상세한 로그 출력
  - 로컬 테스트 환경
  - CORS 제한 완화
  
- `production`: 서비스 모드
  - 최소한의 로그 출력
  - 실제 운영 환경
  - 엄격한 CORS 설정

### DEBUG
디버그 모드 활성화 여부

- `true`: 디버그 모드 활성화 (상세 로그)
- `false`: 디버그 모드 비활성화 (최소 로그)

### CORS_ORIGINS
허용할 프론트엔드 도메인 목록 (쉼표로 구분)

- 개발: `http://localhost:5173`
- 서비스: `https://edupy.dev,https://www.edupy.dev`

### RESEND_API_KEY
Resend 이메일 서비스 API 키

- https://resend.com/api-keys 에서 발급
- 형식: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### ERROR_REPORT_EMAIL
오류 보고를 받을 이메일 주소

- 기본값: `neohum77@gmail.com`

### FROM_EMAIL
이메일 발신자 주소

- 개발: `onboarding@resend.dev` (Resend 기본 도메인)
- 서비스: `noreply@edupy.dev` (인증된 도메인)

## 개발 모드 설정

### 1. .env 파일 생성

```bash
cp .env.example .env
```

### 2. .env 파일 편집

```env
ENVIRONMENT=development
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ERROR_REPORT_EMAIL=neohum77@gmail.com
FROM_EMAIL=onboarding@resend.dev
CORS_ORIGINS=http://localhost:5173
DEBUG=true
```

### 3. 서버 실행

```bash
# 백엔드
cd backend
python main.py

# 프론트엔드
cd frontend
npm run dev
```

### 4. 확인

- 백엔드: http://localhost:8000
- 프론트엔드: http://localhost:5173
- API 문서: http://localhost:8000/docs

## 서비스 모드 설정

### 1. .env.production 파일 생성

```bash
cp .env.production .env
```

### 2. .env 파일 편집

```env
ENVIRONMENT=production
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ERROR_REPORT_EMAIL=neohum77@gmail.com
FROM_EMAIL=noreply@edupy.dev
CORS_ORIGINS=https://edupy.dev
DEBUG=false
```

### 3. 도메인 인증

Resend에서 `edupy.dev` 도메인 인증 필요:
1. Resend 대시보드 → Domains
2. Add Domain → `edupy.dev` 입력
3. DNS 레코드 추가 (TXT, MX, CNAME)
4. Verify DNS Records

### 4. 서버 실행

```bash
# 프로덕션 모드로 실행
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 환경별 차이점

| 항목 | 개발 모드 | 서비스 모드 |
|------|----------|------------|
| **로그 레벨** | DEBUG | INFO |
| **상세 로그** | ✅ | ❌ |
| **CORS** | localhost | 실제 도메인 |
| **이메일 발신자** | resend.dev | 인증된 도메인 |
| **디버그 정보** | 노출 | 숨김 |
| **에러 스택** | 전체 표시 | 최소 표시 |

## 로그 확인

### 개발 모드
```
2025-11-14 15:30:45 - __main__ - INFO - Starting EduPy API in development mode
2025-11-14 15:30:45 - __main__ - INFO - Debug mode: True
2025-11-14 15:30:45 - __main__ - INFO - CORS origins: ['http://localhost:5173']
2025-11-14 15:31:20 - __main__ - INFO - Received error report for Level 1: 출력과 문자열 - 1-1 - 한 줄 자기소개
2025-11-14 15:31:20 - __main__ - DEBUG - Sending email from onboarding@resend.dev to neohum77@gmail.com
2025-11-14 15:31:21 - __main__ - INFO - Email sent successfully. ID: abc123
```

### 서비스 모드
```
2025-11-14 15:30:45 - __main__ - INFO - Starting EduPy API in production mode
2025-11-14 15:30:45 - __main__ - INFO - Debug mode: False
2025-11-14 15:30:45 - __main__ - INFO - CORS origins: ['https://edupy.dev']
2025-11-14 15:31:20 - __main__ - INFO - Received error report for Level 1: 출력과 문자열 - 1-1 - 한 줄 자기소개
2025-11-14 15:31:21 - __main__ - INFO - Email sent successfully. ID: abc123
```

## API 엔드포인트 확인

### GET /
환경 정보 확인

```bash
curl http://localhost:8000/
```

**응답:**
```json
{
  "message": "Welcome to EduPy API",
  "version": "1.0.0",
  "status": "running",
  "environment": "development",
  "debug": true
}
```

## 문제 해결

### CORS 오류
```
Access to fetch at 'http://localhost:8000/api/error-report' has been blocked by CORS policy
```

**해결:**
- `.env` 파일의 `CORS_ORIGINS`에 프론트엔드 URL 추가
- 개발: `http://localhost:5173`
- 서비스: `https://yourdomain.com`

### 이메일 발송 실패
```
detail: "이메일 발송 실패: Invalid from address"
```

**해결:**
- 개발: `FROM_EMAIL=onboarding@resend.dev`
- 서비스: Resend에서 도메인 인증 후 `FROM_EMAIL=noreply@edupy.dev`

### 환경 변수 로드 안됨
```
RESEND_API_KEY is None
```

**해결:**
- `.env` 파일이 프로젝트 루트에 있는지 확인
- `.env` 파일 권한 확인 (`chmod 600 .env`)
- 서버 재시작

## 보안 주의사항

1. **절대 .env 파일을 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 포함됨
   
2. **API 키는 안전하게 보관**
   - 환경 변수로만 관리
   - 코드에 하드코딩 금지

3. **프로덕션에서는 DEBUG=false**
   - 민감한 정보 노출 방지

4. **CORS는 필요한 도메인만 허용**
   - `*` (모든 도메인) 사용 금지

