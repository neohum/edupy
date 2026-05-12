/**
 * edupyRuntime — 브라우저에서 `edupy` 파이썬 라이브러리를 띄우고 학생 코드를 실행한다.
 *
 *  1) Pyodide(파이썬 WASM)를 CDN 에서 로드 (저사양 크롬북 대비: 첫 실행 때만, lazy).
 *  2) 모노레포의 `packages/edupy/edupy/**` 소스를 Pyodide 가상 FS 에 올린다 → 빌드 단계 불필요, 단일 소스.
 *  3) JS CanvasHost 를 만들어 `globalThis.edupyHost` 로 노출 (edupy 의 web 백엔드가 잡음).
 *  4) 학생 코드를 새 네임스페이스에서 실행. 예외는 `edupy.errors.번역()` 으로 한글화.
 */
import type { PyodideInterface } from "pyodide";
import { CanvasHost, type CanvasHostOptions } from "./canvasHost";

// 반드시 frontend/package.json 의 "pyodide" 버전과 맞출 것.
const PYODIDE_VERSION = "0.29.0";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const EDUPY_MOUNT = "/lib/edupy_src";

// 모노레포의 edupy 패키지 소스를 전부 텍스트로 가져온다 (빌드 시 인라인됨).
// (frontend/vite.config.ts 의 server.fs.allow 에 ".." 가 있어야 dev 에서도 동작)
const EDUPY_SOURCES = import.meta.glob(
  "../../../packages/edupy/edupy/**/*.{py,json}",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

declare global {
  // eslint-disable-next-line no-var
  var loadPyodide: ((opts: { indexURL: string }) => Promise<PyodideInterface>) | undefined;
  // eslint-disable-next-line no-var
  var edupyHost: CanvasHost | undefined;
}

let scriptPromise: Promise<void> | null = null;
function loadPyodideScript(): Promise<void> {
  if (globalThis.loadPyodide) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `${PYODIDE_CDN}pyodide.js`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Pyodide 스크립트를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function mapToFsPath(globKey: string): string {
  // ".../packages/edupy/edupy/backends/web_backend.py" -> "edupy/backends/web_backend.py"
  const marker = "packages/edupy/edupy/";
  const i = globKey.indexOf(marker);
  const rel = i >= 0 ? globKey.slice(i + marker.length) : globKey.replace(/^.*?edupy\//, "");
  return `edupy/${rel}`;
}

function mountEdupy(py: PyodideInterface) {
  py.FS.mkdirTree(EDUPY_MOUNT);
  for (const [globKey, content] of Object.entries(EDUPY_SOURCES)) {
    const full = `${EDUPY_MOUNT}/${mapToFsPath(globKey)}`;
    const dir = full.slice(0, full.lastIndexOf("/"));
    py.FS.mkdirTree(dir);
    py.FS.writeFile(full, content);
  }
  py.runPython(`import sys\nif ${JSON.stringify(EDUPY_MOUNT)} not in sys.path:\n    sys.path.insert(0, ${JSON.stringify(EDUPY_MOUNT)})\nimport edupy  # noqa`);
}

let pyodidePromise: Promise<PyodideInterface> | null = null;
export function getPyodide(): Promise<PyodideInterface> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    await loadPyodideScript();
    const py = await globalThis.loadPyodide!({ indexURL: PYODIDE_CDN });
    mountEdupy(py);
    // 학생 코드를 한 번 감싸 실행하면서 예외를 한글로 번역하는 헬퍼.
    py.runPython(`
import sys, traceback
import edupy.errors as _eerr

def __edupy_run_user_code__(code, ns):
    try:
        compiled = compile(code, "<내 코드>", "exec")
        exec(compiled, ns)
        return None
    except BaseException as ex:  # noqa: BLE001
        sys.last_type, sys.last_value, sys.last_traceback = type(ex), ex, ex.__traceback__
        return _eerr.번역(ex)
`);
    return py;
  })();
  return pyodidePromise;
}

export interface RunOptions {
  onPrint?: (text: string) => void;
  onError?: (message: string) => void;
}

/** 현재 살아있는 호스트 (재실행 시 정리용). */
let currentHost: CanvasHost | null = null;

/**
 * 학생 코드를 실행한다.
 * @returns 즉시 끝나는 코드면 끝났을 때, `edupy.실행()` 으로 게임 루프가 도는 코드면
 *          루프 등록 직후 resolve 된다 (이후는 CanvasHost 의 rAF 가 구동).
 */
export async function runEduPyCode(
  code: string,
  canvas: HTMLCanvasElement,
  opts: RunOptions = {},
): Promise<{ ok: boolean; error?: string }> {
  const py = await getPyodide();

  // 1) 이전 실행 정리
  if (currentHost) {
    currentHost.dispose();
    currentHost = null;
  }
  try {
    py.runPython("import edupy\nedupy.멈춤()");
  } catch { /* 첫 실행이면 _app 이 없으니 무시 */ }

  // 2) 새 호스트
  const hostOpts: CanvasHostOptions = {
    onError: opts.onError,
    onPrint: opts.onPrint,
  };
  const host = new CanvasHost(canvas, hostOpts);
  globalThis.edupyHost = host;
  currentHost = host;

  // 3) 표준출력/표준에러 캡처
  if (opts.onPrint) {
    py.setStdout({ batched: (s: string) => opts.onPrint!(s) });
    py.setStderr({ batched: (s: string) => opts.onPrint!(s) });
  }

  // 4) 새 네임스페이스에서 학생 코드 실행 (재실행 시 이전 변수/함수가 안 남게)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ns = py.runPython("dict(__name__='__main__')") as any;
  let friendly: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runner = (py.globals as any).get("__edupy_run_user_code__");
    friendly = (runner(code, ns) as string | null) ?? null;
    runner?.destroy?.();
  } finally {
    ns?.destroy?.();
  }

  if (friendly) {
    opts.onError?.(friendly);
    return { ok: false, error: friendly };
  }
  return { ok: true };
}

/** 현재 실행을 멈춘다 (정지 버튼). */
export function stopEduPy() {
  if (currentHost) {
    currentHost.dispose();
    currentHost = null;
  }
  if (pyodidePromise) {
    pyodidePromise.then((py) => {
      try { py.runPython("import edupy\nedupy.멈춤()"); } catch { /* noop */ }
    });
  }
}
