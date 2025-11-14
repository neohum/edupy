# EduPy 웹서비스 설계 문서

## 📋 프로젝트 개요

**프로젝트명**: EduPy (Education + Python)  
**목적**: 타이핑 연습부터 파이썬 학습, 게임 제작까지 통합 교육 플랫폼  
**대상**: 프로그래밍 입문자 및 초중급 학습자

## 🎯 핵심 기능 (3개 파트)

### 1. 한/영 자판 연습
- 한글 타이핑 연습
- 영문 타이핑 연습
- 타이핑 속도 측정 (WPM, 정확도)
- 진행도 추적 및 통계

### 2. 파이썬 학습
- 단계별 파이썬 강의
- 인터랙티브 코드 에디터
- 실시간 코드 실행 및 결과 확인
- 퀴즈 및 연습 문제

### 3. 파이게임 만들기
- 파이게임 튜토리얼
- 게임 프로젝트 템플릿
- 코드 에디터 + 실시간 미리보기
- 완성 게임 갤러리

## 🏗️ 기술 스택

### Frontend
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **Code Editor**: Monaco Editor (VS Code 엔진)
- **Routing**: React Router v6

### Backend
- **Framework**: FastAPI (Python)
- **Language**: Python 3.11+
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **Code Execution**: Docker containers (보안 샌드박스)

### Infrastructure
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: 
  - Frontend: Vercel or Netlify
  - Backend: Railway or Render
- **Code Execution**: Piston API or custom Docker solution

## 📁 프로젝트 구조

```
edupy/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── common/      # 공통 컴포넌트 (Button, Input 등)
│   │   │   ├── layout/      # 레이아웃 컴포넌트 (Header, Footer, Sidebar)
│   │   │   └── editor/      # 코드 에디터 관련
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── Home.tsx
│   │   │   ├── typing/      # 자판 연습 페이지
│   │   │   ├── python/      # 파이썬 학습 페이지
│   │   │   └── pygame/      # 파이게임 페이지
│   │   ├── hooks/           # Custom React Hooks
│   │   ├── store/           # 상태 관리
│   │   ├── services/        # API 호출 로직
│   │   ├── utils/           # 유틸리티 함수
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py          # FastAPI 앱 진입점
│   │   ├── api/             # API 라우터
│   │   │   ├── typing.py    # 자판 연습 API
│   │   │   ├── python.py    # 파이썬 학습 API
│   │   │   ├── pygame.py    # 파이게임 API
│   │   │   ├── auth.py      # 인증 API
│   │   │   └── users.py     # 사용자 API
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── services/        # 비즈니스 로직
│   │   │   ├── code_executor.py  # 코드 실행 서비스
│   │   │   └── progress_tracker.py
│   │   ├── core/            # 설정 및 보안
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   └── utils/
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                 # 데이터베이스 관련
│   ├── migrations/          # DB 마이그레이션
│   └── seeds/               # 초기 데이터
│
├── docs/                     # 문서
│   ├── api/                 # API 문서
│   └── user-guide/          # 사용자 가이드
│
├── GIT_WORKFLOW.md
├── DESIGN.md
└── README.md
```

## 💾 데이터 저장 전략

### LocalStorage 기반 저장 (인증 불필요)

모든 학습 데이터는 브라우저의 localStorage에 저장되어 별도의 회원가입/로그인 없이 사용 가능합니다.

#### LocalStorage 키 구조

```typescript
// 타이핑 진행도
edupy_typing_progress: {
  korean: [
    {
      lessonId: string,
      wpm: number,
      accuracy: number,
      completedAt: string,
      mistakes: string[]
    }
  ],
  english: [...]
}

// 타이핑 통계
edupy_typing_stats: {
  totalPractices: number,
  averageWpm: number,
  averageAccuracy: number,
  bestWpm: number,
  totalTime: number, // 초 단위
  lastPracticeDate: string
}

// 파이썬 학습 진행도
edupy_python_progress: {
  completedLessons: string[], // lesson IDs
  lessonScores: {
    [lessonId: string]: {
      score: number,
      completed: boolean,
      lastCode: string,
      completedAt: string
    }
  },
  currentLesson: string // 현재 학습 중인 레슨 ID
}

// 파이썬 저장된 코드
edupy_python_saved_codes: [
  {
    id: string,
    title: string,
    code: string,
    createdAt: string,
    updatedAt: string
  }
]

// 파이게임 프로젝트
edupy_pygame_projects: [
  {
    id: string,
    title: string,
    description: string,
    code: string,
    files: {
      [filename: string]: string // 파일명: 코드 내용
    },
    createdAt: string,
    updatedAt: string
  }
]

// 파이게임 진행도
edupy_pygame_progress: {
  completedTutorials: string[],
  currentTutorial: string
}

// 앱 설정
edupy_settings: {
  theme: 'light' | 'dark',
  fontSize: number,
  editorTheme: string,
  soundEnabled: boolean
}
```

