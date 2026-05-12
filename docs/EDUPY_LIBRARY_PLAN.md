# EduPy 라이브러리 + 웹 통합 구현 계획

> 초등 5·6학년 대상 교육용 파이썬 게임 라이브러리 `edupy` 와, 그것을 소비하는 웹 학습 플랫폼의 통합 설계 문서.

## 1. 핵심 결정 요약

| 항목 | 결정 | 이유 |
| --- | --- | --- |
| 라이브러리 vs 웹 통합 | **라이브러리 우선 (library-first).** `edupy` 를 독립 pip 패키지로 먼저 만들고, 웹은 그것을 *소비*만 한다 (재구현 금지). | 단일 진실 공급원. 선생님은 노트북(Thonny/Mu/IDLE)에서 그대로 쓰고, 웹은 같은 코드를 브라우저에서 실행. API 가 React/FastAPI 코드와 엉키지 않아 테스트 가능. |
| 저장소 구조 | **모노레포.** `packages/edupy/` 안에 패키지, `frontend/` `backend/` 는 그대로. PyPI 에는 `packages/edupy` 만 배포. | 1인 개발 기준 별도 저장소는 버전 동기화·CI 중복 비용만 늘어남. 모노레포면 깨끗한 패키지 경계 + 독립 릴리스를 둘 다 얻음. |
| 학생 실행 환경 | **보급형 크롬북(≈4GB RAM) + 크롬 브라우저.** → 학생 쪽은 100% 브라우저 실행. 파이썬 설치 불가 전제. | 학교 관리정책상 설치 불가. 4GB 기준이므로 메모리·콜드스타트 절약이 1순위 제약. |
| 웹 실행 방식 | **Pyodide(파이썬 WASM) + 직접 만든 가벼운 JS Canvas 렌더러.** pygame-WASM(pygbag)은 안 싣고 Pyodide 코어만. numpy 등 무거운 패키지 금지(= `edupy` 의존성 0개 유지). | 보급형 크롬북에서 번들 작고 콜드스타트 짧음. 렌더링은 네이티브 JS Canvas 라 빠름. |
| 서버사이드 실행 | 기존 `backend/pygame_runner.py` (headless → PNG 캡처) 는 **폴백·녹화용으로만 유지** (당분간 기존 비-edupy 레슨용). | 지금 방식은 상호작용이 안 됨(60프레임 캡처). 브라우저 실행이 기능 업그레이드이기도 함. |
| 렌더링 추상화 | `edupy` 는 백엔드 교체 가능: `backend="pygame"` (데스크톱, **raw-pygame 래퍼** — pgzero 위에 얹지 않음) / `backend="web"` (Pyodide↔Canvas). 학생 코드는 어디서나 동일. | 통제력·디버깅 용이성 우선. pgzero 의 암시적 전역/전용 러너 의존을 피함. |
| 콘텐츠(커리큘럼·스니펫) | `content/` 또는 패키지 내 데이터(JSON)로 분리 → 웹 UI·문서 사이트·라이브러리가 공유. | 지금 `frontend/src/data/*.ts` 에 흩어져 있음. |

## 2. 디렉터리 구조 (목표)

```
edupy/                          # 모노레포 루트 (이미 "EduPy 플랫폼")
├── packages/
│   └── edupy/                   # ← pip 패키지 (PyPI 배포 대상)
│       ├── pyproject.toml
│       ├── README.md
│       └── edupy/
│           ├── __init__.py      # 공개 API (한글 + 영문 별칭)
│           ├── _runtime.py      # _App 싱글턴, 게임 루프, 콜백 자동 발견
│           ├── _sprite.py       # Sprite(=캐릭터)
│           ├── colors.py        # 색 이름표 (한글 + 영문 + HEX)
│           ├── keys.py          # 키 이름 정규화
│           ├── errors.py        # 한글 친절 에러 (excepthook + translate)
│           ├── snippets/        # 코드 스니펫 = 데이터(JSON)
│           ├── assets/          # 동봉 에셋 (캐릭터/배경/효과음)
│           └── backends/
│               ├── base.py      # Backend ABC
│               ├── pygame_backend.py
│               └── web_backend.py   # Pyodide ↔ JS Canvas 브리지
├── content/                     # (예정) 커리큘럼·레슨 정의 — 셋이 공유
├── frontend/                    # 크롬북에서 도는 웹에디터
│   └── src/pyodide/             # Pyodide 로더 + Canvas 호스트
│   └── src/pages/EduPyPlayground.tsx
├── backend/                     # 콘텐츠 API + (폴백) 서버 실행/녹화
└── docs/EDUPY_LIBRARY_PLAN.md   # 이 문서
```

