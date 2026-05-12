"""edupy 가 import 되고 기본 구조가 멀쩡한지 확인 (pygame/브라우저 없이 도는 부분만)."""
import importlib

import edupy
from edupy import colors, keys, snippets, errors


def test_import_and_public_api():
    for name in ["창만들기", "사각형", "원", "글자", "키눌림", "실행", "멈춤",
                 "캐릭터_생성", "create_window", "rect", "run", "Sprite"]:
        assert hasattr(edupy, name), f"공개 API 누락: {name}"
    assert isinstance(edupy.__version__, str)


def test_screen_dims_before_window():
    # 창을 안 만들었으면 0
    assert edupy.화면_가로 == 0
    assert edupy.screen_height == 0


def test_colors():
    assert colors.to_rgb("빨강") == colors.to_rgb("red")
    assert colors.to_rgb("#ff8800") == (255, 136, 0)
    assert colors.to_rgb("하늘색") == (135, 206, 235)
    assert colors.to_rgb((10, 20, 30)) == (10, 20, 30)
    assert colors.to_rgb("없는색이름", default=(1, 2, 3)) == (1, 2, 3)
    assert colors.to_css("검정") == "rgb(0, 0, 0)"
    assert "빨강" in colors.색이름들()


def test_keys_normalize():
    assert keys.normalize("왼쪽") == "left"
    assert keys.normalize("스페이스") == "space"
    assert keys.normalize("A") == "a"
    assert keys.normalize("엔터") == "enter"


def test_snippets():
    items = snippets.목록()
    ids = {s["id"] for s in items}
    assert {"jump", "move_with_keys", "collision"} <= ids
    assert "code" not in items[0]  # 목록에는 코드 미포함
    jump = snippets.가져오기("jump")
    assert jump and "code" in jump and "edupy" in jump["code"]
    assert snippets.가져오기("점프 기능") is not None  # 한글 제목으로도


def test_error_translation():
    try:
        eval("1 +")
    except SyntaxError as e:
        msg = errors.번역(e)
        assert "괄호" in msg or "문법" in msg
    try:
        undefined_name_xyz  # noqa: F821
    except NameError as e:
        assert "undefined_name_xyz" in errors.번역(e)


def test_run_without_window_raises():
    import pytest
    with pytest.raises(RuntimeError):
        edupy.실행(그리기=lambda: None)
