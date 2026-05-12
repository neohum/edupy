/**
 * CanvasHost — `edupy` 라이브러리(web 백엔드)가 호출하는 JS 쪽 호스트.
 *
 * 브라우저에서는 `while True:` 같은 블로킹 루프를 돌릴 수 없으므로, 이 호스트가
 * <canvas> · 키/마우스 입력 · requestAnimationFrame 루프를 소유한다.
 * 파이썬(edupy/backends/web_backend.py)은 매 프레임 호출되는 콜백과 그리기 명령만 넘긴다.
 *
 * `globalThis.edupyHost` 로 노출되어 Pyodide 의 `from js import` 로 잡힌다.
 */

type PyStepProxy = ((dt: number) => void) & { destroy?: () => void };

// 동봉 에셋 이름 -> URL (파이썬 쪽 edupy/assets/__init__.py 의 별칭과 맞춤)
const ASSET_BASE = "/edupy-assets/";
const IMAGE_URLS: Record<string, string> = {
  turtle: ASSET_BASE + "turtle.png",
  거북이: ASSET_BASE + "turtle.png",
};

// 브라우저 KeyboardEvent.key -> edupy 표준 키 이름
function toStdKey(e: KeyboardEvent): string | null {
  switch (e.key) {
    case "ArrowLeft": return "left";
    case "ArrowRight": return "right";
    case "ArrowUp": return "up";
    case "ArrowDown": return "down";
    case " ": return "space";
    case "Spacebar": return "space";
    case "Enter": return "enter";
    case "Escape": return "escape";
    case "Shift": return "shift";
    case "Tab": return "tab";
    case "Backspace": return "backspace";
  }
  if (e.key.length === 1) {
    const c = e.key.toLowerCase();
    if (/[a-z0-9]/.test(c)) return c;
  }
  return null;
}

const GAME_KEYS = new Set(["left", "right", "up", "down", "space"]);

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
}

export interface CanvasHostOptions {
  /** 게임 루프 중 파이썬 예외가 났을 때 (이미 한글로 번역된 메시지). */
  onError?: (message: string) => void;
  /** print() 등 표준출력. */
  onPrint?: (text: string) => void;
}

export class CanvasHost {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: CanvasHostOptions;

  private step: PyStepProxy | null = null;
  private rafId = 0;
  private lastTime = 0;
  private running = false;

  private pressedKeys = new Set<string>();
  private mouseX = 0;
  private mouseY = 0;
  private mouseDown = false;

  private images = new Map<string, HTMLImageElement>(); // 로드 완료된 것
  private imageLoading = new Set<string>();

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseDown: () => void;
  private boundMouseUp: () => void;
  private boundBlur: () => void;

  constructor(canvas: HTMLCanvasElement, opts: CanvasHostOptions = {}) {
    this.canvas = canvas;
    this.opts = opts;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D 캔버스 컨텍스트를 만들 수 없어요.");
    this.ctx = ctx;

    this.boundKeyDown = (e) => {
      if (isEditableTarget(e.target)) return; // 에디터에 타이핑 중이면 게임에 영향 X
      const k = toStdKey(e);
      if (k) {
        this.pressedKeys.add(k);
        if (this.running && GAME_KEYS.has(k)) e.preventDefault();
      }
    };
    this.boundKeyUp = (e) => {
      const k = toStdKey(e);
      if (k) this.pressedKeys.delete(k);
    };
    this.boundMouseMove = (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouseX = ((e.clientX - r.left) * this.canvas.width) / r.width;
      this.mouseY = ((e.clientY - r.top) * this.canvas.height) / r.height;
    };
    this.boundMouseDown = () => { this.mouseDown = true; };
    this.boundMouseUp = () => { this.mouseDown = false; };
    this.boundBlur = () => { this.pressedKeys.clear(); this.mouseDown = false; };

    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
    window.addEventListener("blur", this.boundBlur);
  }

  /** 리스너 해제 + 루프 정지. 새 코드를 실행하기 전에 호출한다. */
  dispose() {
    this.stopLoop();
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mouseup", this.boundMouseUp);
    window.removeEventListener("blur", this.boundBlur);
  }

  // ============================ 파이썬이 호출하는 API ============================

  createWindow(width: number, height: number, _title: string) {
    this.canvas.width = Math.max(1, Math.floor(width));
    this.canvas.height = Math.max(1, Math.floor(height));
    this.clear("rgb(255, 255, 255)");
  }

