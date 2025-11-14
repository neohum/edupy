# EduPy 시스템 아키텍처

## 🏛️ 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │  타이핑 연습  │  파이썬 학습  │  파이게임 만들기         │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                                                              │
│  - React Router (페이지 라우팅)                              │
│  - Zustand (상태 관리)                                       │
│  - Monaco Editor (코드 에디터)                               │
│  - Tailwind CSS (스타일링)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Gateway & Router                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │  Auth API    │  Typing API  │  Python Learning API │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │  Pygame API  │  Code Execution Service              │   │
│  └──────────────┴──────────────────────────────────────┘   │
│                                                              │
│  - JWT Authentication                                        │
│  - SQLAlchemy ORM                                            │
│  - Pydantic Validation                                       │
└────────┬───────────────────────┬────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────────┐
│   PostgreSQL    │    │  Code Execution Engine   │
│   (Supabase)    │    │  (Docker Containers)     │
│                 │    │                          │
│  - Users        │    │  - Python Sandbox        │
│  - Progress     │    │  - Pygame Sandbox        │
│  - Lessons      │    │  - Resource Limits       │
│  - Projects     │    │  - Security Isolation    │
└─────────────────┘    └──────────────────────────┘
```

## 🔄 데이터 흐름 (LocalStorage 기반)

### 1. 타이핑 연습 플로우
```
사용자 입력
    ↓
Frontend: 타이핑 측정 (WPM, 정확도 계산)
    ↓
LocalStorage: 진행도 저장
  - edupy_typing_progress 업데이트
  - edupy_typing_stats 업데이트
    ↓
Frontend: 통계 업데이트 및 화면 표시
```

### 2. 파이썬 코드 실행 플로우
```
사용자가 코드 작성
    ↓
Frontend: 코드 전송
    ↓
API 호출: POST /api/python/execute (익명)
    ↓
Backend: 코드 검증
    ↓
Code Execution Engine:
  - Docker 컨테이너 생성
  - 코드 실행 (시간/메모리 제한)
  - 결과 수집
    ↓
Backend: 결과 반환
    ↓
Frontend:
  - 결과 표시 (출력, 에러)
  - LocalStorage에 코드 저장 (edupy_python_progress)
```

### 3. 파이게임 프로젝트 저장 플로우
```
사용자가 게임 코드 작성
    ↓
Frontend: 프로젝트 데이터 준비
    ↓
LocalStorage: 프로젝트 저장
  - edupy_pygame_projects 배열에 추가/업데이트
  - 자동 저장 (타이핑 시마다)
    ↓
Frontend: 프로젝트 목록 업데이트
```

### 4. 데이터 내보내기/가져오기 플로우
```
[내보내기]
사용자가 "데이터 내보내기" 클릭
    ↓
Frontend:
  - 모든 localStorage 데이터 수집
  - JSON 파일 생성
  - 파일 다운로드

[가져오기]
사용자가 JSON 파일 선택
    ↓
Frontend:
  - 파일 읽기 및 검증
  - localStorage에 데이터 복원
  - 페이지 새로고침 또는 상태 업데이트
```

## 💾 LocalStorage 관리 플로우

```
1. 앱 초기 로드
   사용자가 앱 접속
        ↓
   Frontend: localStorage 데이터 읽기
        ↓
   데이터 존재 여부 확인
        ↓
   [데이터 있음] → 상태 복원 및 이전 학습 위치로 이동
   [데이터 없음] → 초기 상태로 시작

2. 학습 중 자동 저장
   사용자 활동 (타이핑, 코드 작성 등)
        ↓
   Frontend: 상태 변경 감지
        ↓
   LocalStorage 자동 업데이트
        ↓
   저장 완료 표시 (선택적)

3. 데이터 동기화 (다중 탭)
   탭 A에서 학습
        ↓
   LocalStorage 업데이트
        ↓
   탭 B에서 'storage' 이벤트 감지
        ↓
   탭 B 상태 자동 업데이트