> **이름 충돌 주의:** 저장소 자체가 "EduPy(통합 학습 플랫폼)" 이고 새 라이브러리도 `edupy`. 호칭을 "EduPy **플랫폼**" vs `edupy` **라이브러리** 로 명확히 구분할 것. 배포 전 PyPI 에 `edupy` 이름이 비어있는지 확인 — 선점돼 있으면 `edupy-edu` 등 대안.

## 3. 공개 API (v0.1 — 의도적으로 작게 유지)

함수는 **한글 이름이 정식, 영문은 별칭** (텍스트 코딩으로 가는 사다리). 공개 표면을 작고 안정적으로 유지하고 나머지는 `_` prefix 로 숨긴다.

```python
import edupy

edupy.창만들기(가로=800, 세로=600, 제목="내 게임")   # = create_window / start
edupy.배경색("하늘색")                                  # = background

# --- 그리기 (그리기() 콜백 안에서 호출) ---
edupy.화면_지우기("흰색")                                # = clear
edupy.사각형(x, y, 가로, 세로, 색="빨강")                # = rect
edupy.원(x, y, 반지름, 색="파랑")                        # = circle
edupy.선(x1, y1, x2, y2, 색="검정", 굵기=2)             # = line
edupy.글자("점수: 10", x=20, y=20, 크기=24, 색="검정")  # = text
edupy.그림("강아지", x, y)                               # = image

# --- 입력 ---
edupy.키눌림("왼쪽")        # = is_key_pressed   키: 왼쪽/오른쪽/위/아래/스페이스/엔터/a~z/0~9
edupy.마우스_위치()         # = mouse_pos        -> (x, y)
edupy.마우스_눌림()         # = is_mouse_pressed

# --- 실행 제어 ---
edupy.실행()                # = run    (그리기/업데이트/시작 콜백을 자동 발견하여 루프 시작)
edupy.멈춤()                # = stop

# --- 캐릭터(Sprite) ---
강아지 = edupy.캐릭터_생성("강아지", x=100, y=100)   # = create_sprite
강아지.x, 강아지.y
강아지.이동(dx, dy)          # = move
강아지.오른쪽으로(10) / .왼쪽으로(10) / .위로(10) / .아래로(10)
강아지.그리기()              # = draw
강아지.충돌(다른캐릭터)       # = collides_with  -> bool
강아지.화면안에_가두기()      # = clamp_to_screen
```

사용자가 정의하면 자동 호출되는 콜백 (Pygame Zero 스타일):
- `def 시작():` / `def setup():` — 1회 (창 생성 직후)
- `def 업데이트(dt):` / `def update(dt):` — 매 프레임 (상태 갱신)
- `def 그리기():` / `def draw():` — 매 프레임 (화면 그리기)

### 친절한 한글 에러

`edupy` 를 import 하면 `sys.excepthook` 을 설치하여 흔한 예외를 초등학생용 메시지로 번역:
- `SyntaxError: ...` → "괄호 `(` `)` 나 따옴표 `" "` 를 빠뜨리지 않았는지 확인해 보세요. (○○줄 근처)"
- `NameError: name 'x' is not defined` → "`x` 라는 이름을 아직 만들지 않았어요. 철자가 맞는지, `x = ...` 로 먼저 정해줬는지 확인해 보세요."
- `IndentationError` → "들여쓰기(앞 공백)가 맞지 않아요. 같은 묶음은 같은 칸 수만큼 띄워야 해요."
- `TypeError: ... takes ... arguments` → "함수에 넣어준 값의 개수가 맞지 않아요."
- `FileNotFoundError` (그림 등) → "`○○` 그림 파일을 찾지 못했어요. 이름의 철자와 파일이 같은 폴더에 있는지 확인해 보세요."

`edupy.errors.번역(예외)` / `translate(exc)` 로 웹에디터 출력 패널에서도 같은 번역을 재사용한다.

## 4. 웹 실행 아키텍처 (Pyodide ↔ JS Canvas)

핵심: **브라우저에서는 `while True:` 같은 블로킹 루프를 돌릴 수 없다.** 그래서:

