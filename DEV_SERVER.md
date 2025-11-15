# 🚀 EduPy 개발 서버 자동 시작 가이드

## 📋 개요

EduPy 프로젝트의 백엔드와 프론트엔드 서버를 자동으로 시작하는 스크립트입니다.
**핫 리로딩(Hot Reloading)**이 활성화되어 있어 코드 변경 시 자동으로 재시작/재로드됩니다.

---

## 🎯 사용 방법

### 1️⃣ 통합 실행 (백엔드 + 프론트엔드)

**가장 추천하는 방법입니다!**

```bash
./start-dev.sh
```

**실행 내용:**
- ✅ 백엔드 서버 시작 (포트 8000)
- ✅ 프론트엔드 서버 시작 (포트 5173)
- ✅ 핫 리로딩 활성화
- ✅ 실시간 로그 출력

**종료 방법:**
- `Ctrl+C` 누르기
- 자동으로 모든 서버 종료

---

### 2️⃣ 백엔드만 실행

```bash
./start-backend.sh
```

**실행 내용:**
- ✅ FastAPI 서버 시작 (포트 8000)
- ✅ Uvicorn 핫 리로딩 활성화
- ✅ 파일 변경 시 자동 재시작

**접속 주소:**
- 🌐 API: http://localhost:8000
- 📖 API 문서: http://localhost:8000/docs

---

### 3️⃣ 프론트엔드만 실행

```bash
./start-frontend.sh
```

**실행 내용:**
- ✅ Vite 개발 서버 시작 (포트 5173)
- ✅ React 핫 리로딩 활성화
- ✅ 파일 변경 시 자동 재로드

**접속 주소:**
- 🌐 앱: http://localhost:5173

---

## 🔥 핫 리로딩 기능

### 백엔드 (FastAPI + Uvicorn)

**자동 재시작되는 파일:**
- `backend/main.py`
- `backend/database.py`
- `backend/turtle_runner.py`
- 기타 Python 파일

**변경 감지 시:**
```
WARNING: WatchFiles detected changes in 'main.py'. Reloading...
INFO: Shutting down
INFO: Started server process [12345]
```

### 프론트엔드 (Vite + React)

**자동 재로드되는 파일:**
- `frontend/src/**/*.tsx`
- `frontend/src/**/*.ts`
- `frontend/src/**/*.css`
- 기타 소스 파일

**변경 감지 시:**
- 브라우저가 자동으로 새로고침
- 상태 유지 (HMR - Hot Module Replacement)

---

## 📊 로그 확인

### 실시간 로그 (통합 실행 시)

`./start-dev.sh` 실행 시 자동으로 실시간 로그가 출력됩니다.

### 로그 파일

```bash
# 백엔드 로그
tail -f backend.log

# 프론트엔드 로그
tail -f frontend.log

# 두 로그 동시 확인
tail -f backend.log frontend.log
```

---

## 🛠️ 문제 해결

### 포트가 이미 사용 중인 경우

스크립트가 자동으로 감지하고 종료 여부를 물어봅니다:

```
⚠️  포트 8000이 이미 사용 중입니다.
   기존 프로세스를 종료하시겠습니까? (y/n)
```

**수동으로 종료:**
```bash
# 포트 8000 (백엔드)
lsof -ti:8000 | xargs kill -9

# 포트 5173 (프론트엔드)
lsof -ti:5173 | xargs kill -9
```

### 의존성 패키지 오류

**백엔드:**
```bash
cd backend
pip install -r requirements.txt
```

**프론트엔드:**
```bash
cd frontend
npm install
```

### 가상환경 활성화

백엔드 스크립트는 자동으로 가상환경을 활성화합니다:
```bash
# backend/venv가 있으면 자동 활성화
source backend/venv/bin/activate
```

---

## 📁 파일 구조

```
edupy/
├── start-dev.sh          # 통합 실행 스크립트
├── start-backend.sh      # 백엔드 전용 스크립트
├── start-frontend.sh     # 프론트엔드 전용 스크립트
├── backend.log           # 백엔드 로그 (자동 생성)
├── frontend.log          # 프론트엔드 로그 (자동 생성)
├── backend/
│   ├── main.py           # FastAPI 앱 (핫 리로딩)
│   ├── database.py
│   ├── turtle_runner.py
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.ts    # Vite 설정 (HMR)
```

---

## ⚙️ 설정

### 백엔드 핫 리로딩 설정

`backend/main.py`:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # ✅ 핫 리로딩 활성화
        log_level="info"
    )
```

### 프론트엔드 HMR 설정

`frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5173,
    hmr: true,  // ✅ HMR 활성화
  }
})
```

---

## 🎓 사용 예시

### 개발 시작

```bash
# 1. 프로젝트 루트로 이동
cd /Users/nm/works/project2025/edupy

# 2. 통합 서버 시작
./start-dev.sh

# 3. 브라우저에서 접속
# http://localhost:5173
```

### 코드 수정

```bash
# 1. 파일 수정
vim backend/main.py

# 2. 저장 (자동 재시작)
# 터미널에 재시작 로그 출력

# 3. 브라우저 확인
# 변경사항 자동 반영
```

---

## 🚦 상태 확인

```bash
# 실행 중인 프로세스 확인
ps aux | grep python  # 백엔드
ps aux | grep node    # 프론트엔드

# 포트 사용 확인
lsof -i :8000  # 백엔드
lsof -i :5173  # 프론트엔드
```

---

## 📝 참고사항

- ✅ 모든 스크립트는 실행 권한이 부여되어 있습니다 (`chmod +x`)
- ✅ 백엔드는 Uvicorn의 `--reload` 옵션 사용
- ✅ 프론트엔드는 Vite의 HMR 기능 사용
- ✅ 로그는 `backend.log`, `frontend.log`에 저장
- ✅ `Ctrl+C`로 모든 서버 안전하게 종료

---

**Happy Coding! 🎉**

