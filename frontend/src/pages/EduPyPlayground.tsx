/**
 * EduPyPlayground — `edupy` 라이브러리 PoC 페이지.
 *
 * 왼쪽: 코드 에디터(PoC 단계에서는 <textarea>; 추후 Monaco 로 교체).
 * 오른쪽: <canvas> 게임 화면 + 출력/에러 패널.
 * "▶ 실행" 을 누르면 그때 Pyodide(파이썬 WASM)를 로드(첫 1회)하고 브라우저 안에서 코드를 실행한다.
 *
 * 라우트: /edupy
 */
import { useCallback, useRef, useState } from "react";
import Header from "../components/Header";
import { runEduPyCode, stopEduPy } from "../pyodide/edupyRuntime";
import "./EduPyPlayground.css";

const EXAMPLE_CODE = `import edupy
import random

# 1) 게임 창 만들기 (이 한 줄이면 준비 끝!)
edupy.창만들기(가로=640, 세로=400, 제목="내 첫 게임")

# 2) 움직일 캐릭터 만들기
주인공 = edupy.캐릭터_생성(x=320, y=200, 가로=40, 세로=40, 색="파랑", 모양="원")
점수 = 0
별 = edupy.캐릭터_생성(x=120, y=100, 가로=24, 세로=24, 색="노랑")

# 3) 매 순간 해야 할 일 (방향키로 움직이기)
def 업데이트(dt):
    global 점수
    if edupy.키눌림("왼쪽"):
        주인공.왼쪽으로(5)
    if edupy.키눌림("오른쪽"):
        주인공.오른쪽으로(5)
    if edupy.키눌림("위"):
        주인공.위로(5)
    if edupy.키눌림("아래"):
        주인공.아래로(5)
    주인공.화면안에_가두기()
    # 별에 닿으면 점수 +1, 별은 새 자리로
    if 주인공.충돌(별):
        점수 = 점수 + 1
        별.x = random.randint(20, edupy.화면_가로 - 20)
        별.y = random.randint(20, edupy.화면_세로 - 20)

# 4) 매 순간 화면 그리기
def 그리기():
    edupy.화면_지우기("하늘색")
    별.그리기()
    주인공.그리기()
    edupy.글자("방향키로 별을 먹어요!  점수: " + str(점수), x=16, y=16, 크기=22, 색="검정")

# 5) 시작!
edupy.실행()
`;

type LogLine = { kind: "out" | "err" | "info"; text: string };

export default function EduPyPlayground() {
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [log, setLog] = useState<LogLine[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const append = useCallback((kind: LogLine["kind"], text: string) => {
    const t = text.replace(/\n+$/, "");
    if (!t) return;
    setLog((prev) => [...prev.slice(-200), { kind, text: t }]);
  }, []);

  const handleRun = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLog([]);
    setStatus("loading");
    append("info", "파이썬(Pyodide)을 준비하고 있어요… (처음 한 번만 시간이 걸려요)");
    try {
      const result = await runEduPyCode(code, canvas, {
        onPrint: (s) => append("out", s),
        onError: (msg) => {
          append("err", msg);
          setStatus("error");
        },
      });
      if (result.ok) {
        setStatus("running");
        append("info", "실행 중! 게임 화면을 한 번 클릭한 뒤 방향키를 눌러 보세요.");
      } else {
        setStatus("error");
      }
    } catch (e: any) {
      append("err", String(e?.message ?? e));
      setStatus("error");
    }
  }, [code, append]);

  const handleStop = useCallback(() => {
    stopEduPy();
    setStatus("idle");
    append("info", "멈췄어요.");
  }, [append]);

  const handleReset = useCallback(() => {
    handleStop();
    setCode(EXAMPLE_CODE);
    setLog([]);
    setStatus("idle");
  }, [handleStop]);

  return (
    <div className="edupy-playground">
      <Header title="EduPy" />
      <div className="ep-bar">
        <h1 className="ep-title">🎮 EduPy 놀이터 <span className="ep-badge">PoC</span></h1>
        <div className="ep-actions">
          <button className="ep-btn ep-run" onClick={handleRun} disabled={status === "loading"}>
            {status === "loading" ? "준비 중…" : "▶ 실행"}
          </button>
          <button className="ep-btn" onClick={handleStop} disabled={status !== "running" && status !== "error"}>
            ■ 정지
          </button>
          <button className="ep-btn" onClick={handleReset}>↺ 처음으로</button>
          <span className={`ep-status ep-status-${status}`}>
            {status === "idle" && "대기"}
            {status === "loading" && "불러오는 중"}
            {status === "running" && "실행 중"}
            {status === "error" && "오류"}
          </span>
        </div>
      </div>

      <div className="ep-main">
        <section className="ep-editor-pane">
          <label className="ep-pane-label">코드</label>
          <textarea
            className="ep-editor"
            value={code}
            spellCheck={false}
            onChange={(e) => setCode(e.target.value)}
          />
        </section>

        <section className="ep-stage-pane">
          <label className="ep-pane-label">게임 화면 (클릭 후 키 입력)</label>
          <div className="ep-canvas-wrap">
            <canvas ref={canvasRef} className="ep-canvas" width={640} height={400} tabIndex={0} />
          </div>
          <label className="ep-pane-label">출력 / 메시지</label>
          <div className="ep-console">
            {log.length === 0 && <div className="ep-log-empty">아직 출력이 없어요. ▶ 실행을 눌러 보세요.</div>}
            {log.map((l, i) => (
              <div key={i} className={`ep-log ep-log-${l.kind}`}>{l.text}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