1. JS 호스트(`canvasHost`)가 `<canvas>`, 키/마우스 입력, `requestAnimationFrame` 루프를 소유한다. `globalThis.__edupy_host__` 로 노출.
2. Pyodide 가 `edupy` 패키지 소스를 가상 FS 에 올린다 (`import.meta.glob('?raw')` 로 `packages/edupy/edupy/**` 를 통째로 → 빌드 단계 불필요, 단일 소스).
3. `edupy/backends/web_backend.py` 는 `from js import __edupy_host__` 로 호스트를 얻는다. 그리기 명령은 `__edupy_host__.draw_rect(...)` 식으로 호스트에 위임.
4. `edupy.실행()` (web): 호출한 프레임의 globals 에서 `그리기/업데이트/시작` 콜백을 찾아 `step(dt)` 클로저를 만들고, `create_proxy` 로 감싸 `__edupy_host__.startLoop(step)` 에 넘기고 **즉시 반환**한다. 이후 매 프레임 JS 가 `step(dt)` 를 호출 → 그 안에서 `업데이트(dt)` → `그리기()`.
5. 예외는 JS 가 잡아 `edupy.errors.번역()` 을 거쳐 출력 패널에 한글로 표시.

데스크톱(`pygame_backend.py`)에서는 `실행()` 이 고전적인 `while running:` 루프를 직접 돈다. 학생 코드는 동일.

### 보급형 크롬북(≈4GB RAM) 대비 — 1순위 제약
- "▶ 실행" 첫 클릭 때 Pyodide lazy-load + 로딩 표시 (초기 진입 즉시 로드 X). 이미 PoC 에 반영됨.
- **Service Worker 로 Pyodide 런타임 + `edupy` 소스 캐시 → 재방문 시 즉석 시작. (Phase 1 로 앞당김 — 4GB 기기에서 매번 ~수~십 초 콜드스타트는 치명적)**
- `edupy` 패키지를 작게 유지; **numpy 등 무거운 패키지 절대 금지** (의존성 0개). 에셋은 필요할 때만 lazy-load.
- 첫 진입 시 `navigator.deviceMemory` / `hardwareConcurrency` 가 낮으면 "이 기기에서는 처음 실행이 조금 느릴 수 있어요" 안내 표시.
- Pyodide 인스턴스는 페이지당 1개만(싱글턴 — 이미 그렇게 구현됨). 탭/페이지 이동 시 재로딩 안 되게 모듈 레벨 캐시 유지.
- (Phase 3) PWA 화 → 와이파이 끊겨도 학습 계속.
- Pyodide 버전은 `frontend/package.json` 의 `pyodide` 와 CDN `indexURL` 을 항상 일치시킬 것 (현재 `0.29.0`).

## 5. 단계별 로드맵

### Phase 0 — 스캐폴드 (이 PR) ✅
- [x] `docs/EDUPY_LIBRARY_PLAN.md` (이 문서)
- [x] `packages/edupy/` 패키지: 공개 API, `backends/{base,pygame,web}`, `errors`, `colors`, `keys`, `snippets`(JSON 3개), `assets`, `pyproject.toml`, smoke 테스트
- [x] 프론트엔드 PoC: `frontend/src/pyodide/` (Pyodide 로더 + Canvas 호스트), `frontend/src/pages/EduPyPlayground.tsx`, 라우트 `/edupy`, `vite.config.ts` 에 `server.fs.allow` 추가
- [x] 동작 기준: `/edupy` 페이지에서 예제 코드(움직이는 사각형 + 키 입력)가 브라우저에서 실시간 실행됨

### Phase 1 — 라이브러리 안정화 (2~3주)
- [ ] 데스크톱 pygame 백엔드(**raw-pygame 래퍼 확정**) 실동작 검증 (Windows/Mac/Linux), `pygame-ce>=2.4`
- [ ] **Service Worker 캐싱 + 보급형 크롬북(≈4GB) 실측** (콜드스타트·메모리), `deviceMemory` 낮을 때 안내 — 최우선
- [ ] `Sprite` 확장: 회전, 크기, 이미지 애니메이션(스프라이트 시트), 그룹/충돌 그룹
- [ ] 사운드: `소리_재생("효과음")`, `배경음악(...)` (web: WebAudio, desktop: pygame.mixer)
- [ ] 텍스트/한글 폰트 동봉 (Nanum 등, 라이선스 확인) — 데스크톱·웹 동일 렌더
- [ ] 에러 번역 사전 30+ 케이스, 줄번호 정확도 개선
- [ ] `pytest` 커버리지, GitHub Actions 로 PyPI 자동 배포(태그 푸시 시)
- [ ] `edupy` PyPI 이름 확보 및 0.1.0 배포

