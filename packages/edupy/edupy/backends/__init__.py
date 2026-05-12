"""렌더링 백엔드 선택.

- emscripten(Pyodide, 브라우저) -> WebBackend
- 그 외(데스크톱) -> PygameBackend
"""
from __future__ import annotations

import sys

from .base import Backend

__all__ = ["Backend", "get_backend", "is_web"]


def is_web() -> bool:
    return sys.platform == "emscripten"


def get_backend(name: str | None = None) -> Backend:
    """백엔드 인스턴스를 만들어 돌려준다.

    name: "web" | "pygame" | None(자동 감지)
    """
    if name is None:
        name = "web" if is_web() else "pygame"
    name = name.lower()
    if name == "web":
        from .web_backend import WebBackend
        return WebBackend()
    if name in ("pygame", "desktop"):
        from .pygame_backend import PygameBackend
        return PygameBackend()
    raise ValueError(f"알 수 없는 백엔드: {name!r} (web 또는 pygame 중에 골라주세요)")