4. 데이터 백업
   사용자가 "백업" 버튼 클릭
        ↓
   모든 localStorage 데이터 수집
        ↓
   JSON 파일로 다운로드
        ↓
   사용자 기기에 저장
```

## 📦 컴포넌트 구조

### Frontend 컴포넌트 계층

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar (선택적)
│   └── Footer
│
├── Pages
│   ├── Home
│   │   ├── HeroSection
│   │   ├── FeatureCards
│   │   └── ProgressDashboard
│   │
│   ├── Typing
│   │   ├── TypingLessonList
│   │   ├── TypingPractice
│   │   │   ├── TextDisplay
│   │   │   ├── InputArea
│   │   │   └── StatsPanel
│   │   └── TypingStats
│   │
│   ├── Python
│   │   ├── LessonList
│   │   ├── LessonDetail
│   │   │   ├── ContentViewer
│   │   │   ├── CodeEditor
│   │   │   └── OutputPanel
│   │   ├── Playground
│   │   └── Quiz
│   │
│   └── Pygame
│       ├── TutorialList
│       ├── ProjectEditor
│       │   ├── CodeEditor
│       │   ├── FileExplorer
│       │   ├── GameCanvas
│       │   └── Console
│       ├── Gallery
│       └── MyProjects
│
└── Common Components
    ├── Button
    ├── Input
    ├── Modal
    ├── Card
    ├── Loading
    └── ErrorBoundary
```

## 🗃️ 상태 관리 구조 (LocalStorage 통합)

```typescript
// Zustand Store 구조

interface AppState {
  // 타이핑 상태
  typing: {
    currentLesson: Lesson | null;
    progress: TypingProgress; // localStorage에서 로드
    stats: TypingStats; // localStorage에서 로드
    saveProgress: (data: TypingResult) => void; // localStorage에 저장
    loadProgress: () => void; // localStorage에서 로드
  };

  // 파이썬 학습 상태
  python: {
    lessons: Lesson[]; // API에서 가져옴
    currentLesson: Lesson | null;
    progress: PythonProgress; // localStorage에서 로드
    savedCodes: SavedCode[]; // localStorage에서 로드
    code: string;
    output: string;
    executeCode: (code: string) => Promise<void>;
    saveCode: (title: string, code: string) => void; // localStorage에 저장
    loadProgress: () => void;
  };

  // 파이게임 상태
  pygame: {
    tutorials: Tutorial[]; // API에서 가져옴
    projects: PygameProject[]; // localStorage에서 로드
    currentProject: PygameProject | null;
    progress: PygameProgress; // localStorage에서 로드
    createProject: (data: ProjectData) => void; // localStorage에 저장
    updateProject: (id: string, data: ProjectData) => void;
    deleteProject: (id: string) => void;
    loadProjects: () => void;
  };

  // 설정
  settings: {
    theme: 'light' | 'dark';
    fontSize: number;
    editorTheme: string;
    soundEnabled: boolean;
    updateSettings: (settings: Partial<Settings>) => void;
    loadSettings: () => void;
  };

  // 데이터 관리
  data: {
    exportData: () => string; // JSON 문자열 반환
    importData: (jsonData: string) => void;
    clearAllData: () => void;
  };
}
```

## 🔌 API 서비스 레이어 (간소화)

