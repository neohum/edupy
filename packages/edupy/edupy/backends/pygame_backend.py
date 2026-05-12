"""데스크톱 백엔드 — pygame(또는 pygame-ce) 사용.

`pip install "edupy[desktop]"` 로 pygame-ce 를 함께 설치해야 한다.
브라우저(Pyodide)에서는 import 되지 않는다(backends.get_backend 가 web 을 고름).
"""
from __future__ import annotations

import os
from typing import Callable, Optional, Tuple

from .base import Backend
from .. import keys as _keys
from ..assets import resolve_image
from ..errors import EduPyAssetNotFound


def _import_pygame():
    try:
        import pygame  # noqa: PLC0415
        return pygame
    except ImportError as e:  # pragma: no cover
        raise ImportError(
            "데스크톱에서 edupy 를 실행하려면 pygame 이 필요해요. "
            '터미널에서  pip install "edupy[desktop]"  을 실행해 주세요.'
        ) from e


# 표준 키 이름 -> pygame 상수 이름
_PYGAME_KEY = {
    "left": "K_LEFT", "right": "K_RIGHT", "up": "K_UP", "down": "K_DOWN",
    "space": "K_SPACE", "enter": "K_RETURN", "escape": "K_ESCAPE",
    "shift": "K_LSHIFT", "tab": "K_TAB", "backspace": "K_BACKSPACE",
}


class PygameBackend(Backend):
    name = "pygame"

    def __init__(self) -> None:
        self.pygame = _import_pygame()
        self.screen = None
        self.clock = None
        self._running = False
        self._fonts: dict[int, object] = {}
        self._images: dict[str, object] = {}
        self._mouse_down = False

    # --- 생애주기 ---
    def create_window(self, width: int, height: int, title: str) -> None:
        pg = self.pygame
        pg.init()
        self.screen = pg.display.set_mode((width, height))
        pg.display.set_caption(title or "EduPy")
        self.clock = pg.time.Clock()

    def run_loop(self, step: Callable[[float], None], fps: int = 60) -> None:
        pg = self.pygame
        self._running = True
        while self._running:
            for event in pg.event.get():
                if event.type == pg.QUIT:
                    self._running = False
                elif event.type == pg.MOUSEBUTTONDOWN:
                    self._mouse_down = True
                elif event.type == pg.MOUSEBUTTONUP:
                    self._mouse_down = False
            dt = (self.clock.tick(fps) / 1000.0) if self.clock else (1.0 / fps)
            try:
                step(dt)
            except SystemExit:
                self._running = False
                break
            pg.display.flip()
        pg.quit()

    def stop(self) -> None:
        self._running = False

    # --- 그리기 ---
    def _font(self, size: int):
        size = int(size)
        if size not in self._fonts:
            # 한글이 필요하면 SysFont 가 자동으로 적절한 폰트를 고르려 시도
            self._fonts[size] = self.pygame.font.SysFont(
                "malgungothic,applegothic,notosanscjk,nanumgothic", size
            )
        return self._fonts[size]

    def _image(self, name: str):
        if name in self._images:
            return self._images[name]
        path = resolve_image(name)
        if path is None or not os.path.exists(path):
            raise EduPyAssetNotFound(name)
        img = self.pygame.image.load(path).convert_alpha()
        self._images[name] = img
        return img

    def clear(self, color: Tuple[int, int, int]) -> None:
        if self.screen:
            self.screen.fill(color)

    def draw_rect(self, x, y, w, h, color, filled=True, line_width=2) -> None:
        rect = self.pygame.Rect(int(x), int(y), int(w), int(h))
        self.pygame.draw.rect(self.screen, color, rect, 0 if filled else int(line_width))

    def draw_circle(self, x, y, radius, color, filled=True, line_width=2) -> None:
        self.pygame.draw.circle(self.screen, color, (int(x), int(y)), int(radius),
                                0 if filled else int(line_width))

    def draw_line(self, x1, y1, x2, y2, color, width=2) -> None:
        self.pygame.draw.line(self.screen, color, (int(x1), int(y1)), (int(x2), int(y2)), int(width))

    def draw_text(self, text, x, y, size, color) -> None:
        surf = self._font(size).render(str(text), True, color)
        self.screen.blit(surf, (int(x), int(y)))

    def draw_image(self, name, x, y, width=None, height=None, angle=0.0) -> None:
        img = self._image(name)
        if width is not None and height is not None:
            img = self.pygame.transform.smoothscale(img, (int(width), int(height)))
        if angle:
            img = self.pygame.transform.rotate(img, angle)
        rect = img.get_rect(center=(int(x), int(y)))
        self.screen.blit(img, rect)

    def measure_image(self, name) -> Tuple[int, int]:
        try:
            img = self._image(name)
            return (img.get_width(), img.get_height())
        except Exception:
            return (0, 0)

    # --- 입력 ---
    def is_key_pressed(self, key: str) -> bool:
        pg = self.pygame
        std = _keys.normalize(key)
        pressed = pg.key.get_pressed()
        if std in _PYGAME_KEY:
            return bool(pressed[getattr(pg, _PYGAME_KEY[std])])
        if len(std) == 1 and std.isalpha():
            return bool(pressed[getattr(pg, f"K_{std}")])
        if len(std) == 1 and std.isdigit():
            return bool(pressed[getattr(pg, f"K_{std}")])
        return False

    def mouse_pos(self) -> Tuple[int, int]:
        return tuple(self.pygame.mouse.get_pos())

    def is_mouse_pressed(self) -> bool:
        return bool(self.pygame.mouse.get_pressed()[0]) or self._mouse_down

    def play_sound(self, name: str) -> None:  # 최소 구현
        pass
