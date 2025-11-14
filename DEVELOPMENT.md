# 🛠️ 개발 가이드

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Python 3.11+
- npm 또는 yarn

### 초기 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/neohum/edupy.git
cd edupy
```

#### 2. 의존성 설치
```bash
# 모든 의존성 한 번에 설치
npm run setup
```

이 명령어는 다음을 수행합니다:
- 루트 package.json 의존성 설치 (concurrently)
- Frontend 의존성 설치 (React, Vite, etc.)
- Backend 의존성 설치 (FastAPI, Uvicorn, etc.)

#### 3. Backend 가상환경 설정 (처음 한 번만)
```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 🚀 개발 서버 실행

### 방법 1: 프론트엔드와 백엔드 동시 실행 (권장)

```bash
# 루트 디렉토리에서
npm run dev
```

이 명령어는 **concurrently**를 사용하여 다음을 동시에 실행합니다:

- **Frontend (Vite)**: http://localhost:5173
  - 핫리로딩 (HMR) 지원
  - 파일 변경 시 자동 새로고침
  
- **Backend (FastAPI)**: http://localhost:8000
  - Uvicorn 핫리로딩 지원
  - 파일 변경 시 자동 재시작
  - API 문서: http://localhost:8000/docs

터미널 출력은 색상으로 구분됩니다:
- 🔵 **FRONTEND** (cyan)
- 🟣 **BACKEND** (magenta)

### 방법 2: 개별 실행

#### Frontend만 실행
```bash
npm run frontend
# 또는
cd frontend && npm run dev
```

#### Backend만 실행
```bash
npm run backend
# 또는
cd backend && python main.py
```

## 🔥 핫리로딩 (Hot Reloading)

### Frontend (Vite HMR)
- **자동 활성화**: Vite는 기본적으로 HMR이 활성화되어 있습니다
- **작동 방식**: 
  - `.tsx`, `.ts`, `.css` 파일 변경 시 즉시 반영
  - 페이지 새로고침 없이 변경사항 적용
  - 상태 유지 (React Fast Refresh)

### Backend (Uvicorn Reload)
- **자동 활성화**: `main.py`에서 `reload=True` 설정
- **작동 방식**:
  - `.py` 파일 변경 시 서버 자동 재시작
  - 약 1-2초 소요
  - API 요청 중에는 재시작 대기

## 📁 프로젝트 구조

```
edupy/
├── package.json          # 루트 package.json (concurrently)
├── frontend/
│   ├── src/
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── components/  # 재사용 컴포넌트
│   │   ├── store/       # Zustand 상태 관리
│   │   ├── services/    # LocalStorage 서비스
│   │   ├── types/       # TypeScript 타입
│   │   └── data/        # 정적 데이터
│   └── package.json
└── backend/
    ├── main.py          # FastAPI 앱 진입점
    ├── requirements.txt
    └── venv/            # Python 가상환경
```

## 🔧 유용한 명령어

### 루트 디렉토리
```bash
npm run dev              # 프론트엔드 + 백엔드 동시 실행
npm run frontend         # 프론트엔드만 실행
npm run backend          # 백엔드만 실행
npm run setup            # 모든 의존성 설치
npm run build            # 프론트엔드 빌드
```

### Frontend
```bash
cd frontend
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run preview          # 빌드 결과 미리보기
npm run lint             # ESLint 실행
```

### Backend
```bash
cd backend
python main.py           # 개발 서버 (핫리로딩)
uvicorn main:app --reload  # 대체 실행 방법
```

## 🐛 문제 해결

### Frontend가 시작되지 않을 때
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend가 시작되지 않을 때
```bash
cd backend
source venv/bin/activate  # 가상환경 활성화
pip install -r requirements.txt
python main.py
```

### 포트가 이미 사용 중일 때
- Frontend (5173): Vite가 자동으로 다른 포트 찾음
- Backend (8000): `main.py`에서 포트 변경

## 📝 개발 워크플로우

1. **새 기능 개발 시작**
   ```bash
   git checkout -b feature/new-feature
   npm run dev  # 개발 서버 시작
   ```

2. **코드 작성**
   - Frontend: `frontend/src/` 에서 작업
   - Backend: `backend/` 에서 작업
   - 파일 저장 시 자동으로 핫리로딩

3. **테스트**
   - 브라우저에서 http://localhost:5173 확인
   - API는 http://localhost:8000/docs 에서 테스트

4. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ```

5. **PR 생성**
   - GitHub에서 Pull Request 생성
   - 리뷰 후 Squash and Merge

## 🎯 다음 단계

- [ ] 타이핑 연습 기능 완성
- [ ] 파이썬 학습 페이지 구현
- [ ] 파이게임 페이지 구현
- [ ] Backend API 엔드포인트 구현
- [ ] Docker 코드 실행 환경 구축

