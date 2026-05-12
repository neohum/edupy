"""흔한 파이썬/edupy 예외를 초등학생용 한글 메시지로 번역한다.

- ``import edupy`` 시 ``sys.excepthook`` 을 설치 (한 번만).
- ``edupy.errors.번역(예외)`` / ``translate(exc)`` 로 임의의 예외 메시지를 얻을 수 있다
  (웹에디터 출력 패널에서 재사용).
- ``edupy.errors.해제()`` / ``uninstall()`` 로 원래 동작으로 되돌린다.
"""
from __future__ import annotations

import sys
import traceback
import types
from typing import Optional

_original_excepthook = None
_installed = False


def _line_hint(exc: BaseException) -> str:
    """예외에서 사용자 코드의 줄 번호 힌트를 뽑아 " (○○줄 근처)" 형태로."""
    lineno = None
    if isinstance(exc, SyntaxError) and exc.lineno:
        lineno = exc.lineno
    else:
        tb = exc.__traceback__
        last = None
        while tb is not None:
            fname = tb.tb_frame.f_code.co_filename
            # edupy 내부 프레임은 건너뛰고, 사용자 코드(보통 "<...>" 또는 main 파일)만
            if "edupy" + "/" not in fname.replace("\\", "/") and "edupy\\" not in fname:
                last = tb.tb_lineno
            tb = tb.tb_next
        lineno = last
    return f" ({lineno}번째 줄 근처)" if lineno else ""


def 번역(exc: BaseException) -> str:
    """예외 -> 초등학생용 한글 한 줄 설명."""
    name = type(exc).__name__
    msg = str(exc)
    hint = _line_hint(exc)

    if isinstance(exc, SyntaxError):
        text = msg.lower()
        if "eol" in text or "string literal" in text or "quote" in text:
            return f'따옴표 " " 를 닫지 않은 것 같아요. 글자 양쪽에 따옴표가 짝을 이뤄야 해요.{hint}'
        if "(" in msg or ")" in msg or "parenthes" in text or "bracket" in text:
            return f"괄호 ( ) 의 짝이 맞지 않아요. 여는 괄호와 닫는 괄호 개수를 세어 보세요.{hint}"
        if "invalid syntax" in text:
            return f"문법이 조금 어긋났어요. 콜론 ( : ), 쉼표 ( , ), 따옴표, 괄호를 빠뜨리지 않았는지 살펴 보세요.{hint}"
        return f"문법 오류예요. 줄을 천천히 다시 읽어 보세요.{hint}"

    if isinstance(exc, IndentationError):
        return f"들여쓰기(앞 공백)가 맞지 않아요. 같은 묶음 안의 줄들은 똑같은 칸 수만큼 띄워야 해요.{hint}"

    if isinstance(exc, TabError):
        return f"공백(스페이스)과 탭(Tab)이 섞여 있어요. 들여쓰기는 스페이스만 쓰는 게 좋아요.{hint}"

    if isinstance(exc, NameError):
        target = msg.split("'")[1] if "'" in msg else "그 이름"
        return (f"'{target}' 라는 이름을 아직 만들지 않았어요. 철자가 맞는지, "
                f"`{target} = ...` 처럼 먼저 값을 정해 줬는지 확인해 보세요.{hint}")

    if isinstance(exc, ZeroDivisionError):
        return f"0 으로 나눌 수는 없어요. 나누는 수가 0 이 되지 않는지 확인해 보세요.{hint}"

    if isinstance(exc, IndexError):
        return f"목록(리스트)에 없는 자리를 가리켰어요. 번호가 목록 길이보다 작은지 확인해 보세요. (첫 번째는 0번){hint}"

    if isinstance(exc, KeyError):
        return f"딕셔너리에 {msg} 라는 열쇠(key)가 없어요. 철자와 따옴표를 확인해 보세요.{hint}"

    if isinstance(exc, FileNotFoundError) or (name == "EduPyAssetNotFound"):
        return (f"파일을 찾지 못했어요: {msg}. 이름의 철자와, 그 파일이 같은 폴더(또는 에셋 목록)에 "
                f"있는지 확인해 보세요.{hint}")

    if isinstance(exc, TypeError):
        text = msg.lower()
        if "argument" in text and ("positional" in text or "takes" in text or "missing" in text):
            return f"함수에 넣어 준 값의 개수가 맞지 않아요. 괄호 안에 필요한 값을 모두(또는 너무 많지 않게) 넣었는지 보세요.{hint}"
        if "not callable" in text:
            return f"함수가 아닌 것을 ( ) 로 불렀어요. 변수 이름과 함수 이름이 같지 않은지 확인해 보세요.{hint}"
        if "unsupported operand" in text or "can only concatenate" in text:
            return f"숫자와 글자처럼 서로 다른 종류를 함께 계산하려고 했어요. `str(...)` 또는 `int(...)` 로 종류를 맞춰 보세요.{hint}"
        return f"값의 '종류'가 맞지 않아요 (예: 숫자가 와야 하는데 글자가 옴).{hint}"

    if isinstance(exc, ValueError):
        text = msg.lower()
        if "invalid literal for int" in text:
            return f"숫자로 바꿀 수 없는 글자를 `int(...)` 에 넣었어요. 숫자만 들어 있는지 확인해 보세요.{hint}"
        return f"값이 알맞지 않아요: {msg}{hint}"

    if isinstance(exc, AttributeError):
        return f"그 대상에는 {msg.split('attribute')[-1].strip() or '그런 기능'} 이(가) 없어요. 철자나 점(.) 뒤 이름을 확인해 보세요.{hint}"

    if isinstance(exc, RecursionError):
        return f"함수가 자기 자신을 끝없이 불렀어요. 멈추는 조건(기저 사례)을 넣어 주세요.{hint}"

    if isinstance(exc, ModuleNotFoundError):
        return f"`{msg.split(chr(39))[1] if chr(39) in msg else msg}` 라는 모듈(꾸러미)을 찾지 못했어요. 철자를 확인하거나 설치가 필요해요.{hint}"

    if isinstance(exc, KeyboardInterrupt):
        return "실행을 멈췄어요."

    # 그 밖
    return f"{name}: {msg}{hint}"


# 영문 별칭
translate = 번역


def _format(exc_type, exc, tb) -> str:
    friendly = 번역(exc)
    detail = "".join(traceback.format_exception(exc_type, exc, tb))
    return f"😅 {friendly}\n\n— 자세한 정보 —\n{detail}"


def _excepthook(exc_type, exc, tb):  # pragma: no cover - 표준 훅
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc, tb)
        return
    sys.stderr.write(_format(exc_type, exc, tb))


def 설치() -> None:
    """sys.excepthook 을 친절한 한글 버전으로 교체 (한 번만)."""
    global _original_excepthook, _installed
    if _installed:
        return
    _original_excepthook = sys.excepthook
    sys.excepthook = _excepthook
    _installed = True


def 해제() -> None:
    """원래 excepthook 으로 되돌린다."""
    global _original_excepthook, _installed
    if not _installed:
        return
    sys.excepthook = _original_excepthook or sys.__excepthook__
    _original_excepthook = None
    _installed = False


# 영문 별칭
install = 설치
uninstall = 해제
format_friendly = _format


class EduPyError(Exception):
    """edupy 자체에서 발생시키는 오류의 베이스."""


class EduPyAssetNotFound(EduPyError):
    """그림/소리 등 에셋을 찾지 못했을 때."""
