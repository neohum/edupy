"""키 이름 정규화.

학생이 쓰는 이름("왼쪽", "스페이스", "a", "엔터" ...)을 내부 표준 이름으로 바꾼다.
표준 이름은 소문자 영문: left/right/up/down/space/enter/escape/shift/a..z/0..9
백엔드(pygame, web)는 이 표준 이름만 다루면 된다.
"""
from __future__ import annotations

_ALIASES: dict[str, str] = {
    # 방향키
    "왼쪽": "left", "왼": "left", "←": "left", "leftarrow": "left",
    "오른쪽": "right", "오른": "right", "→": "right", "rightarrow": "right",
    "위": "up", "위쪽": "up", "↑": "up", "uparrow": "up",
    "아래": "down", "아래쪽": "down", "↓": "down", "downarrow": "down",
    # 특수키
    "스페이스": "space", "스페이스바": "space", "공백": "space", " ": "space",
    "엔터": "enter", "리턴": "enter", "return": "enter", "\n": "enter",
    "탈출": "escape", "esc": "escape",
    "쉬프트": "shift", "시프트": "shift",
    "탭": "tab",
    "백스페이스": "backspace",
}


def normalize(name: str) -> str:
    """키 이름을 내부 표준 이름으로."""
    if not isinstance(name, str):
        return str(name)
    raw = name.strip()
    low = raw.lower()
    if low in _ALIASES:
        return _ALIASES[low]
    if raw in _ALIASES:
        return _ALIASES[raw]
    if len(low) == 1 and (low.isalpha() or low.isdigit()):
        return low
    return low


def 키이름들() -> list[str]:
    return ["left", "right", "up", "down", "space", "enter", "escape", "shift",
            "tab", "backspace", "a..z", "0..9", "(한글: 왼쪽/오른쪽/위/아래/스페이스/엔터 ...)"]


key_names = 키이름들
