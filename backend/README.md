# EduPy Backend

FastAPI 기반 백엔드 서버

## 설치

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Mac/Linux)
source venv/bin/activate

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

## 실행

```bash
# 개발 모드 (핫리로딩)
python main.py

# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 문서

서버 실행 후 다음 URL에서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 엔드포인트

- `GET /` - API 정보
- `GET /health` - 헬스 체크
- `POST /api/python/execute` - 파이썬 코드 실행 (예정)
- `GET /api/pygame/lessons` - 파이게임 레슨 목록 (예정)

