"""동봉 에셋(그림/소리) 관리.

학생은 ``edupy.그림("거북이", x, y)`` 처럼 *이름* 으로만 부른다.
- 데스크톱: 이 모듈이 이름 -> 파일 경로를 찾아준다 (동봉 에셋 또는 현재 작업 폴더의 파일).
- 웹: 파일 경로 개념이 없으므로 JS 호스트가 이름 -> URL 매핑을 갖는다 (canvasHost.ts).

새 에셋을 추가하려면 ``edupy/assets/images/`` 에 파일을 넣으면 끝.
"""
from __future__ import annotations

import os
from typing import Optional

_HERE = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(_HERE, "images")
SOUNDS_DIR = os.path.join(_HERE, "sounds")

_IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp")
_SOUND_EXTS = (".wav", ".ogg", ".mp3")

# 한글 이름 ↔ 파일 이름 별칭 (파일은 영문으로 저장하고 한글로도 부를 수 있게)
_IMAGE_ALIASES = {
    "거북이": "turtle",
    "강아지": "dog",
    "고양이": "cat",
    "공": "ball",
    "별": "star",
}


def _find(directory: str, name: str, exts: tuple[str, ...]) -> Optional[str]:
    if not os.path.isdir(directory):
        return None
    # 확장자가 이미 붙어 있으면 그대로
    base, ext = os.path.splitext(name)
    candidates = [name] if ext else [base + e for e in exts]
    for c in candidates:
        p = os.path.join(directory, c)
        if os.path.exists(p):
            return p
    return None


def resolve_image(name: str) -> Optional[str]:
    """그림 이름 -> 파일 경로 (없으면 None)."""
    if not name:
        return None
    # 1) 현재 작업 폴더의 사용자 파일 우선
    if os.path.exists(name):
        return os.path.abspath(name)
    # 2) 동봉 에셋 (한글 별칭 포함)
    target = _IMAGE_ALIASES.get(name, name)
    return _find(IMAGES_DIR, target, _IMAGE_EXTS) or _find(IMAGES_DIR, name, _IMAGE_EXTS)


def resolve_sound(name: str) -> Optional[str]:
    if not name:
        return None
    if os.path.exists(name):
        return os.path.abspath(name)
    return _find(SOUNDS_DIR, name, _SOUND_EXTS)


def 그림목록() -> list[str]:
    """쓸 수 있는 동봉 그림 이름들 (한글 별칭 포함)."""
    names: list[str] = []
    if os.path.isdir(IMAGES_DIR):
        for f in sorted(os.listdir(IMAGES_DIR)):
            base, ext = os.path.splitext(f)
            if ext.lower() in _IMAGE_EXTS:
                names.append(base)
    names.extend(sorted(_IMAGE_ALIASES.keys()))
    return names


image_list = 그림목록
