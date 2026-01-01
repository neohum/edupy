"""
Pygame 실시간 스트리밍 모듈
WebSocket을 통해 Pygame 게임을 실시간으로 스트리밍합니다.
"""

import pygame
import asyncio
import base64
import io
import uuid
import os
from PIL import Image
from typing import Dict, Optional, Callable, List
from dataclasses import dataclass, field
from enum import Enum
import traceback


class GameState(Enum):
    """게임 세션 상태"""
    WAITING = "waiting"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class GameSession:
    """게임 세션 정보"""
    session_id: str
    code: str
    width: int
    height: int
    state: GameState
    screen: Optional[pygame.Surface] = None
    clock: Optional[pygame.time.Clock] = None
    namespace: dict = field(default_factory=dict)
    fps: int = 30
    last_error: Optional[str] = None
    key_queue: List[dict] = field(default_factory=list)
    connection_count: int = 0  # 연결된 클라이언트 수
    pressed_keys: dict = field(default_factory=dict)  # 현재 눌린 키 상태


class KeyStateWrapper:
    """pygame.key.get_pressed() 결과를 시뮬레이션하는 래퍼"""
    def __init__(self, pressed_keys: dict):
        self._pressed_keys = pressed_keys

    def __getitem__(self, key):
        return self._pressed_keys.get(key, False)

    def __len__(self):
        return 512  # pygame 키 코드 최대값