### Phase 2 — 웹에디터 통합 (2~3주)
- [ ] `EduPyPlayground` → 정식 페이지로 승격: Monaco 통합, 파일 저장(LocalStorage), 콘솔/에러 패널, 정지/리셋, 캔버스 전체화면
- [ ] 스니펫 패널: `edupy.snippets` 데이터를 드래그-삽입 가능한 카드로 렌더
- [ ] 에셋 브라우저: 동봉 캐릭터/배경 미리보기 → 클릭하면 `edupy.그림("...")` 코드 삽입
- [ ] 기존 `pygameCurriculum.ts` / `pygameGamesCurriculum.ts` 의 레슨을 `edupy` API 로 리라이트 (서버 PNG 캡처 → 브라우저 실행으로 전환)
- [ ] Service Worker 캐싱, 저사양 기기 성능 측정 및 튜닝

### Phase 3 — 콘텐츠 & "내 게임 publish" (2~4주)
- [ ] `content/` 로 커리큘럼·스니펫 데이터 통합 (frontend/backend/docs 공유)
- [ ] "빈칸 채우기" 템플릿 시스템 (레슨에 `___` 자리표시자 + 정답 코드)
- [ ] "내 게임 → 웹으로 공유" : 학생 프로젝트를 정적 페이지로 export (선택: pygbag 경로 별도)
- [ ] 갤러리(읽기 전용) — 다른 학생 게임 플레이/포크
- [ ] 문서 사이트: 동일 스니펫 데이터로 복붙 카드 + API 레퍼런스 자동 생성

## 6. 확정된 결정 / 남은 확인 사항

확정 (2026-05):
- **타깃 = 보급형 크롬북(≈4GB RAM)** → Pyodide-only(클라이언트 실행)로 가되, 메모리·콜드스타트 절약이 1순위. 서버사이드 실행은 기존 비-edupy 레슨용 폴백으로만 한동안 유지.
- **데스크톱 백엔드 = raw-pygame 래퍼** (`pygame-ce`). Pygame Zero 위에 얹지 않음 — 통제력·디버깅 용이성 우선.

남은 확인:
- 폰트/에셋 라이선스 (상업적 재배포 가능 여부) 사전 점검.
- `edupy` PyPI 이름 가용성 확인 (선점 시 `edupy-edu` 등 대안).
- 보급형 크롬북 실측 후, 콜드스타트가 견딜 만한지 / 일부 무거운 레슨은 서버 폴백을 유지할지 재판단.

## 7. 다음 작업 후보 (이어서 진행할 때 여기서 고르기)

**현재 상태 (2026-05-13):** Phase 0 완료 — `docs/EDUPY_LIBRARY_PLAN.md`, `packages/edupy/`(라이브러리, CPython 에서 가짜 호스트로 end-to-end 시뮬레이션 검증), `frontend/src/pyodide/` + `frontend/src/pages/EduPyPlayground.tsx`(라우트 `/edupy`), `frontend/vite.config.ts`(`server.fs.allow:['..']`), `frontend/public/edupy-assets/turtle.png`. **아직 커밋 안 함.** 프론트엔드는 이 환경에 `node_modules` 가 없어 실제 `npm run dev` / `tsc -b` 미검증 — `cd frontend && npm install && npm run dev` → `/edupy` 에서 한 번 돌려봐야 함.

후보 (우선순위 순):
1. **(최우선) 보급형 크롬북 실측 + Service Worker 캐싱.** 실제로 쓸 만한지 가장 먼저 확인. `frontend/src/pyodide/edupyRuntime.ts` 에 SW 등록 추가, Pyodide 런타임 + edupy 소스 캐시. `navigator.deviceMemory` 낮을 때 안내. 콜드스타트/메모리 측정.
2. **기존 pygame 레슨 1~2개를 `edupy` API 로 리라이트** → `/edupy` 에서 브라우저 실행 (서버 PNG 캡처 대체 검증). 대상: `frontend/src/data/pygameCurriculum.ts` 의 앞쪽 레슨.
3. **스니펫 패널 + 에셋 브라우저 UI.** `edupy.snippets.목록()` 데이터를 드래그-삽입 카드로 (`EduPyPlayground` 에 사이드 패널). 동봉 에셋 미리보기 → 클릭 시 `edupy.그림("...")` 삽입.
4. **Monaco 에디터로 교체** (`@monaco-editor/react` 이미 dep). 현재 `<textarea>` → Monaco, 파이썬 문법 하이라이트 + LocalStorage 자동 저장.
5. **`pytest` + GitHub Actions** — `packages/edupy/tests/` 실행, 태그 푸시 시 PyPI 자동 배포 워크플로.
6. **데스크톱 백엔드 실동작 검증** — `pip install -e "packages/edupy[desktop]"` 후 README 예제를 실제 pygame 창에서 구동, 한글 폰트/입력 확인.

이어서 진행 지시 예시: "EduPy 1번 진행해줘" / "EduPy 다음 단계 진행해줘".
