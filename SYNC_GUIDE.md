# 🔄 EduPy 프로젝트 동기화 가이드

## 📋 목차
1. [현재 상태 확인](#현재-상태-확인)
2. [다른 컴퓨터에서 동기화](#다른-컴퓨터에서-동기화)
3. [충돌 해결](#충돌-해결)
4. [환경 변수 설정](#환경-변수-설정)

---

## 🔍 현재 상태 확인

### 로컬 저장소 상태
```bash
# 현재 브랜치 확인
git branch

# 현재 커밋 확인
git log --oneline -5

# 원격 저장소와 비교
git fetch origin
git status
```

### 최신 커밋 정보
- **커밋 해시:** `618eb6d`
- **커밋 메시지:** feat: Add copy buttons and turtle module enhancements (#5)
- **브랜치:** main

---

## 💻 다른 컴퓨터에서 동기화

### 1️⃣ 처음 클론하는 경우

```bash
# 저장소 클론
git clone https://github.com/neohum/edupy.git
cd edupy

# 브랜치 확인
git branch -a

# main 브랜치로 전환 (이미 main이면 생략)
git checkout main
```

### 2️⃣ 이미 클론한 저장소가 있는 경우

```bash
cd edupy

# 현재 변경사항 확인
git status

# 변경사항이 있다면 스태시에 저장
git stash

# 원격 저장소에서 최신 정보 가져오기
git fetch origin --prune

# main 브랜치로 전환
git checkout main

# 원격 main과 동기화
git pull origin main

# 스태시한 변경사항 복원 (필요한 경우)
git stash pop
```

### 3️⃣ 강제 동기화 (로컬 변경사항 무시)

⚠️ **주의:** 로컬의 모든 변경사항이 삭제됩니다!

```bash
# 현재 브랜치 확인
git branch

# main 브랜치로 전환
git checkout main

# 로컬 변경사항 모두 삭제
git reset --hard origin/main

# 추적되지 않는 파일 삭제
git clean -fd
```

---

## 🔧 충돌 해결

### 충돌이 발생한 경우

```bash
# 1. 충돌 파일 확인
git status

# 2. 충돌 파일 수동 편집
# (충돌 마커 <<<<<<, ======, >>>>>> 제거)

# 3. 충돌 해결 후 스테이징
git add <충돌_파일>

# 4. 커밋
git commit -m "Resolve merge conflicts"

# 5. 푸시
git push origin main
```

### 충돌 회피 (원격 우선)

```bash
# 원격 저장소 내용으로 덮어쓰기
git fetch origin
git reset --hard origin/main
```

---

## 🔐 환경 변수 설정

### `.env` 파일 생성

⚠️ **중요:** `.env` 파일은 Git에 커밋되지 않습니다!

각 컴퓨터에서 별도로 생성해야 합니다.

#### 백엔드 `.env` 파일

```bash
# backend/.env 파일 생성
cd backend
cat > .env << 'EOF'
RESEND_API_KEY=REDACTED_RESEND_KEY
EOF
```

또는 수동으로 생성:

```env
# backend/.env
RESEND_API_KEY=REDACTED_RESEND_KEY
```

---

## 📦 의존성 설치

### 백엔드 의존성

```bash
cd backend

# 가상환경 생성 (처음만)
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 프론트엔드 의존성

```bash
cd frontend

# 의존성 설치
npm install --legacy-peer-deps
```

---

## 🚀 서버 실행

### 통합 실행 (권장)

```bash
# 프로젝트 루트에서
./start-dev.sh
```

### 개별 실행

```bash
# 백엔드만
./start-backend.sh

# 프론트엔드만
./start-frontend.sh
```

---

## ✅ 동기화 체크리스트

- [ ] Git 저장소 최신 상태로 업데이트
- [ ] `.env` 파일 생성 (backend/.env)
- [ ] 백엔드 의존성 설치
- [ ] 프론트엔드 의존성 설치
- [ ] 서버 실행 테스트
- [ ] 브라우저에서 접속 확인 (http://localhost:5173)

---

## 🆘 문제 해결

### 문제 1: "Your branch is behind"

```bash
git pull origin main
```

### 문제 2: "Please commit your changes or stash them"

```bash
git stash
git pull origin main
git stash pop
```

### 문제 3: 의존성 설치 오류

```bash
# 백엔드
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 프론트엔드
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 문제 4: 포트 충돌

```bash
# 포트 8000 사용 중인 프로세스 종료
lsof -ti:8000 | xargs kill -9

# 포트 5173 사용 중인 프로세스 종료
lsof -ti:5173 | xargs kill -9
```

---

## 📞 추가 도움

문제가 계속되면 다음을 확인하세요:

1. Git 버전: `git --version`
2. Python 버전: `python --version`
3. Node.js 버전: `node --version`
4. 현재 브랜치: `git branch`
5. 원격 저장소 상태: `git remote -v`

