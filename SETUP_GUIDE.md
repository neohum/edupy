# 🚀 EduPy 프로젝트 설정 가이드

이 문서는 EduPy 프로젝트를 처음부터 설정하는 방법을 단계별로 안내합니다.

## 📋 목차

1. [Git 설정 및 GitHub 연결](#1-git-설정-및-github-연결)
2. [Frontend 프로젝트 초기화](#2-frontend-프로젝트-초기화)
3. [Backend 프로젝트 초기화](#3-backend-프로젝트-초기화)
4. [데이터베이스 설정 (Supabase)](#4-데이터베이스-설정-supabase)
5. [개발 환경 실행](#5-개발-환경-실행)

---

## 1. Git 설정 및 GitHub 연결

### 1.1 Git 사용자 정보 설정

```bash
# 사용자 이름 설정
git config --global user.name "Your Name"

# 이메일 설정 (GitHub 계정 이메일)
git config --global user.email "neohum77@gmail.com"

# 기본 브랜치를 main으로 설정
git config --global init.defaultBranch main

# 설정 확인
git config --list
```

### 1.2 Git 저장소 초기화

```bash
# 프로젝트 루트 디렉토리에서
git init

# 현재 상태 확인
git status
```

### 1.3 GitHub 저장소 생성 및 연결

#### GitHub에서 저장소 생성
1. https://github.com 접속
2. 우측 상단 `+` 버튼 클릭 → `New repository`
3. Repository name: `edupy`
4. Description: `통합 파이썬 학습 플랫폼`
5. Public 또는 Private 선택
6. **"Initialize this repository with a README" 체크 해제** (이미 로컬에 README가 있음)
7. `Create repository` 클릭

#### 로컬 저장소와 연결

```bash
# GitHub 저장소와 연결 (HTTPS)
git remote add origin https://github.com/neohum/edupy.git

# 또는 SSH 사용 시
# git remote add origin git@github.com:neohum/edupy.git

# 연결 확인
git remote -v
```

### 1.4 첫 커밋 및 푸시

```bash
# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "docs: 프로젝트 초기 설정 및 설계 문서 작성"

# GitHub에 푸시
git push -u origin main
```

---

## 2. Frontend 프로젝트 초기화

### 2.1 React + Vite 프로젝트 생성

```bash
# Vite로 React TypeScript 프로젝트 생성
npm create vite@latest frontend -- --template react-ts

# frontend 디렉토리로 이동
cd frontend

# 의존성 설치
npm install
```

### 2.2 필수 패키지 설치

```bash
# 라우팅
npm install react-router-dom

# 상태 관리
npm install zustand

# API 통신
npm install axios

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 코드 에디터
npm install @monaco-editor/react

# 차트 라이브러리
npm install recharts

# 유틸리티
npm install clsx
npm install date-fns
```

### 2.3 Tailwind CSS 설정

`tailwind.config.js` 파일 수정:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
      },
    },
  },
  plugins: [],
}
```

`src/index.css` 파일에 추가:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.4 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 확인

---

## 3. Backend 프로젝트 초기화

### 3.1 디렉토리 생성 및 가상환경 설정

```bash
# 프로젝트 루트로 돌아가기
cd ..

# backend 디렉토리 생성
mkdir backend
cd backend

# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
```

### 3.2 필수 패키지 설치

```bash
# FastAPI 및 서버
pip install fastapi
pip install "uvicorn[standard]"

# 데이터베이스
pip install sqlalchemy
pip install psycopg2-binary  # PostgreSQL 드라이버
pip install alembic  # 마이그레이션 도구

# 인증
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install python-multipart

# 환경 변수
pip install python-dotenv

# CORS
pip install fastapi-cors

# 의존성 파일 생성
pip freeze > requirements.txt
```

### 3.3 프로젝트 구조 생성

```bash
# app 디렉토리 및 하위 구조 생성
mkdir -p app/api app/models app/schemas app/services app/core app/utils

# __init__.py 파일 생성
touch app/__init__.py
touch app/api/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py
touch app/core/__init__.py
touch app/utils/__init__.py

# main.py 생성
touch app/main.py
```

### 3.4 기본 FastAPI 앱 생성

`app/main.py` 파일 생성:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduPy API",
    description="통합 파이썬 학습 플랫폼 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to EduPy API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 3.5 개발 서버 실행

```bash
uvicorn app.main:app --reload
```

브라우저에서 `http://localhost:8000/docs` 접속하여 API 문서 확인

---

## 4. 데이터베이스 설정 (Supabase)

### 4.1 Supabase 프로젝트 생성

1. https://supabase.com 접속 및 로그인
2. `New Project` 클릭
3. 프로젝트 정보 입력:
   - Name: `edupy`
   - Database Password: 안전한 비밀번호 생성 (저장 필수!)
   - Region: 가까운 지역 선택 (예: Northeast Asia)
4. `Create new project` 클릭

### 4.2 데이터베이스 연결 정보 확인

1. 프로젝트 대시보드에서 `Settings` → `Database` 클릭
2. `Connection string` 섹션에서 `URI` 복사

### 4.3 환경 변수 설정

`backend/.env` 파일 생성:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Secret (랜덤 문자열 생성)
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
```

**보안 주의**: `.env` 파일은 절대 Git에 커밋하지 마세요! (`.gitignore`에 이미 포함됨)

---

## 5. 개발 환경 실행

### 5.1 터미널 2개 사용

**터미널 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # 가상환경 활성화
uvicorn app.main:app --reload
```

**터미널 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### 5.2 접속 확인

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs

---

## 🎉 완료!

이제 개발을 시작할 준비가 되었습니다!

### 다음 단계

1. [ROADMAP.md](./ROADMAP.md)를 참고하여 Phase 1 작업 시작
2. [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)를 참고하여 브랜치 생성 및 작업
3. 기능 구현 후 PR 생성

### 유용한 명령어

```bash
# Git 상태 확인
git status

# 새 브랜치 생성 및 이동
git checkout -b feature/your-feature-name

# 변경사항 커밋
git add .
git commit -m "feat: your feature description"

# GitHub에 푸시
git push origin feature/your-feature-name
```

---

## 🆘 문제 해결

### Frontend가 실행되지 않을 때
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend가 실행되지 않을 때
```bash
cd backend
deactivate  # 가상환경 비활성화
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 데이터베이스 연결 오류
- `.env` 파일의 `DATABASE_URL`이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 비밀번호에 특수문자가 있다면 URL 인코딩 필요

---

**Happy Coding! 🚀**