  startLoop(step: PyStepProxy, fps: number) {
    this.stopLoop(); // 혹시 이전 루프가 남아 있으면
    this.step = step;
    this.running = true;
    this.lastTime = performance.now();
    const minDt = fps > 0 ? 1 / fps : 1 / 60;
    const frame = (now: number) => {
      if (!this.running) return;
      let dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (!isFinite(dt) || dt < 0) dt = minDt;
      if (dt > 0.1) dt = 0.1; // 탭 비활성 등으로 큰 점프 방지
      try {
        this.step?.(dt);
      } catch (e: any) {
        // web_backend 가 보통 reportError 로 먼저 잡지만, 만약을 위해.
        this.running = false;
        this.opts.onError?.(this.errToText(e));
        return;
      }
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }

  stopLoop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    if (this.step && typeof this.step.destroy === "function") {
      try { this.step.destroy(); } catch { /* noop */ }
    }
    this.step = null;
  }

  /** edupy 의 web 백엔드가 게임 루프 중 예외를 한글로 번역해서 넘겨준다. */
  reportError(message: string) {
    this.running = false;
    this.opts.onError?.(message || "알 수 없는 오류가 났어요.");
  }

  // ---- 그리기 ----
  clear(cssColor: string) {
    this.ctx.fillStyle = cssColor || "rgb(255, 255, 255)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawRect(x: number, y: number, w: number, h: number, cssColor: string, filled: boolean, lineWidth: number) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    if (filled) {
      this.ctx.fillStyle = cssColor;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = cssColor;
      this.ctx.lineWidth = lineWidth || 2;
      this.ctx.stroke();
    }
  }

  drawCircle(x: number, y: number, r: number, cssColor: string, filled: boolean, lineWidth: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    if (filled) {
      this.ctx.fillStyle = cssColor;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = cssColor;
      this.ctx.lineWidth = lineWidth || 2;
      this.ctx.stroke();
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, cssColor: string, width: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = cssColor;
    this.ctx.lineWidth = width || 2;
    this.ctx.stroke();
  }

  drawText(text: string, x: number, y: number, size: number, cssColor: string) {
    this.ctx.fillStyle = cssColor;
    this.ctx.font = `${Math.max(6, size)}px "Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif`;
    this.ctx.textBaseline = "top";
    this.ctx.fillText(String(text), x, y);
  }

  drawImage(name: string, x: number, y: number, w: number | null, h: number | null, angle: number) {
    const img = this.getImage(name);
    if (!img) {
      // 아직 로딩 중이거나 없는 이름 -> 자리표시자 네모
      const pw = w ?? 40, ph = h ?? 40;
      this.ctx.fillStyle = "rgba(150,150,150,0.5)";
      this.ctx.fillRect(x - pw / 2, y - ph / 2, pw, ph);
      return;
    }
    const dw = w ?? img.naturalWidth ?? 40;
    const dh = h ?? img.naturalHeight ?? 40;
    if (angle) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate((angle * Math.PI) / 180);
      this.ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
    }
  }

  measureImage(name: string): [number, number] {
    const img = this.getImage(name);
    return img ? [img.naturalWidth || 0, img.naturalHeight || 0] : [0, 0];
  }

  playSound(_name: string) {
    // PoC: 아직 미구현 (Phase 1 에서 WebAudio 로).
  }

  // ---- 입력 ----
  isKeyPressed(stdKey: string): boolean {
    return this.pressedKeys.has(stdKey);
  }
  mousePos(): [number, number] {
    return [Math.round(this.mouseX), Math.round(this.mouseY)];
  }
  isMousePressed(): boolean {
    return this.mouseDown;
  }

  // ============================ 내부 ============================

  private getImage(name: string): HTMLImageElement | null {
    const loaded = this.images.get(name);
    if (loaded) return loaded;
    const url = IMAGE_URLS[name] ?? (/[./]/.test(name) ? name : null);
    if (!url) return null;
    if (!this.imageLoading.has(name)) {
      this.imageLoading.add(name);
      const img = new Image();
      img.onload = () => { this.images.set(name, img); };
      img.onerror = () => { this.imageLoading.delete(name); };
      img.src = url;
    }
    return null;
  }

  private errToText(e: any): string {
    if (!e) return "알 수 없는 오류";
    return String(e.message ?? e);
  }
}
