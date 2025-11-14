from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import resend
import os
import logging
from turtle_runner import run_turtle_code

# .env 파일 로드
load_dotenv()

# 환경 변수 가져오기
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# 로깅 설정
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info(f"Starting EduPy API in {ENVIRONMENT} mode")
logger.info(f"Debug mode: {DEBUG}")
logger.info(f"CORS origins: {CORS_ORIGINS}")

app = FastAPI(
    title="EduPy API",
    description="Educational Python Learning Platform API",
    version="1.0.0",
    debug=DEBUG
)

# Resend API 키 설정
resend.api_key = os.getenv("RESEND_API_KEY")

# CORS 설정 - 환경에 따라 다른 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if DEBUG else CORS_ORIGINS,  # 개발 모드에서는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to EduPy API",
        "version": "1.0.0",
        "status": "running",
        "environment": ENVIRONMENT,
        "debug": DEBUG
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

# 오류 보고 요청 모델
class ErrorReport(BaseModel):
    level: str
    activity: str
    error_message: str
    user_code: str
    timestamp: str

# Turtle 코드 실행 요청 모델
class TurtleCodeRequest(BaseModel):
    code: str
    width: int = 600
    height: int = 600
    animate: bool = False  # True이면 애니메이션 프레임 반환

# Turtle 코드 실행 API
@app.post("/api/turtle/execute")
async def execute_turtle_code(request: TurtleCodeRequest):
    """
    Turtle 코드를 실행하고 결과 이미지를 반환
    """
    logger.info(f"Received turtle code execution request (animate={request.animate})")

    try:
        result = run_turtle_code(request.code, request.width, request.height, request.animate)

        if result['success']:
            if request.animate:
                logger.info(f"Turtle animation generated with {result.get('frame_count', 0)} frames")
                return {
                    "success": True,
                    "frames": result['frames'],
                    "frame_count": result['frame_count']
                }
            else:
                logger.info("Turtle code executed successfully")
                return {
                    "success": True,
                    "image": result['image']
                }
        else:
            logger.error(f"Turtle code execution failed: {result['error']}")
            return {
                "success": False,
                "error": result['error']
            }

    except Exception as e:
        logger.error(f"Unexpected error in turtle execution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Turtle 코드 실행 실패: {str(e)}"
        )

# 오류 보고 API
@app.post("/api/error-report")
async def send_error_report(report: ErrorReport):
    """
    사용자가 발생시킨 오류를 이메일로 전송
    """
    logger.info(f"Received error report for {report.level} - {report.activity}")

    try:
        # 환경 변수에서 이메일 주소 가져오기
        to_email = os.getenv("ERROR_REPORT_EMAIL", "neohum77@gmail.com")
        from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev")

        logger.debug(f"Sending email from {from_email} to {to_email}")

        # 이메일 내용 구성
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .section {{ background: #f7fafc; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
                .section-title {{ font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 10px; }}
                .code-block {{ background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; white-space: pre-wrap; }}
                .error-block {{ background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; border-radius: 4px; color: #c53030; }}
                .footer {{ text-align: center; color: #718096; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐛 EduPy 오류 보고</h1>
                </div>

                <div class="section">
                    <div class="section-title">📍 발생 위치</div>
                    <p><strong>Level:</strong> {report.level}</p>
                    <p><strong>Activity:</strong> {report.activity}</p>
                </div>

                <div class="section">
                    <div class="section-title">❌ 오류 메시지</div>
                    <div class="error-block">{report.error_message}</div>
                </div>

                <div class="section">
                    <div class="section-title">💻 사용자 코드</div>
                    <div class="code-block">{report.user_code}</div>
                </div>

                <div class="section">
                    <div class="section-title">🕐 발생 시간</div>
                    <p>{report.timestamp}</p>
                </div>

                <div class="footer">
                    <p>이 이메일은 EduPy 오류 보고 시스템에서 자동으로 발송되었습니다.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Resend로 이메일 발송
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": f"[EduPy] 오류 보고 - {report.level}",
            "html": html_content,
        }

        email = resend.Emails.send(params)

        logger.info(f"Email sent successfully. ID: {email.get('id')}")

        return {
            "success": True,
            "message": "오류 보고가 성공적으로 전송되었습니다.",
            "email_id": email.get("id")
        }

    except Exception as e:
        logger.error(f"Failed to send error report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"이메일 발송 실패: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 핫리로딩 활성화
        log_level="info"
    )

