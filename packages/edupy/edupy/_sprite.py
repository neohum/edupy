"""캐릭터(Sprite) — 위치를 가지고 움직이고 충돌하는 화면 위 물체.

위치 (x, y) 는 *중심* 좌표다 (초등학생이 이해하기 쉽게).
그림 이름을 주면 그림으로, 안 주면 색칠된 네모(또는 동그라미)로 그려진다.
"""
from __future__ import annotations

from typing import Optional

from . import _runtime
from .colors import Color


class Sprite:
    def __init__(self, 그림: Optional[str] = None, x: float = 0, y: float = 0,
                 가로: Optional[float] = None, 세로: Optional[float] = None,
                 색: Color = "빨강", 모양: str = "사각형",
                 image: Optional[str] = None, width: Optional[float] = None,
                 height: Optional[float] = None, color: Optional[Color] = None,
                 shape: Optional[str] = None):
        self.그림_이름 = 그림 if 그림 is not None else image
        self.x = float(x)
        self.y = float(y)
        self.색 = color if color is not None else 색
        self.모양 = (shape or 모양)
        self.각도 = 0.0
        self.보임 = True
        # 크기: 명시값 > 그림 자연 크기 > 기본 40
        w = 가로 if 가로 is not None else width
        h = 세로 if 세로 is not None else height
        self._가로 = float(w) if w is not None else None
        self._세로 = float(h) if h is not None else None

    # --- 크기 ---
    def _ensure_size(self) -> None:
        if self._가로 is not None and self._세로 is not None:
            return
        if self.그림_이름:
            iw, ih = _runtime.measure_image(self.그림_이름)
            if iw and ih:
                self._가로 = self._가로 if self._가로 is not None else float(iw)
                self._세로 = self._세로 if self._세로 is not None else float(ih)
        if self._가로 is None:
            self._가로 = 40.0
        if self._세로 is None:
            self._세로 = 40.0

    @property
    def 가로(self) -> float:
        self._ensure_size()
        return self._가로

    @가로.setter
    def 가로(self, v: float) -> None:
        self._가로 = float(v)

    @property
    def 세로(self) -> float:
        self._ensure_size()
        return self._세로

    @세로.setter
    def 세로(self, v: float) -> None:
        self._세로 = float(v)

    # 영문 별칭 (속성)
    width = 가로
    height = 세로

    @property
    def 왼쪽_x(self) -> float:
        return self.x - self.가로 / 2

    @property
    def 위쪽_y(self) -> float:
        return self.y - self.세로 / 2

    # --- 움직임 ---
    def 이동(self, dx: float, dy: float) -> "Sprite":
        self.x += dx
        self.y += dy
        return self

    def 오른쪽으로(self, 거리: float) -> "Sprite":
        self.x += 거리
        return self

    def 왼쪽으로(self, 거리: float) -> "Sprite":
        self.x -= 거리
        return self

    def 위로(self, 거리: float) -> "Sprite":
        self.y -= 거리
        return self

    def 아래로(self, 거리: float) -> "Sprite":
        self.y += 거리
        return self

    def 위치로(self, x: float, y: float) -> "Sprite":
        self.x = float(x)
        self.y = float(y)
        return self

    # 영문 별칭 (메서드)
    move = 이동
    move_right = 오른쪽으로
    move_left = 왼쪽으로
    move_up = 위로
    move_down = 아래로
    move_to = 위치로

    # --- 화면 안에 가두기 ---
    def 화면안에_가두기(self) -> "Sprite":
        w = _runtime.width()
        h = _runtime.height()
        half_w = self.가로 / 2
        half_h = self.세로 / 2
        if self.x < half_w:
            self.x = half_w
        if self.x > w - half_w:
            self.x = w - half_w
        if self.y < half_h:
            self.y = half_h
        if self.y > h - half_h:
            self.y = h - half_h
        return self

    clamp_to_screen = 화면안에_가두기

    def 화면밖인가(self) -> bool:
        w = _runtime.width()
        h = _runtime.height()
        return (self.x + self.가로 / 2 < 0 or self.x - self.가로 / 2 > w
                or self.y + self.세로 / 2 < 0 or self.y - self.세로 / 2 > h)

    is_off_screen = 화면밖인가

    # --- 충돌 (AABB) ---
    def 충돌(self, other: "Sprite") -> bool:
        if other is None:
            return False
        ax, ay = self.x, self.y
        aw, ah = self.가로 / 2, self.세로 / 2
        bx, by = other.x, other.y
        bw, bh = other.가로 / 2, other.세로 / 2
        return abs(ax - bx) < (aw + bw) and abs(ay - by) < (ah + bh)

    collides_with = 충돌

    def 점과_충돌(self, x: float, y: float) -> bool:
        return (abs(self.x - x) < self.가로 / 2) and (abs(self.y - y) < self.세로 / 2)

    contains_point = 점과_충돌

    # --- 그리기 ---
    def 그리기(self) -> "Sprite":
        if not self.보임:
            return self
        b = _runtime.backend()
        from .colors import to_rgb
        if self.그림_이름:
            try:
                b.draw_image(self.그림_이름, self.x, self.y, self.가로, self.세로, self.각도)
                return self
            except Exception:
                # 그림을 못 찾으면 네모로 대신 그려서 게임이 멈추지 않게
                pass
        rgb = to_rgb(self.색, (220, 40, 40))
        if self.모양 in ("원", "circle", "동그라미"):
            b.draw_circle(self.x, self.y, max(self.가로, self.세로) / 2, rgb, True)
        else:
            b.draw_rect(self.왼쪽_x, self.위쪽_y, self.가로, self.세로, rgb, True)
        return self

    draw = 그리기

    def 숨기기(self) -> "Sprite":
        self.보임 = False
        return self

    def 보이기(self) -> "Sprite":
        self.보임 = True
        return self

    hide = 숨기기
    show = 보이기

    def __repr__(self) -> str:
        return f"<캐릭터 {self.그림_이름 or self.모양} x={self.x:.0f} y={self.y:.0f}>"
