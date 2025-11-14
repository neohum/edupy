# 🎓 EduPy - 통합 파이썬 학습 플랫폼

> 파이썬 학습부터 게임 제작까지 - 올인원 교육 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)

## 📖 프로젝트 소개

EduPy는 프로그래밍 입문자를 위한 통합 학습 플랫폼입니다. 파이썬 프로그래밍을 배우고, 최종적으로 자신만의 게임을 만들 수 있습니다.

### ✨ 주요 기능

#### 🐍 1. 파이썬 학습
- 단계별 파이썬 강의 (기초부터 고급까지)
- 인터랙티브 코드 에디터 (Monaco Editor)
- 실시간 코드 실행 및 결과 확인
- 퀴즈 및 연습 문제
- 코드 플레이그라운드
- **학습 진행도 자동 저장 및 복원**

#### 🎮 2. 파이게임 만들기
- Pygame 튜토리얼
- 실시간 게임 에디터 (코드 + 미리보기)
- 프로젝트 자동 저장 (LocalStorage)
- 데이터 내보내기/가져오기 기능

## 🏗️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (핫리로딩 지원)
- **Styling**: CSS Modules
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (예정)
- **Routing**: React Router v6
- **Charts**: Recharts (예정)

### Backend
- **Framework**: FastAPI (핫리로딩 지원)
- **Language**: Python 3.11+
- **Database**: PostgreSQL (콘텐츠 저장용)
- **ORM**: SQLAlchemy
- **Authentication**: 없음 (LocalStorage 사용)
- **Code Execution**: Docker Sandbox

### Infrastructure
- **Data Storage**: LocalStorage (클라이언트)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Code Execution**: Docker

### 데이터 관리
- **진행도 저장**: 브라우저 LocalStorage
- **회원가입**: 불필요
- **데이터 백업**: JSON 파일 내보내기/가져오기

## 📁 프로젝트 구조

```
edupy/
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/   # 재사용 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── hooks/        # Custom Hooks
│   │   ├── store/        # 상태 관리
│   │   └── services/     # API 서비스
│   └── package.json
│
├── backend/              # FastAPI 백엔드
│   ├── app/
│   │   ├── api/         # API 라우터
│   │   ├── models/      # DB 모델
│   │   ├── schemas/     # Pydantic 스키마
│   │   └── services/    # 비즈니스 로직
│   └── requirements.txt
│
├── docs/                 # 문서
│   ├── DESIGN.md        # 설계 문서
│   ├── ARCHITECTURE.md  # 아키텍처 문서
│   └── ROADMAP.md       # 개발 로드맵
│
└── README.md
```

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- Python 3.11+
- npm 또는 yarn

### 🎯 한 번에 모두 실행하기 (권장)

```bash
# 1. 모든 의존성 설치
npm run setup

# 2. 프론트엔드와 백엔드 동시 실행 (핫리로딩 지원)
npm run dev
```

이 명령어로 다음이 동시에 실행됩니다:
- **Frontend**: http://localhost:5173 (Vite 핫리로딩)
- **Backend**: http://localhost:8000 (Uvicorn 핫리로딩)
- **API Docs**: http://localhost:8000/docs (Swagger UI)

### 개별 실행

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

### 처음 설정하기

#### 1. 전체 프로젝트 설정

```bash
# 루트 디렉토리에서 실행
npm run setup
```

이 명령어는 다음을 수행합니다:
- 루트 package.json 의존성 설치 (concurrently)
- Frontend 의존성 설치
- Backend 의존성 설치 (Python 가상환경 필요)

#### 2. Backend 가상환경 설정 (처음 한 번만)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. 개발 서버 실행

```bash
# 루트 디렉토리에서
npm run dev
```

이제 다음 URL에서 확인할 수 있습니다:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📚 문서

- [📐 설계 문서 (DESIGN.md)](./DESIGN.md) - 전체 시스템 설계 및 기능 명세
- [🏛️ 아키텍처 문서 (ARCHITECTURE.md)](./ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [🗺️ 개발 로드맵 (ROADMAP.md)](./ROADMAP.md) - 단계별 개발 계획
- [🔀 Git Workflow (GIT_WORKFLOW.md)](./GIT_WORKFLOW.md) - Git 브랜치 전략 및 협업 가이드
- [📦 LocalStorage 가이드 (docs/LOCALSTORAGE_GUIDE.md)](./docs/LOCALSTORAGE_GUIDE.md) - LocalStorage 사용법 및 데이터 구조

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 Fork 합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

자세한 내용은 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)를 참조하세요.

## 📝 커밋 메시지 규칙

- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `docs:` - 문서 수정
- `style:` - 코드 포맷팅
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 코드
- `chore:` - 빌드/설정 변경

## 🧪 테스트

### Frontend 테스트
```bash
cd frontend
npm run test
```

### Backend 테스트
```bash
cd backend
pytest
```

## 📈 개발 진행 상황

현재 진행 상황은 [ROADMAP.md](./ROADMAP.md)에서 확인할 수 있습니다.

- [x] 프로젝트 초기 설정
- [x] 설계 문서 작성
- [ ] Phase 1: MVP 개발 (진행 중)
- [ ] Phase 2: 기능 확장
- [ ] Phase 3: 고급 기능
- [ ] Phase 4: 배포

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발자**: [Your Name]
- **이메일**: neohum77@gmail.com
- **GitHub**: [@neohum](https://github.com/neohum)

## 🙏 감사의 말

- [FastAPI](https://fastapi.tiangolo.com/) - 훌륭한 Python 웹 프레임워크
- [React](https://reactjs.org/) - 강력한 UI 라이브러리
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code의 코드 에디터
- [Pygame](https://www.pygame.org/) - 게임 개발 라이브러리
- [Supabase](https://supabase.com/) - 오픈소스 Firebase 대안

## 📞 문의

질문이나 제안사항이 있으시면 이슈를 생성하거나 이메일로 연락주세요.

---

**Made with ❤️ by EduPy Team**
