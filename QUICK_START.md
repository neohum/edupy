# 🚀 빠른 시작 가이드

## 1️⃣ Backend 가상환경 설정 (처음 한 번만)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

## 2️⃣ 프론트엔드와 백엔드 동시 실행

```bash
# 루트 디렉토리에서
npm run dev
```

이 명령어 하나로 다음이 모두 실행됩니다:

### ✅ 실행되는 것들

1. **Frontend (Vite)** - http://localhost:5173
   - React 앱
   - 핫리로딩 (파일 저장 시 자동 새로고침)
   - 파이썬 학습 페이지

2. **Backend (FastAPI)** - http://localhost:8000
   - API 서버
   - 핫리로딩 (파일 저장 시 자동 재시작)
   - API 문서: http://localhost:8000/docs

### 📺 터미널 출력

```
[FRONTEND] VITE v7.2.2  ready in 322 ms
[FRONTEND] ➜  Local:   http://localhost:5173/
[BACKEND]  INFO:     Uvicorn running on http://0.0.0.0:8000
[BACKEND]  INFO:     Application startup complete.
```

## 3️⃣ 개발하기

### Frontend 파일 수정
```
frontend/src/
├── pages/           # 페이지 수정
├── components/      # 컴포넌트 추가
├── store/           # 상태 관리
└── services/        # 서비스 로직
```

파일 저장 → 브라우저 자동 새로고침 ✨

### Backend 파일 수정
```
backend/
├── main.py          # API 엔드포인트 추가
└── requirements.txt # 패키지 추가
```

파일 저장 → 서버 자동 재시작 ✨

## 🛑 서버 종료

터미널에서 `Ctrl + C` 두 번 누르기

## 🔧 문제 해결

### Backend가 시작되지 않을 때

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..
npm run dev
```

### Frontend가 시작되지 않을 때

```bash
cd frontend
npm install
cd ..
npm run dev
```

### 포트가 이미 사용 중일 때

- Frontend: Vite가 자동으로 다른 포트 찾음 (5174, 5175...)
- Backend: `backend/main.py`에서 `port=8000`을 다른 번호로 변경

## 📝 개별 실행 (필요시)

### Frontend만 실행
```bash
npm run frontend
```

### Backend만 실행
```bash
npm run backend
```

## 🎯 다음 단계

1. http://localhost:5173 접속
2. 원하는 학습 모드 선택
3. 학습 시작!
4. 코드 수정하면서 실시간으로 변경사항 확인

## 💡 팁

- **Frontend 핫리로딩**: 파일 저장하면 즉시 반영 (1초 이내)
- **Backend 핫리로딩**: 파일 저장하면 서버 재시작 (2-3초)
- **API 테스트**: http://localhost:8000/docs 에서 Swagger UI 사용
- **LocalStorage 확인**: 브라우저 개발자 도구 → Application → Local Storage

## 📚 더 자세한 정보

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 상세한 개발 가이드
- [README.md](./README.md) - 프로젝트 전체 개요
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Git 사용법