### 백엔드 데이터베이스 스키마 (간소화)

인증 시스템을 제거하고 콘텐츠 제공에만 집중합니다.

#### Lessons (강의 콘텐츠)
```sql
- id: UUID (PK)
- category: ENUM('typing', 'python', 'pygame')
- title: VARCHAR(255)
- description: TEXT
- content: JSONB
- order: INTEGER
- difficulty: ENUM('beginner', 'intermediate', 'advanced')
- created_at: TIMESTAMP
```

#### TypingLessons (타이핑 레슨 텍스트)
```sql
- id: UUID (PK)
- language: ENUM('korean', 'english')
- level: ENUM('beginner', 'intermediate', 'advanced')
- title: VARCHAR(255)
- text: TEXT
- order: INTEGER
```

#### CodeExecutionLogs (선택사항 - 통계용)
```sql
- id: UUID (PK)
- session_id: VARCHAR(100) // 익명 세션 ID
- code_hash: VARCHAR(64)
- execution_time: INTEGER
- success: BOOLEAN
- created_at: TIMESTAMP
```

## 🎨 주요 페이지 및 기능

### 1. 홈페이지 (/)
- 3개 파트 소개 카드
- 학습 진행도 대시보드 (로그인 시)
- 최근 활동 표시

### 2. 자판 연습 (/typing)

#### 2.1 한글 타이핑 (/typing/korean)
- **기능**:
  - 자음/모음 연습 모드
  - 단어 연습 모드
  - 문장 연습 모드
  - 실시간 WPM 및 정확도 표시
  - 오타 하이라이팅
  - 진행도 그래프

#### 2.2 영문 타이핑 (/typing/english)
- **기능**:
  - 홈 로우 연습
  - 단어 연습
  - 문장 연습
  - 코드 타이핑 연습 (프로그래밍 특화)
  - 타이핑 게임 모드

#### 2.3 통계 대시보드 (/typing/stats)
- 일별/주별/월별 진행도
- WPM 추이 그래프
- 정확도 분석
- 취약 키 분석

### 3. 파이썬 학습 (/python)

#### 3.1 강의 목록 (/python/lessons)
- **커리큘럼**:
  1. 기초 (변수, 자료형, 연산자)
  2. 제어문 (if, for, while)
  3. 함수
  4. 자료구조 (리스트, 딕셔너리, 튜플, 세트)
  5. 객체지향 프로그래밍
  6. 파일 입출력
  7. 모듈과 패키지
  8. 예외 처리

#### 3.2 강의 상세 (/python/lessons/:id)
- **구성**:
  - 이론 설명 (마크다운)
  - 예제 코드 (실행 가능)
  - 연습 문제
  - 코드 에디터 + 실행 버튼
  - 출력 결과 표시
  - 힌트 시스템

#### 3.3 코드 플레이그라운드 (/python/playground)
- 자유롭게 코드 작성 및 실행
- 코드 저장 기능
- 공유 기능

#### 3.4 퀴즈 (/python/quiz)
- 객관식/주관식 문제
- 코딩 문제
- 즉시 피드백
- 점수 및 해설

### 4. 파이게임 만들기 (/pygame)

#### 4.1 튜토리얼 (/pygame/tutorials)
- **프로젝트 기반 학습**:
  1. Pygame 기초 (윈도우, 이벤트)
  2. 도형 그리기
  3. 이미지와 스프라이트
  4. 움직임과 충돌 감지
  5. 사운드 추가
  6. 간단한 게임 만들기 (뱀 게임, 벽돌깨기 등)

#### 4.2 프로젝트 에디터 (/pygame/editor/:id)
- **2분할 레이아웃**:
  - 왼쪽: 코드 에디터 (Monaco Editor)
  - 오른쪽: 게임 실행 화면 (Canvas)
- **기능**:
  - 실시간 코드 실행
  - 에러 표시
  - 파일 관리 (여러 .py 파일)
  - 에셋 업로드 (이미지, 사운드)

#### 4.3 갤러리 (/pygame/gallery)
- 사용자들이 만든 게임 공유
- 좋아요 및 댓글
- 코드 보기 및 포크 기능
- 인기 게임 / 최신 게임

#### 4.4 내 프로젝트 (/pygame/my-projects)
- 프로젝트 목록
- 새 프로젝트 생성
- 프로젝트 삭제/수정

## 🔐 데이터 관리 및 백업

### LocalStorage 관리
- **자동 저장**: 모든 학습 활동은 자동으로 localStorage에 저장
- **데이터 용량**: 브라우저당 약 5-10MB 제한 (충분함)
- **데이터 지속성**: 브라우저 캐시를 지우지 않는 한 영구 보존

### 데이터 내보내기/가져오기 (선택 기능)
- **내보내기**: JSON 파일로 모든 학습 데이터 다운로드
- **가져오기**: 다른 브라우저나 기기에서 데이터 복원
- **사용 사례**:
  - 브라우저 변경 시
  - 다른 컴퓨터에서 학습 이어하기
  - 데이터 백업

