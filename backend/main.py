from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduPy API",
    description="Educational Python Learning Platform API",
    version="1.0.0"
)

# CORS 설정 - 프론트엔드에서 API 호출 가능하도록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to EduPy API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 타이핑 레슨 API (나중에 구현)
@app.get("/api/typing/lessons")
async def get_typing_lessons():
    return {
        "message": "Typing lessons endpoint",
        "note": "Currently using frontend data"
    }

# 파이썬 코드 실행 API (나중에 구현)
@app.post("/api/python/execute")
async def execute_python_code():
    return {
        "message": "Python code execution endpoint",
        "note": "To be implemented with Docker sandbox"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 핫리로딩 활성화
        log_level="info"
    )

