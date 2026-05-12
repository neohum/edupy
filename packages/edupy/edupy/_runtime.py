"""실행 시간(runtime) — 창 하나(=게임 하나)를 관리하는 _App 싱글턴.

공개 API(edupy.창만들기, edupy.사각형, edupy.실행 ...)는 모두 이 모듈의 함수에 위임한다.
이 모듈은 `edupy.backends.Backend` 인터페이스만 사용하므로, 어떤 환경에서 도는지(데스크톱/브라우저)
신경 쓰지 않는다.
"""
from __future__ import annotations

import inspect
import sys
from typing import Callable, Optional

from .backends import get_backend, Backend
from .colors import Color, to_rgb

_app: Optional["_App"] = None


class _App:
    def __init__(self, width: int, height: int, title: str, backend_name: Optional[str]):
        self.backend: Backend = get_backend(backend_name)
        self.width = int(width)
        self.height = int(height)
        self.title = title
        self.bg = (255, 255, 255)
        self.fps = 60
        self.running = False
        self._setup_cb: Optional[Callable] = None
        self._update_cb: Optional[Callable] = None
        self._draw_cb: Optional[Callable] = None
        self.backend.create_window(self.width, self.height, title)

    # 콜백 인자 개수에 맞춰 호출 (def 업데이트(): 도, def 업데이트(dt): 도 허용)
    @staticmethod
    def _arity(fn: Callable) -> int:
        try:
            return len([p for p in inspect.signature(fn).parameters.values()
                        if p.kind in (p.POSITIONAL_ONLY, p.POSITIONAL_OR_KEYWORD)])
        except (ValueError, TypeError):
            return 1

    def _make_step(self) -> Callable[[float], None]:
        update_cb = self._update_cb
        draw_cb = self._draw_cb
        update_takes_dt = bool(update_cb) and self._arity(update_cb) >= 1
        backend = self.backend

        def step(dt: float) -> None:
            if update_cb is not None:
                update_cb(dt) if update_takes_dt else update_cb()
            backend.begin_frame()
            if draw_cb is not None:
                draw_cb()
            backend.end_frame()

        return step

    def start(self) -> None:
        if self._setup_cb is not None:
            self._setup_cb()
        self.running = True
        self.backend.run_loop(self._make_step(), self.fps)

    def stop(self) -> None:
        self.running = False
        self.backend.stop()


def _require_app(action: str = "이 명령") -> "_App":
    if _app is None:
        raise RuntimeError(
            f"{action}을(를) 쓰려면 먼저 edupy.창만들기(...) 로 게임 창을 만들어야 해요."
        )
    return _app


# =========================== 공개로 노출되는 동작들 ===========================

def create_window(가로: int = 800, 세로: int = 600, 제목: str = "EduPy",
                  width: Optional[int] = None, height: Optional[int] = None,
                  title: Optional[str] = None, backend: Optional[str] = None,
                  fps: int = 60) -> None:
    global _app
    w = int(width if width is not None else 가로)
    h = int(height if height is not None else 세로)
    t = title if title is not None else 제목
    _app = _App(w, h, t, backend)
    _app.fps = int(fps)


def run(시작: Optional[Callable] = None, 업데이트: Optional[Callable] = None,
        그리기: Optional[Callable] = None, *,
        setup: Optional[Callable] = None, update: Optional[Callable] = None,
        draw: Optional[Callable] = None) -> None:
    """게임 루프를 시작한다.

    인자를 주지 않으면 호출한 코드의 전역에서 `시작`/`setup`, `업데이트`/`update`,
    `그리기`/`draw` 라는 이름의 함수를 자동으로 찾아 쓴다 (Pygame Zero 스타일).
    """
    app = _require_app("실행()")
    caller_globals = {}
    try:
        caller_globals = sys._getframe(1).f_globals
    except Exception:
        pass

    def pick(*names):
        for n in names:
            v = caller_globals.get(n)
            if callable(v):
                return v
        return None

    app._setup_cb = 시작 or setup or pick("시작", "setup", "준비")
    app._update_cb = 업데이트 or update or pick("업데이트", "update", "갱신")
    app._draw_cb = 그리기 or draw or pick("그리기", "draw", "화면그리기")

    if app._update_cb is None and app._draw_cb is None and app._setup_cb is None:
        raise RuntimeError(
            "실행할 내용이 없어요. `def 그리기():` 함수를 만들고 그 안에서 화면을 그려 주세요."
        )
    app.start()


