# EduPy 개발 로드맵

## 📅 전체 일정 개요

```
Phase 1: MVP (4-6주)
Phase 2: 기능 확장 (4-6주)
Phase 3: 고급 기능 (4-6주)
Phase 4: 최적화 및 배포 (2-4주)
───────────────────────────────────
총 예상 기간: 14-22주 (약 3.5-5.5개월)
```

## 🎯 Phase 1: MVP (최소 기능 제품) - 4-6주

### Week 1-2: 프로젝트 초기 설정 및 기본 인프라

#### Frontend 설정
- [ ] React + Vite 프로젝트 초기화
  ```bash
  npm create vite@latest frontend -- --template react-ts
  ```
- [ ] 필수 패키지 설치
  - React Router
  - Tailwind CSS
  - Zustand (상태 관리)
  - Axios (API 통신)
- [ ] 프로젝트 구조 설정
- [ ] Tailwind CSS 설정 및 디자인 시스템 구축
- [ ] 기본 레이아웃 컴포넌트 (Header, Footer, Sidebar)

#### Backend 설정
- [ ] FastAPI 프로젝트 초기화
- [ ] 프로젝트 구조 설정
- [ ] 필수 패키지 설치
  - FastAPI
  - SQLAlchemy
  - Pydantic
  - python-jose (JWT)
  - passlib (비밀번호 해싱)
- [ ] 데이터베이스 연결 설정 (Supabase)
- [ ] 환경 변수 설정 (.env)

#### DevOps
- [ ] Git 저장소 초기화
- [ ] .gitignore 설정
- [ ] GitHub 저장소 생성 및 연결
- [ ] 개발 환경 Docker Compose 설정 (선택사항)

**완료 기준**: 
- Frontend와 Backend가 로컬에서 정상 실행
- 기본 "Hello World" API 통신 성공

---

### Week 3-4: LocalStorage 시스템 및 기본 UI

#### LocalStorage 서비스 구현
- [ ] StorageService 클래스 생성
  - 타이핑 진행도 저장/로드
  - 파이썬 진행도 저장/로드
  - 파이게임 프로젝트 저장/로드
  - 설정 저장/로드
- [ ] 데이터 타입 정의 (TypeScript interfaces)
- [ ] 데이터 검증 및 마이그레이션 로직
- [ ] 자동 저장 기능 구현
- [ ] 데이터 내보내기/가져오기 기능

#### Zustand Store 설정
- [ ] 타이핑 상태 관리
- [ ] 파이썬 학습 상태 관리
- [ ] 파이게임 상태 관리
- [ ] 설정 상태 관리
- [ ] LocalStorage와 동기화

#### 공통 컴포넌트
- [ ] Button 컴포넌트
- [ ] Input 컴포넌트
- [ ] Card 컴포넌트
- [ ] Modal 컴포넌트
- [ ] Loading Spinner
- [ ] Toast 알림 컴포넌트

#### 데이터 관리 UI
- [ ] 설정 페이지
- [ ] 데이터 내보내기 버튼
- [ ] 데이터 가져오기 기능
- [ ] 데이터 초기화 기능 (확인 모달 포함)

**완료 기준**:
- LocalStorage에 데이터 저장/로드 정상 작동
- 페이지 새로고침 후에도 데이터 유지
- 데이터 내보내기/가져오기 기능 작동

---

### Week 5-6: 한글 타이핑 연습 기본 기능

#### Backend (콘텐츠 제공만)
- [ ] TypingLessons 테이블 생성
- [ ] 타이핑 레슨 초기 데이터 시딩
- [ ] 타이핑 레슨 목록 API
  - GET /api/typing/lessons
- [ ] 타이핑 레슨 상세 API
  - GET /api/typing/lessons/:id

#### Frontend
- [ ] 타이핑 연습 페이지 레이아웃
- [ ] 텍스트 표시 컴포넌트
- [ ] 사용자 입력 처리
- [ ] 실시간 WPM 계산 로직
- [ ] 정확도 계산 로직
- [ ] 오타 하이라이팅
- [ ] 결과 화면 (WPM, 정확도, 시간)
- [ ] LocalStorage에 진행도 저장
  - edupy_typing_progress 업데이트
  - edupy_typing_stats 업데이트
- [ ] 이전 기록 표시 기능

#### 콘텐츠
- [ ] 한글 자음 연습 텍스트 (5개)
- [ ] 한글 모음 연습 텍스트 (5개)
- [ ] 한글 단어 연습 텍스트 (10개)
- [ ] 한글 문장 연습 텍스트 (10개)

**완료 기준**:
- 한글 타이핑 연습 기본 기능 작동
- WPM 및 정확도 측정 정확
- 진행도가 localStorage에 저장됨
- 페이지 새로고침 후에도 기록 유지

---

## 🚀 Phase 2: 기능 확장 - 4-6주

### Week 7-8: 파이썬 학습 기초

#### Backend
- [ ] PythonProgress 테이블 생성
- [ ] 파이썬 강의 콘텐츠 스키마 설계
- [ ] 강의 목록 API
  - GET /api/python/lessons
