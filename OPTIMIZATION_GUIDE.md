# EduPy 데이터베이스 최적화 가이드

## 📊 최적화 개요

이 가이드는 EduPy 플랫폼의 데이터베이스 및 서버 최적화 내용을 설명합니다.

### 주요 개선 사항

#### 1. **데이터베이스 캐싱** ✅
- **구현**: TTL 기반 메모리 캐시 (5분 TTL)
- **적용 대상**:
  - `get_error_statistics()` - 오류 통계
  - `get_analytics_overview()` - 분석 개요
  - `get_device_distribution()` - 기기 분포
  - `get_code_execution_stats()` - 코드 실행 통계
- **예상 효과**: 캐시 히트 시 10-50배 성능 향상

#### 2. **중복 체크 최적화** ✅
- **변경 전**: SELECT → INSERT (2개 쿼리)
- **변경 후**: INSERT OR IGNORE (1개 쿼리)
- **예상 효과**: 50% 쿼리 감소, 경쟁 조건 제거

#### 3. **비동기 데이터베이스 모듈** ✅
- **파일**: `database_async.py`
- **기능**:
  - aiosqlite 기반 비동기 작업
  - 연결 풀링 (최대 10개 연결)
  - 자동 캐싱 레이어
- **예상 효과**: 동시 요청 처리 능력 향상

#### 4. **데이터베이스 구조 최적화** ✅
- **UNIQUE 제약조건 추가**:
  ```sql
  UNIQUE(level, activity, error_message)
  ```
- **추가 인덱스**:
  - `idx_user_sessions_active`
  - `idx_page_views_session_path`
  - `idx_code_executions_curriculum`
  - `idx_error_reports_resolved`

---

## 🚀 최적화 적용 방법

### Step 1: 의존성 설치

```bash
cd backend
pip install -r requirements.txt
```

새로 추가된 패키지:
- `aiosqlite==0.19.0` - 비동기 SQLite
- `cachetools==5.3.2` - 캐싱 라이브러리

### Step 2: 데이터베이스 최적화 실행

⚠️ **주의**: 실행 전 데이터베이스가 자동으로 백업됩니다.

```bash
python optimize_database.py
```

이 스크립트는 다음을 수행합니다:
1. ✅ 데이터베이스 백업 생성
2. ✅ UNIQUE 제약조건 추가
3. ✅ 중복 데이터 제거
4. ✅ 추가 인덱스 생성
5. ✅ VACUUM (공간 회수)
6. ✅ ANALYZE (통계 갱신)

### Step 3: 성능 테스트

```bash
python test_performance.py
```

이 스크립트는 최적화 효과를 측정합니다:
- 캐시 성능 비교
- 쿼리 실행 시간 측정
- 동시 요청 처리 테스트

---

## 📈 예상 성능 향상

| 작업 | 최적화 전 | 최적화 후 | 개선율 |
|------|-----------|-----------|--------|
| 통계 조회 (캐시 미스) | 50ms | 50ms | - |
| 통계 조회 (캐시 히트) | 50ms | ~1ms | **50배** |
| 중복 오류 체크 | 2 쿼리 | 1 쿼리 | **50%** |
| 동시 요청 (10개) | 500ms | 100ms | **5배** |

---

## 🔧 추가 권장 최적화

### 프로덕션 환경

#### 1. Redis 캐시 서버
```python
# requirements.txt에 추가
redis==5.0.1
```

캐시 설정을 Redis로 전환:
- 여러 서버 인스턴스 간 캐시 공유
- 더 큰 캐시 용량
- 영구 저장 옵션

#### 2. PostgreSQL 마이그레이션
SQLite는 개발용으로 적합하지만, 프로덕션에서는:
- PostgreSQL 또는 MySQL 사용 권장
- 연결 풀링 최적화
- 읽기 전용 복제본 추가

#### 3. API 응답 압축
```python
# main.py에 추가
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### 4. CDN 및 정적 파일 캐싱
- 프론트엔드 빌드 파일을 CDN에 배포
- Cache-Control 헤더 설정
- Cloudflare 또는 AWS CloudFront 사용

---

## 🔄 비동기 버전 마이그레이션

`database_async.py`를 사용하려면:

### 1. 엔드포인트를 async로 변경

**변경 전**:
```python
@app.get("/api/error-reports/statistics")
def get_statistics():
    return database.get_error_statistics()
```

**변경 후**:
```python
import database_async

@app.get("/api/error-reports/statistics")
async def get_statistics():
    return await database_async.get_error_statistics()
```

### 2. 앱 시작/종료 시 연결 관리

```python
@app.on_event("startup")
async def startup():
    await database_async.init_database()

@app.on_event("shutdown")
async def shutdown():
    await database_async.close_all_connections()
```

---

## 📊 모니터링 및 분석

### 캐시 통계 확인

```python
from database import _query_cache, _cache_lock

with _cache_lock:
    print(f"Cache size: {len(_query_cache)}")
    print(f"Cache info: {_query_cache.currsize} / {_query_cache.maxsize}")
```

### 수동 캐시 클리어

데이터가 업데이트된 후 캐시를 즉시 무효화:
```python
from database import clear_cache
clear_cache()
```

---

## 🐛 문제 해결

### 캐시가 작동하지 않음
- 로그 레벨을 DEBUG로 변경하여 캐시 히트/미스 확인
- `clear_cache()`가 너무 자주 호출되지 않는지 확인

### UNIQUE 제약조건 오류
```
sqlite3.IntegrityError: UNIQUE constraint failed
```
- 정상 동작입니다 (INSERT OR IGNORE가 처리)
- 중복 데이터가 자동으로 무시됨

### 성능 향상이 미미함
- 데이터베이스 크기가 작으면 효과가 적을 수 있음
- `ANALYZE` 실행 여부 확인
- 인덱스 생성 확인

---

## 📝 변경 사항 요약

### 수정된 파일
- ✅ `backend/requirements.txt` - 의존성 추가
- ✅ `backend/database.py` - 캐싱 및 최적화 추가
- ✅ `backend/database_async.py` - 새로운 비동기 모듈
- ✅ `backend/optimize_database.py` - 마이그레이션 스크립트
- ✅ `backend/test_performance.py` - 성능 테스트 도구

### 새로 추가된 파일
- ✅ `OPTIMIZATION_GUIDE.md` - 이 문서

---

## ⚡ 빠른 시작

```bash
# 1. 의존성 설치
cd backend
pip install -r requirements.txt

# 2. 데이터베이스 최적화
python optimize_database.py

# 3. 성능 테스트
python test_performance.py

# 4. 서버 재시작
uvicorn main:app --reload
```

---

## 📞 지원

최적화 관련 문제가 있으면:
1. 백업 파일 확인 (`edupy.db.backup_*`)
2. 로그 확인
3. 성능 테스트 결과 검토

---

**최종 업데이트**: 2026-01-06
**버전**: 1.0.0