def stop() -> None:
    if _app is not None:
        _app.stop()


# --- 정보 조회 ---
def backend() -> Backend:
    return _require_app().backend


def width() -> int:
    return _app.width if _app is not None else 0


def height() -> int:
    return _app.height if _app is not None else 0


def measure_image(name: str):
    if _app is None:
        return (0, 0)
    return _app.backend.measure_image(name)


# --- 그리기 래퍼 ---
def background(색: Color = "흰색", color: Optional[Color] = None) -> None:
    app = _require_app("배경색()")
    app.bg = to_rgb(color if color is not None else 색, (255, 255, 255))
    app.backend.clear(app.bg)


def clear(색: Color = "흰색", color: Optional[Color] = None) -> None:
    app = _require_app("화면_지우기()")
    app.backend.clear(to_rgb(color if color is not None else 색, app.bg))


def rect(x: float, y: float, 가로: float, 세로: float, 색: Color = "검정",
         width: Optional[float] = None, height: Optional[float] = None,
         color: Optional[Color] = None, 채우기: bool = True, filled: Optional[bool] = None,
         굵기: int = 2) -> None:
    app = _require_app("사각형()")
    w = width if width is not None else 가로
    h = height if height is not None else 세로
    f = filled if filled is not None else 채우기
    app.backend.draw_rect(x, y, w, h, to_rgb(color if color is not None else 색), bool(f), int(굵기))


def circle(x: float, y: float, 반지름: float, 색: Color = "검정",
           radius: Optional[float] = None, color: Optional[Color] = None,
           채우기: bool = True, filled: Optional[bool] = None, 굵기: int = 2) -> None:
    app = _require_app("원()")
    r = radius if radius is not None else 반지름
    f = filled if filled is not None else 채우기
    app.backend.draw_circle(x, y, r, to_rgb(color if color is not None else 색), bool(f), int(굵기))


def line(x1: float, y1: float, x2: float, y2: float, 색: Color = "검정",
         color: Optional[Color] = None, 굵기: int = 2, width: int = 2) -> None:
    app = _require_app("선()")
    w = width if width != 2 else 굵기
    app.backend.draw_line(x1, y1, x2, y2, to_rgb(color if color is not None else 색), int(w))


def text(글: str, x: float = 10, y: float = 10, 크기: int = 24, 색: Color = "검정",
         s: Optional[str] = None, size: Optional[int] = None, color: Optional[Color] = None) -> None:
    app = _require_app("글자()")
    content = s if s is not None else 글
    sz = size if size is not None else 크기
    app.backend.draw_text(str(content), x, y, int(sz), to_rgb(color if color is not None else 색))


def image(이름: str, x: float, y: float, name: Optional[str] = None,
          가로: Optional[float] = None, 세로: Optional[float] = None,
          width: Optional[float] = None, height: Optional[float] = None) -> None:
    app = _require_app("그림()")
    n = name if name is not None else 이름
    w = width if width is not None else 가로
    h = height if height is not None else 세로
    app.backend.draw_image(n, x, y, w, h, 0.0)


# --- 입력 ---
def is_key_pressed(키: str, key: Optional[str] = None) -> bool:
    app = _require_app("키눌림()")
    return app.backend.is_key_pressed(key if key is not None else 키)


def mouse_pos():
    app = _require_app("마우스_위치()")
    return app.backend.mouse_pos()


def is_mouse_pressed() -> bool:
    app = _require_app("마우스_눌림()")
    return app.backend.is_mouse_pressed()


def play_sound(이름: str, name: Optional[str] = None) -> None:
    app = _require_app("소리_재생()")
    app.backend.play_sound(name if name is not None else 이름)