- [ ] 강의 상세 API
  - GET /api/python/lessons/:id
- [ ] 코드 실행 API (기본)
  - POST /api/python/execute
  - 간단한 exec() 사용 (보안 강화는 나중에)

#### Frontend
- [ ] Monaco Editor 통합
- [ ] 강의 목록 페이지
- [ ] 강의 상세 페이지
  - 마크다운 렌더러
  - 코드 에디터
  - 실행 버튼
  - 출력 패널
- [ ] 코드 실행 기능
- [ ] 에러 표시

#### 콘텐츠
- [ ] 파이썬 기초 강의 5개
  1. 변수와 자료형
  2. 연산자
  3. 조건문 (if)
  4. 반복문 (for, while)
  5. 함수 기초

**완료 기준**:
- 5개 파이썬 강의 접근 가능
- 코드 에디터에서 코드 작성 및 실행 가능
- 실행 결과가 화면에 표시됨

---

### Week 9-10: 영문 타이핑 및 타이핑 통계

#### 영문 타이핑
- [ ] 영문 타이핑 레슨 추가
- [ ] 영문 타이핑 페이지
- [ ] 코드 타이핑 연습 모드 (Python 코드 스니펫)

#### 타이핑 통계 대시보드
- [ ] 통계 페이지 UI
- [ ] WPM 추이 그래프 (Chart.js or Recharts)
- [ ] 정확도 분석
- [ ] 일별/주별/월별 필터
- [ ] 취약 키 분석 (선택사항)

#### 콘텐츠
- [ ] 영문 홈 로우 연습 (10개)
- [ ] 영문 단어 연습 (20개)
- [ ] 영문 문장 연습 (20개)
- [ ] Python 코드 스니펫 (10개)

**완료 기준**:
- 영문 타이핑 연습 가능
- 통계 대시보드에서 진행도 시각화

---

### Week 11-12: 파이썬 학습 확장 및 퀴즈

#### 파이썬 강의 확장
- [ ] 추가 강의 콘텐츠 (10개)
  6. 리스트
  7. 딕셔너리
  8. 튜플과 세트
  9. 문자열 메서드
  10. 리스트 컴프리헨션

#### 퀴즈 시스템
- [ ] Quiz 테이블 설계
- [ ] 퀴즈 API
  - GET /api/python/quiz/:id
  - POST /api/python/quiz/:id/submit
- [ ] 퀴즈 UI
  - 객관식 문제
  - 주관식 문제
  - 코딩 문제
- [ ] 즉시 피드백 및 해설
- [ ] 점수 저장

#### 코드 플레이그라운드
- [ ] 플레이그라운드 페이지
- [ ] 코드 저장 기능
- [ ] 저장된 코드 목록

**완료 기준**:
- 총 10개 이상의 파이썬 강의
- 퀴즈 시스템 작동
- 플레이그라운드에서 자유롭게 코드 작성 가능

---

## 🎮 Phase 3: 고급 기능 (파이게임) - 4-6주

### Week 13-14: 파이게임 기초 및 튜토리얼

#### Backend
- [ ] PygameProjects 테이블 생성
- [ ] 파이게임 튜토리얼 API
  - GET /api/pygame/tutorials
  - GET /api/pygame/tutorials/:id
- [ ] 프로젝트 CRUD API
  - GET /api/pygame/projects
  - POST /api/pygame/projects
  - PUT /api/pygame/projects/:id
  - DELETE /api/pygame/projects/:id

#### Frontend
- [ ] 파이게임 튜토리얼 목록 페이지
- [ ] 튜토리얼 상세 페이지
- [ ] 내 프로젝트 페이지
- [ ] 프로젝트 생성 모달

#### 콘텐츠
- [ ] Pygame 튜토리얼 5개
  1. Pygame 기초 (윈도우 생성)
  2. 도형 그리기
  3. 이미지 로드 및 표시
  4. 키보드 입력 처리
  5. 간단한 움직임 구현

**완료 기준**:
- 파이게임 튜토리얼 접근 가능
- 프로젝트 생성/조회/삭제 가능

---

### Week 15-16: 파이게임 에디터 (실시간 실행)

#### Backend
- [ ] Docker 기반 코드 실행 환경 구축
- [ ] Pygame 코드 실행 API
  - POST /api/pygame/execute
- [ ] 보안 샌드박스 설정
  - 리소스 제한
  - 네트워크 차단
  - 파일시스템 제한

#### Frontend
- [ ] 2분할 레이아웃 에디터
  - 왼쪽: Monaco Editor
  - 오른쪽: Canvas (게임 화면)
- [ ] 파일 탐색기 (여러 .py 파일 관리)
- [ ] 실행 버튼
- [ ] 콘솔 출력
- [ ] 에러 표시

**완료 기준**:
- 파이게임 코드를 에디터에서 작성하고 실시간 실행 가능
- 게임 화면이 Canvas에 표시됨
- 보안 샌드박스 작동

