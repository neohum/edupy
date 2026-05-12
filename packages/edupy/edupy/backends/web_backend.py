"""브라우저 백엔드 — Pyodide ↔ JS `<canvas>` 호스트.

브라우저에서는 ``while True:`` 같은 블로킹 루프를 돌릴 수 없으므로,
JS 쪽 호스트 객체(``globalThis.edupyHost``)가 캔버스 · 입력 · requestAnimationFrame
루프를 소유하고, 파이썬은 매 프레임 호출되는 콜백과 그리기 명령만 제공한다.

호스트 객체가 제공해야 하는 메서드 (frontend/src/pyodide/canvasHost.ts 참고):
    createWindow(width, height, title)
    startLoop(stepProxy, fps)   # stepProxy(dtSeconds) 를 매 프레임 호출
    stopLoop()
    clear(cssColor)
    drawRect(x, y, w, h, cssColor, filled, lineWidth)
    drawCircle(x, y, r, cssColor, filled, lineWidth)
    drawLine(x1, y1, x2, y2, cssColor, width)
    drawText(text, x, y, size, cssColor)
    drawImage(name, x, y, width, height, angle)   # width/height/angle 은 null 가능
    measureImage(name) -> [w, h]
    isKeyPressed(stdKeyName) -> bool
    mousePos() -> [x, y]
    isMousePressed() -> bool
    playSound(name)
"""
from __future__ import annotations

from typing import Callable, Optional, Tuple

from .base import Backend
from .. import keys as _keys
from ..colors import to_css


def _host():
    """JS 쪽 호스트 객체. 웹 런타임이 globalThis.edupyHost 로 미리 넣어둔다."""
    import js  # noqa: PLC0415  (Pyodide 에서만 존재)
    host = getattr(js, "edupyHost", None)
    if host is None:
        raise RuntimeError(
            "웹 호스트(edupyHost)를 찾지 못했어요. 이 코드는 EduPy 웹에디터 안에서 실행해야 해요."
        )
    return host


def _create_proxy(fn):
    from pyodide.ffi import create_proxy  # noqa: PLC0415
    return create_proxy(fn)


class WebBackend(Backend):
    name = "web"

    def __init__(self) -> None:
        self._step_proxy = None

    # --- 생애주기 ---
    def create_window(self, width: int, height: int, title: str) -> None:
        _host().createWindow(int(width), int(height), title or "EduPy")

    def run_loop(self, step: Callable[[float], None], fps: int = 60) -> None:
        # 블로킹하지 않는다: 콜백을 호스트에 등록하고 즉시 반환.
        # 게임 루프 중에 예외가 나면 한글로 번역해 호스트에 알리고 루프를 멈춘다.
        from ..errors import 번역 as _translate  # 지연 import (순환 방지)

        def _safe_step(dt: float) -> None:
            try:
                step(dt)
            except BaseException as ex:  # noqa: BLE001 - 학생 코드의 모든 예외를 친절히 보여주려고
                try:
                    _host().reportError(_translate(ex))
                except Exception:
                    pass
                self.stop()

        self._step_proxy = _create_proxy(_safe_step)
        _host().startLoop(self._step_proxy, int(fps))

    def stop(self) -> None:
        try:
            _host().stopLoop()
        finally:
            if self._step_proxy is not None:
                try:
                    self._step_proxy.destroy()
                except Exception:
                    pass
                self._step_proxy = None

    # begin_frame / end_frame: 웹은 호스트의 rAF 콜백이 프레임 경계를 관리하므로 no-op.

    # --- 그리기 ---
    def clear(self, color) -> None:
        _host().clear(to_css(color, (255, 255, 255)))

    def draw_rect(self, x, y, w, h, color, filled=True, line_width=2) -> None:
        _host().drawRect(float(x), float(y), float(w), float(h), to_css(color), bool(filled), int(line_width))

    def draw_circle(self, x, y, radius, color, filled=True, line_width=2) -> None:
        _host().drawCircle(float(x), float(y), float(radius), to_css(color), bool(filled), int(line_width))

    def draw_line(self, x1, y1, x2, y2, color, width=2) -> None:
        _host().drawLine(float(x1), float(y1), float(x2), float(y2), to_css(color), int(width))

    def draw_text(self, text, x, y, size, color) -> None:
        _host().drawText(str(text), float(x), float(y), int(size), to_css(color))

    def draw_image(self, name, x, y, width=None, height=None, angle=0.0) -> None:
        _host().drawImage(
            str(name), float(x), float(y),
            None if width is None else float(width),
            None if height is None else float(height),
            float(angle or 0.0),
        )

    def measure_image(self, name) -> Tuple[int, int]:
        try:
            wh = _host().measureImage(str(name))
            return (int(wh[0]), int(wh[1]))
        except Exception:
            return (0, 0)

    # --- 입력 ---
    def is_key_pressed(self, key: str) -> bool:
        return bool(_host().isKeyPressed(_keys.normalize(key)))

    def mouse_pos(self) -> Tuple[int, int]:
        try:
            p = _host().mousePos()
            return (int(p[0]), int(p[1]))
        except Exception:
            return (0, 0)

    def is_mouse_pressed(self) -> bool:
        return bool(_host().isMousePressed())

    def play_sound(self, name: str) -> None:
        try:
            _host().playSound(str(name))
        except Exception:
            pass