class GameSessionManager:
    """게임 세션 관리자"""

    def __init__(self, max_sessions: int = 10):
        self.sessions: Dict[str, GameSession] = {}
        self.max_sessions = max_sessions

    def create_session(self, code: str, width: int = 800, height: int = 600) -> str:
        """새 게임 세션 생성"""
        # 세션 수 제한 확인
        if len(self.sessions) >= self.max_sessions:
            # 가장 오래된 세션 제거
            oldest_id = next(iter(self.sessions))
            self.remove_session(oldest_id)

        session_id = str(uuid.uuid4())[:8]  # 짧은 ID 사용
        session = GameSession(
            session_id=session_id,
            code=code,
            width=width,
            height=height,
            state=GameState.WAITING,
        )
        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[GameSession]:
        """세션 조회"""
        return self.sessions.get(session_id)

    def remove_session(self, session_id: str):
        """세션 제거 및 리소스 정리"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            session.state = GameState.STOPPED
            del self.sessions[session_id]


# 전역 세션 관리자
session_manager = GameSessionManager()


def setup_headless_display():
    """헤드리스 환경을 위한 디스플레이 설정"""
    # macOS나 일반 환경에서는 기본 드라이버 사용
    # 헤드리스 서버에서는 dummy 드라이버 사용
    if os.environ.get('DISPLAY') is None and os.name != 'nt':
        os.environ['SDL_VIDEODRIVER'] = 'dummy'


def capture_frame(screen: pygame.Surface, quality: int = 75) -> str:
    """
    Pygame surface를 base64 JPEG로 캡처

    Args:
        screen: Pygame surface
        quality: JPEG 품질 (1-100)

    Returns:
        base64 인코딩된 JPEG 문자열
    """
    # Surface를 RGB 문자열로 변환
    raw_str = pygame.image.tostring(screen, 'RGB')
    image = Image.frombytes('RGB', screen.get_size(), raw_str)

    # JPEG로 인코딩 (PNG보다 빠름)
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=quality)
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def preprocess_game_code(code: str) -> str:
    """
    사용자 코드를 스트리밍에 맞게 전처리

    - pygame.quit() 제거
    - 무한 루프 수정
    """
    # pygame.quit() 제거
    code = code.replace('pygame.quit()', '# pygame.quit() - removed for streaming')
    code = code.replace('sys.exit()', '# sys.exit() - removed for streaming')

    return code


def extract_setup_and_loop(code: str) -> tuple:
    """
    코드를 초기화 부분과 루프 부분으로 분리

    Returns:
        (setup_code, loop_body, has_loop)
    """
    lines = code.split('\n')
    setup_lines = []
    loop_lines = []
    in_loop = False
    loop_indent = 0

    for line in lines:
        stripped = line.lstrip()

        if not in_loop:
            if stripped.startswith('while running:') or stripped.startswith('while True:'):
                in_loop = True
                loop_indent = len(line) - len(stripped) + 4
                continue
            setup_lines.append(line)
        else:
            # 루프 내부 코드
            if line.strip() and not line.startswith(' ' * loop_indent) and not line.startswith('\t'):
                # 루프 밖으로 나옴
                in_loop = False
                setup_lines.append(line)
            else:
                # 들여쓰기 제거하고 저장
                if line.strip():
                    loop_lines.append(line[loop_indent:] if len(line) >= loop_indent else line)

    return '\n'.join(setup_lines), '\n'.join(loop_lines), len(loop_lines) > 0


async def run_game_streaming(
    session: GameSession,
    send_frame: Callable[[str], asyncio.Future],
    send_status: Callable[[str, Optional[str]], asyncio.Future]
):
    """
    게임을 실행하고 프레임을 스트리밍

    Args:
        session: 게임 세션
        send_frame: 프레임 전송 콜백
        send_status: 상태 전송 콜백
    """
    setup_headless_display()

    try:
        # Pygame 초기화
        pygame.init()
        pygame.display.set_caption('EduPy Game')
        session.screen = pygame.display.set_mode((session.width, session.height))
        session.clock = pygame.time.Clock()

        # 커스텀 get_pressed 함수 생성
        def custom_get_pressed():
            return KeyStateWrapper(session.pressed_keys)

        # pygame.key 모듈 래핑
        class CustomKeyModule:
            """pygame.key 모듈을 래핑하여 get_pressed를 오버라이드"""
            def __getattr__(self, name):
                if name == 'get_pressed':
                    return custom_get_pressed
                return getattr(pygame.key, name)

        # 커스텀 pygame 모듈 생성
        class CustomPygame:
            """pygame 모듈을 래핑하여 key.get_pressed를 오버라이드"""
            def __init__(self):
                self.key = CustomKeyModule()

            def __getattr__(self, name):
                if name == 'key':
                    return self.key
                return getattr(pygame, name)

        custom_pygame = CustomPygame()

        # 네임스페이스 설정
        session.namespace = {
            'pygame': custom_pygame,
            'screen': session.screen,
            '__name__': '__main__',
            'running': True,
            'True': True,
            'False': False,
        }

        # 코드 전처리
        modified_code = preprocess_game_code(session.code)

        # 초기화 코드와 루프 코드 분리
        setup_code, loop_body, has_loop = extract_setup_and_loop(modified_code)

        # 초기화 코드 실행
        try:
            exec(setup_code, session.namespace)
        except Exception as e:
            session.last_error = f"Setup error: {str(e)}"
            session.state = GameState.ERROR
            await send_status('error', session.last_error)
            return

        session.state = GameState.RUNNING
        await send_status('running', None)

        frame_count = 0

        # 메인 게임 루프
        while session.state == GameState.RUNNING:
            # 키 이벤트 주입 및 상태 업데이트
            if session.key_queue:
                print(f"[DEBUG] Processing {len(session.key_queue)} key events")
            for key_data in session.key_queue:
                key_code = key_data['key']
                if key_data['type'] == 'keydown':
                    session.pressed_keys[key_code] = True
                    print(f"[DEBUG] Key DOWN: {key_code}, pressed_keys: {session.pressed_keys}")
                    event = pygame.event.Event(pygame.KEYDOWN, key=key_code)
                else:
                    session.pressed_keys[key_code] = False
                    print(f"[DEBUG] Key UP: {key_code}")
                    event = pygame.event.Event(pygame.KEYUP, key=key_code)
                pygame.event.post(event)
            session.key_queue.clear()

            # Pygame 이벤트 처리
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    session.state = GameState.STOPPED
                    break
                # 이벤트를 네임스페이스에 전달 (사용자 코드에서 처리)
                session.namespace['event'] = event

            # 루프 본문 실행 (있는 경우)
            if has_loop and session.namespace.get('running', True):
                try:
                    exec(loop_body, session.namespace)
                except Exception as e:
                    session.last_error = f"Loop error: {str(e)}\n{traceback.format_exc()}"
                    session.state = GameState.ERROR
                    await send_status('error', session.last_error)
                    break

            # running이 False면 종료
            if not session.namespace.get('running', True):
                session.state = GameState.STOPPED
                break

            # 화면 업데이트
            pygame.display.flip()

            # 프레임 캡처 및 전송
            try:
                frame_data = capture_frame(session.screen)
                await send_frame(frame_data)
            except Exception as e:
                # 전송 실패 시 종료
                session.state = GameState.STOPPED
                break

            # FPS 제어
            session.clock.tick(session.fps)

            # 비동기 양보
            await asyncio.sleep(0)

            frame_count += 1

            # 최대 프레임 제한 (5분 = 9000 frames at 30fps)
            if frame_count > 9000:
                session.state = GameState.STOPPED
                await send_status('stopped', 'Maximum runtime exceeded (5 minutes)')
                break

        await send_status('stopped', None)

    except Exception as e:
        session.last_error = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        session.state = GameState.ERROR
        await send_status('error', session.last_error)

    finally:
        # Pygame 정리
        try:
            pygame.quit()
        except:
            pass
        session.screen = None
        session.clock = None


# 키보드 매핑: JavaScript keyCode -> Pygame key
JS_TO_PYGAME_KEY = {
    'ArrowUp': pygame.K_UP,
    'ArrowDown': pygame.K_DOWN,
    'ArrowLeft': pygame.K_LEFT,
    'ArrowRight': pygame.K_RIGHT,
    'Space': pygame.K_SPACE,
    'Enter': pygame.K_RETURN,
    'Escape': pygame.K_ESCAPE,
    'KeyA': pygame.K_a,
    'KeyB': pygame.K_b,
    'KeyC': pygame.K_c,
    'KeyD': pygame.K_d,
    'KeyE': pygame.K_e,
    'KeyF': pygame.K_f,
    'KeyG': pygame.K_g,
    'KeyH': pygame.K_h,
    'KeyI': pygame.K_i,
    'KeyJ': pygame.K_j,
    'KeyK': pygame.K_k,
    'KeyL': pygame.K_l,
    'KeyM': pygame.K_m,
    'KeyN': pygame.K_n,
    'KeyO': pygame.K_o,
    'KeyP': pygame.K_p,
    'KeyQ': pygame.K_q,
    'KeyR': pygame.K_r,
    'KeyS': pygame.K_s,
    'KeyT': pygame.K_t,
    'KeyU': pygame.K_u,
    'KeyV': pygame.K_v,
    'KeyW': pygame.K_w,
    'KeyX': pygame.K_x,
    'KeyY': pygame.K_y,
    'KeyZ': pygame.K_z,
    'Digit0': pygame.K_0,
    'Digit1': pygame.K_1,
    'Digit2': pygame.K_2,
    'Digit3': pygame.K_3,
    'Digit4': pygame.K_4,
    'Digit5': pygame.K_5,
    'Digit6': pygame.K_6,
    'Digit7': pygame.K_7,
    'Digit8': pygame.K_8,
    'Digit9': pygame.K_9,
}


def convert_js_key_to_pygame(js_key: str) -> Optional[int]:
    """JavaScript 키 코드를 Pygame 키 코드로 변환"""
    return JS_TO_PYGAME_KEY.get(js_key)