---

### Week 17-18: 갤러리 및 소셜 기능

#### Backend
- [ ] 갤러리 API
  - GET /api/pygame/gallery (공개 프로젝트)
  - GET /api/pygame/gallery/:id
- [ ] 좋아요 기능
  - POST /api/pygame/projects/:id/like
  - DELETE /api/pygame/projects/:id/like
- [ ] 댓글 기능 (선택사항)
  - POST /api/pygame/projects/:id/comments
  - GET /api/pygame/projects/:id/comments

#### Frontend
- [ ] 갤러리 페이지
  - 그리드 레이아웃
  - 썸네일 표시
  - 좋아요 수, 조회수
- [ ] 프로젝트 상세 모달
  - 게임 플레이
  - 코드 보기
  - 좋아요 버튼
  - 포크 기능
- [ ] 필터 및 정렬
  - 인기순, 최신순
  - 카테고리별

**완료 기준**:
- 갤러리에서 다른 사용자의 게임 확인 가능
- 좋아요 기능 작동
- 프로젝트 포크 가능

---

## 🏁 Phase 4: 최적화 및 배포 - 2-4주

### Week 19-20: 성능 최적화 및 테스트

#### 성능 최적화
- [ ] Frontend 번들 크기 최적화
- [ ] 이미지 최적화 (WebP)
- [ ] 코드 스플리팅
- [ ] API 응답 캐싱 (React Query)
- [ ] 데이터베이스 인덱싱
- [ ] 쿼리 최적화

#### 테스트
- [ ] Frontend 유닛 테스트 (주요 컴포넌트)
- [ ] Backend API 테스트
- [ ] E2E 테스트 (주요 플로우)
- [ ] 보안 테스트
- [ ] 성능 테스트

#### 버그 수정
- [ ] 알려진 버그 수정
- [ ] 사용성 개선

**완료 기준**:
- 테스트 커버리지 60% 이상
- 주요 버그 모두 수정
- 성능 지표 개선

---

### Week 21-22: 프로덕션 배포 및 모니터링

#### 배포 준비
- [ ] 환경 변수 설정 (Production)
- [ ] HTTPS 설정
- [ ] CORS 설정
- [ ] Rate Limiting 설정
- [ ] 에러 로깅 설정 (Sentry)

#### 배포
- [ ] Frontend 배포 (Vercel)
- [ ] Backend 배포 (Railway)
- [ ] 데이터베이스 마이그레이션
- [ ] 초기 데이터 시딩

#### 모니터링
- [ ] Google Analytics 설정
- [ ] Sentry 에러 트래킹
- [ ] 성능 모니터링
- [ ] 로그 수집

#### 문서화
- [ ] API 문서 (Swagger)
- [ ] 사용자 가이드
- [ ] 개발자 문서
- [ ] README 업데이트

**완료 기준**:
- 프로덕션 환경에서 서비스 정상 작동
- 모니터링 시스템 작동
- 문서 완성

---

## 📊 마일스톤 체크리스트

### Milestone 1: MVP 완료 ✅
- [ ] LocalStorage 시스템 구축
- [ ] 한글 타이핑 연습 가능
- [ ] 파이썬 기초 강의 5개 이상
- [ ] 코드 실행 기능 작동
- [ ] 진행도 자동 저장 및 복원

### Milestone 2: 기능 확장 완료 ✅
- [ ] 영문 타이핑 연습 가능
- [ ] 타이핑 통계 대시보드
- [ ] 파이썬 강의 10개 이상
- [ ] 퀴즈 시스템 작동

### Milestone 3: 파이게임 완료 ✅
- [ ] 파이게임 튜토리얼 5개 이상
- [ ] 파이게임 에디터 작동
- [ ] 갤러리 기능 작동
- [ ] 소셜 기능 (좋아요, 공유)

### Milestone 4: 프로덕션 배포 ✅
- [ ] 성능 최적화 완료
- [ ] 테스트 통과
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 설정 완료

---

## 🎯 우선순위 가이드

### 🔴 High Priority (필수)
- 인증 시스템
- 한글 타이핑 연습
- 파이썬 기초 강의
- 코드 실행 기능
- 파이게임 기본 튜토리얼

### 🟡 Medium Priority (중요)
- 영문 타이핑 연습
- 타이핑 통계
- 퀴즈 시스템
- 파이게임 에디터
- 갤러리

### 🟢 Low Priority (선택)
- 소셜 로그인
- 댓글 기능
- 취약 키 분석
- 성취 시스템
- 다크 모드

---

## 📝 다음 단계

1. **즉시 시작**: Phase 1 Week 1-2 작업 시작
2. **팀 구성**: 역할 분담 (Frontend/Backend)
3. **일일 스탠드업**: 진행 상황 공유
4. **주간 리뷰**: 매주 금요일 진행도 체크

**첫 번째 작업**: 
```bash
# Frontend 초기화
npm create vite@latest frontend -- --template react-ts

# Backend 초기화
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy
```