### 개인정보 보호
- **서버 저장 없음**: 개인 학습 데이터는 서버에 저장되지 않음
- **익명 사용**: 회원가입 불필요
- **선택적 통계**: 익명화된 사용 통계만 수집 (옵트인)

## 🚀 API 엔드포인트 설계 (간소화)

### Health Check
```
GET    /api/health                            # 서버 상태 확인
```

### Typing API (콘텐츠 제공만)
```
GET    /api/typing/lessons                    # 레슨 목록
GET    /api/typing/lessons/:id                # 레슨 상세
```

### Python Learning API
```
GET    /api/python/lessons                    # 강의 목록
GET    /api/python/lessons/:id                # 강의 상세
POST   /api/python/execute                    # 코드 실행 (익명)
GET    /api/python/quiz/:id                   # 퀴즈 조회
```

### Pygame API
```
GET    /api/pygame/tutorials                  # 튜토리얼 목록
GET    /api/pygame/tutorials/:id              # 튜토리얼 상세
POST   /api/pygame/execute                    # 게임 실행 (익명)
```

### Data Export/Import API (선택 기능)
```
POST   /api/data/export                       # 데이터 내보내기 (클라이언트 측)
POST   /api/data/import                       # 데이터 가져오기 (클라이언트 측)
```

**참고**:
- 모든 진행도 저장은 클라이언트(localStorage)에서 처리
- 서버는 콘텐츠 제공 및 코드 실행만 담당
- 인증 불필요 (모든 API 공개)

## 🎨 UI/UX 디자인 가이드

### 디자인 시스템
- **컬러 팔레트**:
  - Primary: Blue (#3B82F6)
  - Secondary: Purple (#8B5CF6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)
  - Neutral: Gray scale

- **타이포그래피**:
  - 헤딩: Pretendard Bold
  - 본문: Pretendard Regular
  - 코드: Fira Code

### 반응형 디자인
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 접근성
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환

## 🔒 보안 고려사항

### 코드 실행 보안
- Docker 컨테이너 격리
- 실행 시간 제한 (5초)
- 메모리 제한 (128MB)
- 네트워크 접근 차단
- 파일 시스템 접근 제한

### 데이터 보안
- 비밀번호 해싱 (bcrypt)
- SQL Injection 방지 (ORM 사용)
- XSS 방지 (입력 검증 및 이스케이핑)
- CSRF 토큰
- HTTPS 강제

## 📊 성능 최적화

### Frontend
- 코드 스플리팅 (React.lazy)
- 이미지 최적화 (WebP)
- 번들 크기 최소화
- CDN 활용

### Backend
- 데이터베이스 인덱싱
- 쿼리 최적화
- 캐싱 (Redis)
- API Rate Limiting

## 🧪 테스트 전략

### Frontend
- Unit Tests: Vitest
- Component Tests: React Testing Library
- E2E Tests: Playwright

### Backend
- Unit Tests: pytest
- Integration Tests: pytest + TestClient
- API Tests: pytest + httpx

## 📈 모니터링 및 분석

- **에러 트래킹**: Sentry
- **분석**: Google Analytics
- **로깅**: Winston (Frontend), Python logging (Backend)
- **성능 모니터링**: Web Vitals

## 🚀 배포 전략

### CI/CD
- GitHub Actions
- 자동 테스트 실행
- 자동 배포 (main 브랜치 머지 시)

### 환경 분리
- Development
- Staging
- Production

## 📝 개발 우선순위

### Phase 1: MVP (4-6주)
1. ✅ 프로젝트 초기 설정
2. ✅ 인증 시스템
3. ✅ 기본 레이아웃 및 네비게이션
4. ✅ 한글 타이핑 연습 (기본 기능)
5. ✅ 파이썬 학습 (3-5개 강의)
6. ✅ 코드 에디터 통합

### Phase 2: 기능 확장 (4-6주)
1. 영문 타이핑 연습
2. 타이핑 통계 대시보드
3. 파이썬 학습 전체 커리큘럼
4. 퀴즈 시스템
5. 파이게임 튜토리얼 (기초)

### Phase 3: 고급 기능 (4-6주)
1. 파이게임 에디터 (실시간 실행)
2. 프로젝트 갤러리
3. 소셜 기능 (좋아요, 댓글)
4. 사용자 프로필
5. 성취 시스템 (배지, 레벨)

### Phase 4: 최적화 및 배포 (2-4주)
1. 성능 최적화
2. 보안 강화
3. 테스트 커버리지 확대
4. 프로덕션 배포
5. 모니터링 설정

## 🤝 협업 가이드

- Git Workflow 문서 참조 (GIT_WORKFLOW.md)
- 코드 리뷰 필수
- 커밋 메시지 컨벤션 준수
- 주간 스프린트 미팅

## 📚 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev/)
- [Pygame 공식 문서](https://www.pygame.org/docs/)
- [Supabase 문서](https://supabase.com/docs)

