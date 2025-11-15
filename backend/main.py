from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import resend
import os
import logging
import sys
from io import StringIO
import requests
from typing import List, Dict
from turtle_runner import run_turtle_code
from database import init_database, save_error_report, get_error_reports, get_error_statistics, get_error_by_id, toggle_error_resolved

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

# 데이터베이스 초기화
init_database()

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
    사용자가 발생시킨 오류를 이메일로 전송하고 DB에 저장
    """
    logger.info(f"Received error report for {report.level} - {report.activity}")

    try:
        # 1. DB에 오류 저장
        error_id = save_error_report(
            level=report.level,
            activity=report.activity,
            error_message=report.error_message,
            user_code=report.user_code,
            timestamp=report.timestamp
        )
        logger.info(f"Error saved to database with ID: {error_id}")

        # 2. 환경 변수에서 이메일 주소 가져오기
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
            "email_id": email.get("id"),
            "error_id": error_id
        }

    except Exception as e:
        logger.error(f"Failed to send error report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"오류 보고 처리 실패: {str(e)}"
        )

# 오류 통계 조회 API
@app.get("/api/error-reports/statistics")
async def get_statistics():
    """
    오류 통계 조회
    """
    try:
        stats = get_error_statistics()
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Failed to get error statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"통계 조회 실패: {str(e)}"
        )

# 오류 보고 목록 조회 API
@app.get("/api/error-reports")
async def get_reports(limit: int = 100, offset: int = 0, filter_status: str = 'all'):
    """
    오류 보고 목록 조회
    """
    try:
        reports = get_error_reports(limit=limit, offset=offset, filter_status=filter_status)
        return {
            "success": True,
            "data": reports,
            "count": len(reports)
        }
    except Exception as e:
        logger.error(f"Failed to get error reports: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"목록 조회 실패: {str(e)}"
        )

# 특정 오류 보고 조회 API
@app.get("/api/error-reports/{error_id}")
async def get_report(error_id: int):
    """
    특정 오류 보고 조회
    """
    try:
        report = get_error_by_id(error_id)
        if not report:
            raise HTTPException(status_code=404, detail="오류 보고를 찾을 수 없습니다.")

        return {
            "success": True,
            "data": report
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get error report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"조회 실패: {str(e)}"
        )

# 코드 검증 API (오류 재현 확인)
class CodeVerifyRequest(BaseModel):
    code: str

@app.post("/api/verify-code")
async def verify_code(request: CodeVerifyRequest):
    """
    코드를 실행하여 오류가 발생하는지 확인 (보안 개선)
    """
    try:
        # 출력 캡처를 위한 StringIO
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = StringIO()
        sys.stderr = StringIO()

        error_occurred = False
        error_message = ""
        error_type = ""
        output = ""

        try:
            # 제한된 globals/locals로 코드 실행 (보안 강화)
            restricted_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'range': range,
                    'str': str,
                    'int': int,
                    'float': float,
                    'list': list,
                    'dict': dict,
                    'tuple': tuple,
                    'set': set,
                    'abs': abs,
                    'max': max,
                    'min': min,
                    'sum': sum,
                    'sorted': sorted,
                    'enumerate': enumerate,
                    'zip': zip,
                    'map': map,
                    'filter': filter,
                }
            }

            # 타임아웃 설정 (무한 루프 방지)
            import signal

            def timeout_handler(signum, frame):
                raise TimeoutError("코드 실행 시간이 초과되었습니다 (5초)")

            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(5)  # 5초 타임아웃

            try:
                exec(request.code, restricted_globals, {})
                output = sys.stdout.getvalue()
            finally:
                signal.alarm(0)  # 타임아웃 해제

        except TimeoutError as e:
            error_occurred = True
            error_message = str(e)
            error_type = "TimeoutError"
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            error_type = type(e).__name__
            output = sys.stderr.getvalue()
        finally:
            # stdout, stderr 복원
            sys.stdout = old_stdout
            sys.stderr = old_stderr

        return {
            "success": True,
            "error_occurred": error_occurred,
            "error_message": error_message,
            "error_type": error_type,
            "output": output,
            "suggestion": get_error_suggestion(error_message) if error_occurred else "코드가 정상적으로 실행되었습니다! ✅"
        }
    except Exception as e:
        logger.error(f"Code verification failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"코드 검증 실패: {str(e)}"
        )

def get_error_suggestion(error_message: str) -> str:
    """
    오류 메시지를 분석하여 해결 방법 제안
    """
    error_lower = error_message.lower()

    suggestions = {
        "name": "💡 변수나 함수 이름이 정의되지 않았습니다. 철자를 확인하거나 먼저 정의해주세요.",
        "syntax": "💡 문법 오류가 있습니다. 괄호, 콜론(:), 들여쓰기를 확인해주세요.",
        "indentation": "💡 들여쓰기가 잘못되었습니다. 공백 4칸 또는 탭을 일관되게 사용해주세요.",
        "type": "💡 데이터 타입이 맞지 않습니다. 숫자와 문자열을 구분해주세요.",
        "value": "💡 값이 올바르지 않습니다. 입력값이나 변환 과정을 확인해주세요.",
        "zerodivision": "💡 0으로 나눌 수 없습니다. 나누는 수가 0이 아닌지 확인해주세요.",
        "index": "💡 리스트 인덱스가 범위를 벗어났습니다. 리스트 길이를 확인해주세요.",
        "key": "💡 딕셔너리에 해당 키가 없습니다. 키 이름을 확인해주세요.",
        "attribute": "💡 객체에 해당 속성이나 메서드가 없습니다. 철자를 확인해주세요.",
        "import": "💡 모듈을 찾을 수 없습니다. 모듈 이름과 설치 여부를 확인해주세요.",
    }

    for error_type, suggestion in suggestions.items():
        if error_type in error_lower:
            return suggestion

    return "💡 오류를 해결하려면 오류 메시지를 자세히 읽어보세요. 어떤 줄에서 무엇이 잘못되었는지 알려줍니다."

# 오류 해결 상태 토글 API
@app.patch("/api/error-reports/{error_id}/toggle-resolved")
async def toggle_resolved(error_id: int):
    """
    오류 해결 상태 토글
    """
    try:
        success = toggle_error_resolved(error_id)
        if not success:
            raise HTTPException(status_code=404, detail="오류 보고를 찾을 수 없습니다.")

        return {
            "success": True,
            "message": "오류 해결 상태가 변경되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle error resolved status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"상태 변경 실패: {str(e)}"
        )

# 웹 검색 API
class SearchRequest(BaseModel):
    query: str

@app.post("/api/search")
async def search_web(request: SearchRequest):
    """
    DuckDuckGo HTML 검색 결과를 반환
    """
    try:
        # DuckDuckGo HTML 검색
        search_url = "https://html.duckduckgo.com/html/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        # POST 요청으로 검색
        data = {
            "q": f"{request.query} python 파이썬",
            "kl": "kr-kr"  # 한국 지역
        }

        response = requests.post(search_url, data=data, headers=headers, timeout=15)
        response.raise_for_status()

        # HTML 파싱
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        results = []

        # DuckDuckGo 검색 결과 추출
        search_results = soup.select('div.result')

        logger.info(f"Found {len(search_results)} search results from DuckDuckGo")

        for result in search_results[:15]:  # 최대 15개 확인
            try:
                # 제목 추출
                title_elem = result.select_one('a.result__a')
                title = title_elem.get_text().strip() if title_elem else ""

                # URL 추출
                url = title_elem.get('href') if title_elem else ""

                # 설명 추출
                desc_elem = result.select_one('a.result__snippet')
                description = desc_elem.get_text().strip() if desc_elem else ""

                # 유효한 결과만 추가
                if title and url and url.startswith('http'):
                    results.append({
                        "title": title[:150],
                        "url": url,
                        "description": description[:250] if description else title[:250]
                    })

                    logger.info(f"Added result: {title[:50]}...")

                    # 10개 수집되면 중단
                    if len(results) >= 10:
                        break

            except Exception as e:
                logger.warning(f"Failed to parse search result: {str(e)}")
                continue

        # 결과가 없으면 에러 메시지 반환
        if not results:
            logger.error("No search results found")
            return {
                "success": False,
                "error": "검색 결과를 찾을 수 없습니다. 다른 키워드로 시도해주세요.",
                "results": []
            }

        logger.info(f"Returning {len(results)} results")
        return {
            "success": True,
            "results": results[:10]  # 최대 10개 반환
        }

    except requests.Timeout:
        logger.error("Search request timeout")
        return {
            "success": False,
            "error": "검색 요청 시간이 초과되었습니다. 다시 시도해주세요.",
            "results": []
        }
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        return {
            "success": False,
            "error": f"검색 중 오류가 발생했습니다: {str(e)}",
            "results": []
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

