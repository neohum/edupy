"""백엔드 인터페이스.

_runtime._App 이 이 인터페이스만 사용한다. 새 백엔드(예: 터미널, 다른 WASM 런타임)를
추가하려면 이 클래스를 상속해 메서드를 채우면 된다.

좌표계: 왼쪽 위가 (0, 0), x 는 오른쪽으로, y 는 아래로 증가 (화면 좌표).
"""
from __future__ import annotations

from typing import Callable, Optional, Tuple


class Backend:
    name = "base"

    # --- 생애주기 ---
    def create_window(self, width: int, height: int, title: str) -> None:
        raise NotImplementedError

    def run_loop(self, step: Callable[[float], None], fps: int = 60) -> None:
        """매 프레임 step(dt_seconds) 를 호출하는 루프를 시작한다.

        데스크톱: 이 호출이 블로킹(창이 닫힐 때까지).
        웹: 이 호출은 즉시 반환하고, 호스트(rAF)가 step 을 계속 호출한다.
        """
        raise NotImplementedError

    def stop(self) -> None:
        """루프를 멈춘다."""
        raise NotImplementedError

    def begin_frame(self) -> None:
        """한 프레임 그리기 시작 (필요한 백엔드만)."""

    def end_frame(self) -> None:
        """한 프레임 그리기 끝 — 화면에 반영(flip/present)."""

    # --- 그리기 ---
    def clear(self, color: Tuple[int, int, int]) -> None:
        raise NotImplementedError

    def draw_rect(self, x: float, y: float, w: float, h: float,
                  color: Tuple[int, int, int], filled: bool = True, line_width: int = 2) -> None:
        raise NotImplementedError

    def draw_circle(self, x: float, y: float, radius: float,
                    color: Tuple[int, int, int], filled: bool = True, line_width: int = 2) -> None:
        raise NotImplementedError

    def draw_line(self, x1: float, y1: float, x2: float, y2: float,
                  color: Tuple[int, int, int], width: int = 2) -> None:
        raise NotImplementedError

    def draw_text(self, text: str, x: float, y: float, size: int,
                  color: Tuple[int, int, int]) -> None:
        raise NotImplementedError

    def draw_image(self, name: str, x: float, y: float,
                   width: Optional[float] = None, height: Optional[float] = None,
                   angle: float = 0.0) -> None:
        raise NotImplementedError

    def measure_image(self, name: str) -> Tuple[int, int]:
        """이미지의 (가로, 세로) 픽셀 크기. 모르면 (0, 0)."""
        return (0, 0)

    # --- 입력 ---
    def is_key_pressed(self, key: str) -> bool:
        raise NotImplementedError

    def mouse_pos(self) -> Tuple[int, int]:
        raise NotImplementedError

    def is_mouse_pressed(self) -> bool:
        raise NotImplementedError

    # --- 소리 (선택) ---
    def play_sound(self, name: str) -> None:
        pass
