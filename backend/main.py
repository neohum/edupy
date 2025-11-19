from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
import resend
import os
import logging
import sys
from io import StringIO
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import pyotp
import qrcode
from io import BytesIO
import base64
from turtle_runner import run_turtle_code
from pygame_runner import run_pygame_code
from auto_fix import fix_code_with_augment
from database import (
    init_database, save_error_report, get_error_reports, get_error_statistics,
    get_error_by_id, toggle_error_resolved, save_fixed_code, get_admin_user,
    update_admin_totp, update_admin_last_login, check_duplicate_error_by_page,
    save_new_error_report
)

# .env 파일 로드
load_dotenv()

# 환경 변수 가져오기
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# 관리자 인증 설정
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8시간

# HTTP Bearer 인증
security = HTTPBearer()

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

# ==================== 인증 관련 함수 ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """JWT 토큰 검증"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# ==================== 인증 API ====================

class LoginRequest(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    requires_2fa: bool = False
    totp_enabled: bool = False

class Setup2FAResponse(BaseModel):
    qr_code: str
    secret: str
    username: str

class Verify2FARequest(BaseModel):
    username: str
    totp_code: str

@app.post("/api/admin/login")
async def admin_login(request: LoginRequest, req: Request):
    """관리자 로그인 (2FA 지원)"""
    # 데이터베이스에서 사용자 조회
    user = get_admin_user(request.username)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # 비밀번호 검증 (bcrypt 직접 사용)
    password_bytes = request.password.encode('utf-8')
    stored_hash = user['password_hash'].encode('utf-8')
    if not bcrypt.checkpw(password_bytes, stored_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # 2FA 활성화 여부 확인
    if user['totp_enabled']:
        # 2FA 코드가 제공되지 않은 경우
        if not request.totp_code:
            return {
                "access_token": "",
                "token_type": "bearer",
                "username": request.username,
                "requires_2fa": True,
                "totp_enabled": True
            }

        # 2FA 코드 검증
        totp = pyotp.TOTP(user['totp_secret'])
        if not totp.verify(request.totp_code, valid_window=1):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # 로그인 성공 - 토큰 생성
    access_token = create_access_token(data={"sub": request.username})
    update_admin_last_login(request.username)
    logger.info(f"Admin login successful from {req.client.host}: {request.username}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": request.username,
        "requires_2fa": False,
        "totp_enabled": user['totp_enabled']
    }

@app.get("/api/admin/verify")
async def verify_admin(username: str = Depends(verify_token)):
    """관리자 토큰 검증"""
    user = get_admin_user(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "valid": True,
        "username": username,
        "totp_enabled": bool(user['totp_enabled'])
    }

@app.post("/api/admin/setup-2fa", response_model=Setup2FAResponse)
async def setup_2fa(username: str = Depends(verify_token)):
    """2FA 설정 (QR 코드 생성)"""
    user = get_admin_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # TOTP 시크릿 생성
    secret = pyotp.random_base32()

    # TOTP URI 생성
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=username,
        issuer_name="EduPy Admin"
    )

    # QR 코드 생성
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # 이미지를 base64로 인코딩
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    # 데이터베이스에 시크릿 저장 (아직 활성화하지 않음)
    update_admin_totp(username, secret, enabled=False)

    return {
        "qr_code": f"data:image/png;base64,{img_str}",
        "secret": secret,
        "username": username
    }

@app.post("/api/admin/enable-2fa")
async def enable_2fa(request: Verify2FARequest, username: str = Depends(verify_token)):
    """2FA 활성화 (코드 검증 후)"""
    if request.username != username:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = get_admin_user(username)
    if not user or not user['totp_secret']:
        raise HTTPException(status_code=400, detail="2FA not set up")

    # TOTP 코드 검증
    totp = pyotp.TOTP(user['totp_secret'])
    if not totp.verify(request.totp_code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # 2FA 활성화
    update_admin_totp(username, user['totp_secret'], enabled=True)
    logger.info(f"2FA enabled for user: {username}")

    return {"success": True, "message": "2FA enabled successfully"}

@app.post("/api/admin/disable-2fa")
async def disable_2fa(request: Verify2FARequest, username: str = Depends(verify_token)):
    """2FA 비활성화"""
    if request.username != username:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = get_admin_user(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # TOTP 코드 검증 (활성화된 경우)
    if user['totp_enabled'] and user['totp_secret']:
        totp = pyotp.TOTP(user['totp_secret'])
        if not totp.verify(request.totp_code, valid_window=1):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # 2FA 비활성화
    update_admin_totp(username, "", enabled=False)
    logger.info(f"2FA disabled for user: {username}")

    return {"success": True, "message": "2FA disabled successfully"}

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

# 오류 중복 확인 요청 모델
class ErrorCheckRequest(BaseModel):
    page: str
    code: str
    output: str

# 새로운 오류 보고 요청 모델 (파이게임 만들기용)
class NewErrorReport(BaseModel):
    page: str
    error_type: str
    description: str
    code: str
    output: str

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

# Pygame 코드 실행 요청 모델
class PygameCodeRequest(BaseModel):
    code: str
    width: int = 600
    height: int = 400
    max_frames: int = 60
    simulate_input: bool = True  # 키 입력 시뮬레이션 활성화
    game_type: str = 'auto'  # 게임 타입 ('auto', 'avoid', 'collect', 'shoot', 'pong', 'typing')

# Pygame 코드 실행 API
@app.post("/api/pygame/execute")
async def execute_pygame_code(request: PygameCodeRequest):
    """
    Pygame 코드를 실행하고 결과 이미지를 반환
    키 입력 시뮬레이션을 통해 게임이 자동으로 플레이되는 것처럼 보이게 합니다.
    """
    logger.info(f"Received pygame code execution request (max_frames={request.max_frames}, simulate_input={request.simulate_input}, game_type={request.game_type})")

    try:
        result = run_pygame_code(
            request.code,
            request.width,
            request.height,
            request.max_frames,
            request.simulate_input,
            request.game_type
        )

        if result['success']:
            logger.info("Pygame code executed successfully")
            return {
                "success": True,
                "image": result['image'],
                "output": result['output']
            }
        else:
            logger.error(f"Pygame code execution failed: {result['error']}")
            return {
                "success": False,
                "error": result['error'],
                "output": result['output']
            }

    except Exception as e:
        logger.error(f"Unexpected error in pygame execution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Pygame 코드 실행 실패: {str(e)}"
        )

# 오류 보고 API
@app.post("/api/error-report")
async def send_error_report(report: ErrorReport):
    """
    사용자가 발생시킨 오류를 이메일로 전송하고 DB에 저장 (중복 체크 포함)
    AI 자동 수정 기능 추가
    """
    logger.info(f"Received error report for {report.level} - {report.activity}")

    try:
        # 1. AI 자동 수정 시도
        ai_fix_success = False
        fixed_code = None
        fix_explanation = None

        try:
            success, code, explanation = fix_code_with_augment(report.user_code, report.error_message)
            if success:
                ai_fix_success = True
                fixed_code = code
                fix_explanation = explanation
                logger.info(f"AI successfully fixed the code for {report.level} - {report.activity}")
        except Exception as ai_error:
            logger.warning(f"AI fix failed: {str(ai_error)}")
            # AI 수정 실패해도 계속 진행

        # 2. DB에 오류 저장 (중복 체크 포함)
        save_result = save_error_report(
            level=report.level,
            activity=report.activity,
            error_message=report.error_message,
            user_code=report.user_code,
            timestamp=report.timestamp
        )

        # 중복 오류인 경우
        if save_result['duplicate']:
            logger.info(f"Duplicate error detected: {save_result['existing_error']['id']}")
            return {
                "success": False,
                "duplicate": True,
                "message": save_result['message'],
                "existing_error": save_result['existing_error'],
                "ai_fixed": ai_fix_success,
                "fixed_code": fixed_code,
                "fix_explanation": fix_explanation
            }

        error_id = save_result['error_id']
        logger.info(f"New error saved to database with ID: {error_id}")

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

# 오류 중복 확인 API (파이게임 만들기용)
@app.post("/api/errors/check-duplicate")
async def check_duplicate_error(request: ErrorCheckRequest):
    """
    동일한 오류가 이미 보고되었는지 확인
    """
    logger.info(f"Checking duplicate error for page: {request.page}")

    try:
        # 페이지와 출력 내용으로 중복 확인
        # output에서 오류 메시지 추출 (첫 번째 줄)
        error_message = request.output.split('\n')[0] if request.output else ''

        # 기존 중복 확인 함수 사용 (level과 activity를 page로 통합)
        existing_error = check_duplicate_error_by_page(request.page, error_message)

        if existing_error:
            return {
                "exists": True,
                "error_id": existing_error['id'],
                "created_at": existing_error['created_at'],
                "resolved": existing_error['resolved']
            }
        else:
            return {
                "exists": False
            }

    except Exception as e:
        logger.error(f"Failed to check duplicate error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"중복 확인 실패: {str(e)}"
        )

# 새로운 오류 보고 API (파이게임 만들기용)
@app.post("/api/errors/report")
async def report_new_error(report: NewErrorReport):
    """
    새로운 오류 보고 (파이게임 만들기용)
    """
    logger.info(f"Received new error report for {report.page}")

    try:
        # DB에 저장
        error_id = save_new_error_report(
            page=report.page,
            error_type=report.error_type,
            description=report.description,
            code=report.code,
            output=report.output
        )

        logger.info(f"New error saved with ID: {error_id}")

        return {
            "success": True,
            "error_id": error_id,
            "message": "오류가 성공적으로 보고되었습니다."
        }

    except Exception as e:
        logger.error(f"Failed to save error report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"오류 보고 저장 실패: {str(e)}"
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

# ==================== 오류 관리 API (관리자용) ====================

@app.get("/api/errors")
async def get_errors(
    limit: int = 100,
    offset: int = 0,
    filter_status: str = 'all',
    username: str = Depends(verify_token)
):
    """
    오류 목록 조회 (관리자 전용)

    Args:
        limit: 조회할 오류 개수 (기본값: 100)
        offset: 시작 위치 (기본값: 0)
        filter_status: 필터 상태 ('all', 'resolved', 'unresolved')
    """
    try:
        errors = get_error_reports(limit=limit, offset=offset, filter_status=filter_status)

        # 데이터베이스 필드명을 프론트엔드 필드명으로 변환
        formatted_errors = []
        for error in errors:
            formatted_errors.append({
                'id': error['id'],
                'level': error['level'],
                'activity': error['activity'],
                'error_type': 'Python Error',  # 기본값
                'error_message': error['error_message'],
                'code': error['user_code'],
                'user_agent': 'N/A',  # 데이터베이스에 없는 필드
                'created_at': error['created_at'],
                'resolved': bool(error['resolved']),
                'resolved_at': error.get('resolved_at')
            })

        logger.info(f"Retrieved {len(formatted_errors)} errors for admin: {username}")
        return {
            "success": True,
            "errors": formatted_errors,
            "total": len(formatted_errors)
        }
    except Exception as e:
        logger.error(f"Failed to get errors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve errors: {str(e)}")

@app.get("/api/errors/statistics")
async def get_errors_statistics(username: str = Depends(verify_token)):
    """
    오류 통계 조회 (관리자 전용)
    """
    try:
        stats = get_error_statistics()
        logger.info(f"Retrieved error statistics for admin: {username}")
        return stats
    except Exception as e:
        logger.error(f"Failed to get error statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")

@app.get("/api/errors/{error_id}")
async def get_error_detail(error_id: int, username: str = Depends(verify_token)):
    """
    특정 오류 상세 조회 (관리자 전용)
    """
    try:
        error = get_error_by_id(error_id)
        if not error:
            raise HTTPException(status_code=404, detail="Error not found")

        # 데이터베이스 필드명을 프론트엔드 필드명으로 변환
        formatted_error = {
            'id': error['id'],
            'level': error['level'],
            'activity': error['activity'],
            'error_type': 'Python Error',
            'error_message': error['error_message'],
            'code': error['user_code'],
            'user_agent': 'N/A',
            'created_at': error['created_at'],
            'resolved': bool(error['resolved']),
            'resolved_at': error.get('resolved_at')
        }

        logger.info(f"Retrieved error {error_id} for admin: {username}")
        return formatted_error
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get error {error_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve error: {str(e)}")

@app.post("/api/errors/{error_id}/toggle")
async def toggle_error_status(error_id: int, username: str = Depends(verify_token)):
    """
    오류 해결 상태 토글 (관리자 전용)
    """
    try:
        success = toggle_error_resolved(error_id)
        if not success:
            raise HTTPException(status_code=404, detail="Error not found")

        logger.info(f"Toggled error {error_id} status by admin: {username}")
        return {"success": True, "message": "Error status toggled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle error {error_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to toggle error status: {str(e)}")

class BatchTestRequest(BaseModel):
    error_ids: List[int]
    auto_fix: bool = False  # 자동 수정 시도 여부

class AutoFixRequest(BaseModel):
    error_id: int

@app.post("/api/errors/{error_id}/auto-fix")
async def auto_fix_error(
    error_id: int,
    username: str = Depends(verify_token)
):
    """
    Augment API를 사용하여 오류를 자동으로 수정합니다 (관리자 전용)
    """
    try:
        # 오류 정보 가져오기
        error = get_error_by_id(error_id)
        if not error:
            raise HTTPException(status_code=404, detail="Error not found")

        code = error.get('user_code', '')
        error_message = error.get('error_message', '')

        # Augment API로 코드 수정
        success, fixed_code, explanation = fix_code_with_augment(code, error_message)

        if not success:
            return {
                "success": False,
                "error": explanation or "코드 수정에 실패했습니다."
            }

        # 수정된 코드 테스트
        old_stdout = sys.stdout
        sys.stdout = StringIO()

        try:
            exec(fixed_code, {})
            output = sys.stdout.getvalue()

            # 테스트 성공 - 해결됨으로 변경 및 수정된 코드 저장
            toggle_error_resolved(error_id)
            save_fixed_code(error_id, fixed_code, explanation or "AI 자동 수정")

            logger.info(f"Auto-fixed error {error_id} by admin: {username}")

            return {
                "success": True,
                "fixed_code": fixed_code,
                "explanation": explanation,
                "output": output,
                "original_code": code
            }

        except Exception as test_error:
            # 수정된 코드도 실패
            return {
                "success": False,
                "error": f"수정된 코드 테스트 실패: {str(test_error)}",
                "fixed_code": fixed_code,
                "explanation": explanation
            }
        finally:
            sys.stdout = old_stdout

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to auto-fix error {error_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to auto-fix error: {str(e)}")

@app.post("/api/errors/batch-test")
async def batch_test_errors(
    request: BatchTestRequest,
    username: str = Depends(verify_token)
):
    """
    선택된 오류들을 일괄 테스트하고 성공한 오류는 자동으로 해결됨으로 변경
    """
    try:
        results = []

        for error_id in request.error_ids:
            try:
                # 오류 정보 가져오기
                error = get_error_by_id(error_id)
                if not error:
                    results.append({
                        "error_id": error_id,
                        "success": False,
                        "error": "Error not found"
                    })
                    continue

                # 이미 해결된 오류는 스킵
                if error.get('resolved'):
                    results.append({
                        "error_id": error_id,
                        "success": False,
                        "error": "Already resolved"
                    })
                    continue

                # Python 코드 실행 테스트
                code = error.get('user_code', '')

                # StringIO를 사용하여 출력 캡처
                old_stdout = sys.stdout
                sys.stdout = StringIO()

                try:
                    # 코드 실행
                    exec(code, {})
                    output = sys.stdout.getvalue()

                    # 성공 - 해결됨으로 변경
                    toggle_error_resolved(error_id)

                    results.append({
                        "error_id": error_id,
                        "success": True,
                        "output": output
                    })

                except Exception as exec_error:
                    # 실행 실패 - 자동 수정 시도
                    error_msg = str(exec_error)

                    if request.auto_fix:
                        # Augment API로 자동 수정 시도
                        success, fixed_code, explanation = fix_code_with_augment(code, error_msg)

                        if success and fixed_code:
                            # 수정된 코드 테스트
                            try:
                                exec(fixed_code, {})
                                output = sys.stdout.getvalue()

                                # 수정 성공 - 해결됨으로 변경
                                toggle_error_resolved(error_id)

                                results.append({
                                    "error_id": error_id,
                                    "success": True,
                                    "auto_fixed": True,
                                    "fixed_code": fixed_code,
                                    "explanation": explanation,
                                    "output": output
                                })
                            except Exception as fix_error:
                                # 수정된 코드도 실패
                                results.append({
                                    "error_id": error_id,
                                    "success": False,
                                    "auto_fix_attempted": True,
                                    "error": f"수정 후에도 실패: {str(fix_error)}"
                                })
                        else:
                            # 자동 수정 실패
                            results.append({
                                "error_id": error_id,
                                "success": False,
                                "auto_fix_attempted": True,
                                "error": error_msg
                            })
                    else:
                        # 자동 수정 없이 실패 기록
                        results.append({
                            "error_id": error_id,
                            "success": False,
                            "error": error_msg
                        })
                finally:
                    sys.stdout = old_stdout

            except Exception as e:
                results.append({
                    "error_id": error_id,
                    "success": False,
                    "error": str(e)
                })

        logger.info(f"Batch tested {len(request.error_ids)} errors by admin: {username}")
        return {
            "success": True,
            "results": results,
            "total": len(request.error_ids),
            "succeeded": len([r for r in results if r["success"]]),
            "failed": len([r for r in results if not r["success"]])
        }

    except Exception as e:
        logger.error(f"Failed to batch test errors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to batch test errors: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 핫리로딩 활성화
        log_level="info"
    )

