"""코드 스니펫(코드 덩어리) — 학생이 복사해 붙여 쓰는 모듈화된 코드.

스니펫은 *데이터*(JSON)로 보관한다. 같은 데이터를:
- 라이브러리: ``edupy.snippets.가져오기("점프")`` / ``get("jump")``
- 웹에디터: 드래그-삽입 카드
- 문서 사이트: 복붙 카드
가 공유한다.

JSON 형식::

    {
      "id": "jump",
      "title": "점프 기능",
      "title_en": "Jump",
      "description": "스페이스를 누르면 캐릭터가 폴짝 뛰어요.",
      "tags": ["movement", "physics"],
      "code": "...붙여넣을 코드..."
    }
"""
from __future__ import annotations

import json
import os
from typing import Optional

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load_all() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for fname in sorted(os.listdir(_HERE)):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(_HERE, fname), "r", encoding="utf-8") as f:
            data = json.load(f)
        sid = data.get("id") or os.path.splitext(fname)[0]
        data["id"] = sid
        out[sid] = data
        # 한글 제목으로도 찾을 수 있게
        if data.get("title"):
            out.setdefault(data["title"], data)
    return out


_CACHE: Optional[dict[str, dict]] = None


def _all() -> dict[str, dict]:
    global _CACHE
    if _CACHE is None:
        _CACHE = _load_all()
    return _CACHE


def 목록() -> list[dict]:
    """모든 스니펫의 메타데이터(코드 제외) 목록."""
    seen = set()
    result = []
    for s in _all().values():
        if s["id"] in seen:
            continue
        seen.add(s["id"])
        result.append({k: v for k, v in s.items() if k != "code"})
    return result


def 가져오기(name: str) -> Optional[dict]:
    """이름(id 또는 한글 제목)으로 스니펫 하나를 가져온다 (코드 포함)."""
    return _all().get(name)


def 코드(name: str) -> str:
    """스니펫의 코드 문자열만."""
    s = 가져오기(name)
    return s["code"] if s else ""


# 영문 별칭
list_all = 목록
get = 가져오기
code = 코드
