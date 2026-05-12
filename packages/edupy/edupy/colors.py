"""색 이름 -> (r, g, b) 변환.

한글 이름, 영문 이름, "#rrggbb" 16진수, (r, g, b) 튜플을 모두 받아준다.
초등학생이 자주 쓰는 색 위주로 골랐다.
"""
from __future__ import annotations

_NAMED: dict[str, tuple[int, int, int]] = {
    # 한글
    "검정": (0, 0, 0),
    "검은색": (0, 0, 0),
    "흰색": (255, 255, 255),
    "하양": (255, 255, 255),
    "회색": (128, 128, 128),
    "연회색": (200, 200, 200),
    "빨강": (220, 40, 40),
    "빨간색": (220, 40, 40),
    "주황": (255, 140, 0),
    "주황색": (255, 140, 0),
    "노랑": (250, 210, 40),
    "노란색": (250, 210, 40),
    "초록": (40, 180, 70),
    "초록색": (40, 180, 70),
    "연두": (150, 220, 100),
    "파랑": (40, 100, 220),
    "파란색": (40, 100, 220),
    "하늘색": (135, 206, 235),
    "남색": (30, 50, 130),
    "보라": (150, 70, 200),
    "보라색": (150, 70, 200),
    "분홍": (255, 150, 190),
    "분홍색": (255, 150, 190),
    "갈색": (139, 90, 43),
    "살구색": (255, 220, 180),
    "금색": (212, 175, 55),
    "은색": (192, 192, 192),
    # 영문
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "gray": (128, 128, 128),
    "grey": (128, 128, 128),
    "lightgray": (200, 200, 200),
    "red": (220, 40, 40),
    "orange": (255, 140, 0),
    "yellow": (250, 210, 40),
    "green": (40, 180, 70),
    "lime": (150, 220, 100),
    "blue": (40, 100, 220),
    "skyblue": (135, 206, 235),
    "navy": (30, 50, 130),
    "purple": (150, 70, 200),
    "violet": (150, 70, 200),
    "pink": (255, 150, 190),
    "brown": (139, 90, 43),
    "gold": (212, 175, 55),
    "silver": (192, 192, 192),
}

Color = "tuple[int, int, int] | str"


def to_rgb(color: Color, default: tuple[int, int, int] = (0, 0, 0)) -> tuple[int, int, int]:
    """색 값을 (r, g, b) 정수 튜플로 정규화한다."""
    if color is None:
        return default
    if isinstance(color, (tuple, list)) and len(color) >= 3:
        r, g, b = color[0], color[1], color[2]
        return (int(r) & 255, int(g) & 255, int(b) & 255)
    if isinstance(color, str):
        key = color.strip().lower()
        if key in _NAMED:
            return _NAMED[key]
        # 한글은 lower() 영향이 없으므로 원본 키로도 조회
        if color.strip() in _NAMED:
            return _NAMED[color.strip()]
        if key.startswith("#"):
            key = key[1:]
        if len(key) == 6:
            try:
                return (int(key[0:2], 16), int(key[2:4], 16), int(key[4:6], 16))
            except ValueError:
                pass
        if len(key) == 3:
            try:
                return (int(key[0] * 2, 16), int(key[1] * 2, 16), int(key[2] * 2, 16))
            except ValueError:
                pass
    return default


def to_css(color: Color, default: tuple[int, int, int] = (0, 0, 0)) -> str:
    """색 값을 CSS "rgb(r, g, b)" 문자열로 변환 (웹 백엔드용)."""
    r, g, b = to_rgb(color, default)
    return f"rgb({r}, {g}, {b})"


def 색이름들() -> list[str]:
    """사용할 수 있는 색 이름 목록."""
    return sorted(_NAMED.keys())


color_names = 색이름들
