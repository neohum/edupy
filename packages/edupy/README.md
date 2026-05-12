# edupy — 초등학생을 위한 교육용 파이썬 게임 라이브러리

> 한글로 된 쉬운 명령어, 복잡한 준비 코드 없음, 에러도 한글로 친절하게.
> 초등 5·6학년이 텍스트 코딩으로 넘어가는 과도기를 위해 설계되었습니다.

## 설치

```bash
# 데스크톱(Windows/Mac/Linux)에서 직접 실행하려면:
pip install "edupy[desktop]"

# (웹 브라우저 = Pyodide 환경에서는 의존성 없이 그대로 동작)
```

## 30초 예제

```python
import edupy

edupy.창만들기(가로=600, 세로=400, 제목="첫 게임")
공 = edupy.캐릭터_생성("공", x=300, y=200)

def 업데이트(dt):
    if edupy.키눌림("왼쪽"):
        공.왼쪽으로(5)
    if edupy.키눌림("오른쪽"):
        공.오른쪽으로(5)
    공.화면안에_가두기()

def 그리기():
    edupy.화면_지우기("하늘색")
    공.그리기()
    edupy.글자("← → 키로 움직여요", x=20, y=20)

edupy.실행()
```

`시작()`, `업데이트(dt)`, `그리기()` 함수를 정의해 두면 `edupy.실행()` 이 알아서 찾아 매 프레임 호출합니다 (Pygame Zero 스타일). `import edupy` 만으로는 창이 뜨지 않습니다 — `edupy.창만들기()` 와 `edupy.실행()` 을 호출해야 합니다.

## 영문 별칭

모든 한글 함수는 영문 별칭이 있습니다 (`창만들기`↔`create_window`/`start`, `사각형`↔`rect`, `키눌림`↔`is_key_pressed`, `실행`↔`run` …). 한글로 시작해서 점점 영문으로 옮겨가는 사다리로 쓰세요.

## 백엔드

`edupy` 는 화면 그리기를 백엔드에 위임합니다.

- `pygame_backend` — 데스크톱. `pygame-ce` 사용.
- `web_backend` — 브라우저(Pyodide). JS `<canvas>` 호스트(`globalThis.__edupy_host__`)에 위임.

`sys.platform == "emscripten"` 이면 자동으로 web 백엔드, 아니면 pygame 백엔드를 씁니다. `edupy.창만들기(..., backend="web")` 로 강제할 수도 있습니다.

## 친절한 한글 에러

`import edupy` 시 `sys.excepthook` 이 설치되어 흔한 예외를 초등학생용 메시지로 번역합니다. 끄려면 `edupy.errors.해제()` / `edupy.errors.uninstall()`. 임의의 예외를 번역만 하려면 `edupy.errors.번역(예외)` / `translate(exc)`.

## 라이선스

MIT