```typescript
// services/api.ts

class ApiService {
  private baseURL: string;

  // Typing (콘텐츠만)
  async getTypingLessons(): Promise<Lesson[]>;
  async getTypingLesson(id: string): Promise<Lesson>;

  // Python
  async getPythonLessons(): Promise<Lesson[]>;
  async getPythonLesson(id: string): Promise<Lesson>;
  async executeCode(code: string): Promise<ExecutionResult>;
  async getQuiz(id: string): Promise<Quiz>;

  // Pygame
  async getPygameTutorials(): Promise<Tutorial[]>;
  async getPygameTutorial(id: string): Promise<Tutorial>;
  async executeGame(code: string): Promise<ExecutionResult>;
}

// services/storage.ts

class StorageService {
  // 타이핑
  saveTypingProgress(data: TypingResult): void;
  getTypingProgress(): TypingProgress;
  getTypingStats(): TypingStats;

  // 파이썬
  savePythonProgress(lessonId: string, data: LessonProgress): void;
  getPythonProgress(): PythonProgress;
  saveCode(title: string, code: string): SavedCode;
  getSavedCodes(): SavedCode[];
  deleteCode(id: string): void;

  // 파이게임
  saveProject(project: PygameProject): void;
  getProjects(): PygameProject[];
  getProject(id: string): PygameProject | null;
  updateProject(id: string, data: Partial<PygameProject>): void;
  deleteProject(id: string): void;
  savePygameProgress(tutorialId: string): void;
  getPygameProgress(): PygameProgress;

  // 설정
  saveSettings(settings: Settings): void;
  getSettings(): Settings;

  // 데이터 관리
  exportAllData(): string; // JSON 문자열
  importAllData(jsonData: string): void;
  clearAllData(): void;
}
```

## 🐳 Docker 구성

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Code Execution Sandbox Dockerfile
```dockerfile
FROM python:3.11-slim

# 보안 설정
RUN useradd -m -u 1000 sandbox
USER sandbox

WORKDIR /sandbox

# Pygame 설치
RUN pip install --user pygame

# 실행 제한 설정
ENV PYTHONUNBUFFERED=1
ENV PYGAME_HIDE_SUPPORT_PROMPT=1
```

## 🚀 배포 아키텍처

```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
▼                 ▼                 ▼
Vercel          Railway         Supabase
(Frontend)      (Backend)       (Database)
    │               │                │
    └───────────────┴────────────────┘
                    │
                    ▼
              Production URL
           https://edupy.com
```

## 📊 성능 최적화 전략

### Frontend
- **코드 스플리팅**: 각 페이지별로 lazy loading
- **이미지 최적화**: WebP 포맷, lazy loading
- **캐싱**: React Query로 API 응답 캐싱
- **번들 최적화**: Tree shaking, minification

### Backend
- **데이터베이스 최적화**:
  - 인덱스: user_id, lesson_id, created_at
  - 쿼리 최적화: N+1 문제 해결
- **캐싱**: Redis로 자주 조회되는 데이터 캐싱
- **비동기 처리**: 코드 실행은 백그라운드 작업

### Code Execution
- **컨테이너 풀링**: 미리 생성된 컨테이너 재사용
- **리소스 제한**: CPU 50%, 메모리 128MB, 시간 5초
- **결과 캐싱**: 동일 코드 실행 결과 캐싱

## 🔒 보안 계층

```
┌─────────────────────────────────────────┐
│  Frontend Security                       │
│  - XSS 방지 (React 자동 이스케이핑)      │
│  - CSRF 토큰                             │
│  - Content Security Policy               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  API Security                            │
│  - JWT 인증                              │
│  - Rate Limiting (100 req/min)           │
│  - Input Validation (Pydantic)           │
│  - CORS 설정                             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Database Security                       │
│  - SQL Injection 방지 (ORM)              │
│  - 암호화된 연결 (SSL)                   │
│  - 비밀번호 해싱 (bcrypt)                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Code Execution Security                 │
│  - Docker 격리                           │
│  - 네트워크 차단                         │
│  - 파일시스템 제한                       │
│  - 리소스 제한                           │
└─────────────────────────────────────────┘
```

## 📈 확장성 고려사항

### 수평 확장
- Backend: 여러 인스턴스 실행 (로드 밸런서)
- Database: Read Replica 추가
- Code Execution: 별도 서버로 분리

### 수직 확장
- 서버 리소스 증가
- 데이터베이스 성능 향상

### 마이크로서비스 전환 (미래)
```
API Gateway
    ↓
┌────────┬────────┬────────┬────────┐
│ Auth   │ Typing │ Python │ Pygame │
│ Service│ Service│ Service│ Service│
└────────┴────────┴────────┴────────┘
```
