"""edupy — 초등학생을 위한 교육용 파이썬 게임 라이브러리.

    import edupy
    edupy.창만들기(가로=600, 세로=400, 제목="첫 게임")
    공 = edupy.캐릭터_생성("공", x=300, y=200)
    def 그리기():
        edupy.화면_지우기("하늘색")
        공.그리기()
    edupy.실행()

자세한 설명은 README.md 와 docs/EDUPY_LIBRARY_PLAN.md 참고.
"""
from __future__ import annotations

__version__ = "0.1.0"

# 하위 모듈 (edupy.snippets, edupy.errors, edupy.colors, edupy.assets 로 접근)
from . import errors, colors, keys, snippets, assets  # noqa: F401
from . import _runtime
from ._sprite import Sprite

# import 하는 순간 친절한 한글 에러 훅 설치 (데스크톱에서 유용; 웹에서는 무해).
try:  # pragma: no cover
    errors.설치()
except Exception:
    pass


# ----------------------------- 공개 API: 한글 -----------------------------

창만들기 = _runtime.create_window
배경색 = _runtime.background
화면_지우기 = _runtime.clear
사각형 = _runtime.rect
원 = _runtime.circle
선 = _runtime.line
글자 = _runtime.text
그림 = _runtime.image
키눌림 = _runtime.is_key_pressed
마우스_위치 = _runtime.mouse_pos
마우스_눌림 = _runtime.is_mouse_pressed
소리_재생 = _runtime.play_sound
실행 = _runtime.run
멈춤 = _runtime.stop


def 캐릭터_생성(그림=None, x: float = 0, y: float = 0, **kwargs) -> Sprite:
    """캐릭터(Sprite) 하나를 만들어 돌려준다.

    예: 강아지 = edupy.캐릭터_생성("강아지", x=100, y=100)
        공 = edupy.캐릭터_생성(x=300, y=200, 색="파랑", 모양="원")
    """
    return Sprite(그림, x=x, y=y, **kwargs)


# ----------------------------- 공개 API: 영문 별칭 -----------------------------

create_window = _runtime.create_window
start = _runtime.create_window          # 별칭: 시작하기
window = _runtime.create_window
background = _runtime.background
clear = _runtime.clear
rect = _runtime.rect
rectangle = _runtime.rect
circle = _runtime.circle
line = _runtime.line
text = _runtime.text
image = _runtime.image
is_key_pressed = _runtime.is_key_pressed
key_pressed = _runtime.is_key_pressed
mouse_pos = _runtime.mouse_pos
is_mouse_pressed = _runtime.is_mouse_pressed
play_sound = _runtime.play_sound
run = _runtime.run
stop = _runtime.stop


def create_sprite(image=None, x: float = 0, y: float = 0, **kwargs) -> Sprite:
    return Sprite(image=image, x=x, y=y, **kwargs)


# 캐릭터 만들기 (한 글자 줄임도 흔히 쓰니까)
캐릭터 = 캐릭터_생성


# ----------------------------- 동적 속성: 화면 크기 -----------------------------
# 창만들기() 후에는 항상 최신 값을 돌려준다.

_SCREEN_W_NAMES = {"화면_가로", "screen_width", "WIDTH", "width", "가로"}
_SCREEN_H_NAMES = {"화면_세로", "screen_height", "HEIGHT", "height", "세로"}


def __getattr__(name: str):
    if name in _SCREEN_W_NAMES:
        return _runtime.width()
    if name in _SCREEN_H_NAMES:
        return _runtime.height()
    raise AttributeError(f"module 'edupy' has no attribute {name!r}")


def 색이름들():
    """쓸 수 있는 색 이름 목록 (예: '빨강', '하늘색', 'blue', '#ff8800' ...)."""
    return colors.색이름들()


def 그림목록():
    """쓸 수 있는 동봉 그림 이름 목록."""
    return assets.그림목록()


color_names = 색이름들
image_list = 그림목록


__all__ = [
    "__version__",
    # 한글
    "창만들기", "배경색", "화면_지우기", "사각형", "원", "선", "글자", "그림",
    "키눌림", "마우스_위치", "마우스_눌림", "소리_재생", "실행", "멈춤",
    "캐릭터_생성", "캐릭터", "색이름들", "그림목록",
    # 영문
    "create_window", "start", "window", "background", "clear", "rect", "rectangle",
    "circle", "line", "text", "image", "is_key_pressed", "key_pressed",
    "mouse_pos", "is_mouse_pressed", "play_sound", "run", "stop", "create_sprite",
    "color_names", "image_list",
    # 타입 / 하위 모듈
    "Sprite", "errors", "colors", "keys", "snippets", "assets",
]
