"""
Pygame 코드를 HTML5 Canvas + JavaScript로 변환하는 모듈
"""

import re
from typing import Tuple


def convert_pygame_to_html(code: str, width: int = 800, height: int = 600) -> str:
    """
    Pygame 코드를 HTML5 Canvas 게임으로 변환

    Args:
        code: Pygame 파이썬 코드
        width: 캔버스 너비
        height: 캔버스 높이

    Returns:
        완전한 HTML 페이지 문자열
    """
    # 코드에서 화면 크기 추출 시도
    size_match = re.search(r'set_mode\s*\(\s*\((\d+)\s*,\s*(\d+)\)', code)
    if size_match:
        width = int(size_match.group(1))
        height = int(size_match.group(2))

    # WIDTH, HEIGHT 변수 추출
    width_match = re.search(r'WIDTH\s*[,=]\s*(\d+)', code)
    height_match = re.search(r'HEIGHT\s*[,=]\s*(\d+)', code)
    if width_match:
        width = int(width_match.group(1))
    if height_match:
        height = int(height_match.group(1))

    # Python 코드를 JavaScript로 변환
    js_code = convert_python_to_js(code)

    html = f'''<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduPy Game</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            background: #1a1a2e;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }}
        .game-header {{
            color: #fff;
            padding: 15px 30px;
            display: flex;
            align-items: center;
            gap: 15px;
            background: #16213e;
            border-radius: 10px 10px 0 0;
            width: {width}px;
        }}
        .game-title {{
            font-size: 18px;
            font-weight: 600;
        }}
        .fps-counter {{
            margin-left: auto;
            font-size: 14px;
            color: #4ade80;
        }}
        #gameCanvas {{
            border: 3px solid #16213e;
            background: #000;
            display: block;
        }}
        .controls-info {{
            color: #888;
            padding: 15px;
            font-size: 13px;
            background: #16213e;
            border-radius: 0 0 10px 10px;
            width: {width}px;
            text-align: center;
        }}
        kbd {{
            background: #333;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            margin: 0 3px;
        }}
    </style>
</head>
<body>
    <div class="game-header">
        <span class="game-title">🎮 EduPy Game</span>
        <span class="fps-counter" id="fpsCounter">0 FPS</span>
    </div>
    <canvas id="gameCanvas" width="{width}" height="{height}"></canvas>
    <div class="controls-info">
        <kbd>Arrow Keys</kbd> / <kbd>WASD</kbd> Move &nbsp;&nbsp;
        <kbd>Space</kbd> Action &nbsp;&nbsp;
        <kbd>ESC</kbd> Close
    </div>

    <script>
// Pygame-like JavaScript API
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 색상 상수 (사용자가 재정의 가능)
let BLACK = '#000000';
let WHITE = '#FFFFFF';
let RED = '#FF0000';
let GREEN = '#00FF00';
let BLUE = '#0000FF';
let YELLOW = '#FFFF00';
let CYAN = '#00FFFF';
let MAGENTA = '#FF00FF';
let ORANGE = '#FFA500';
let PURPLE = '#800080';
let PINK = '#FFC0CB';
let GRAY = '#808080';
let GREY = '#808080';

// RGB 색상 변환
function rgb(r, g, b) {{
    return `rgb(${{r}}, ${{g}}, ${{b}})`;
}}

// 키보드 상태
let keys = {{}};
const K_UP = 'ArrowUp';
const K_DOWN = 'ArrowDown';
const K_LEFT = 'ArrowLeft';
const K_RIGHT = 'ArrowRight';
const K_SPACE = 'Space';
const K_RETURN = 'Enter';
const K_ESCAPE = 'Escape';
const K_a = 'KeyA'; const K_b = 'KeyB'; const K_c = 'KeyC'; const K_d = 'KeyD';
const K_e = 'KeyE'; const K_f = 'KeyF'; const K_g = 'KeyG'; const K_h = 'KeyH';
const K_i = 'KeyI'; const K_j = 'KeyJ'; const K_k = 'KeyK'; const K_l = 'KeyL';
const K_m = 'KeyM'; const K_n = 'KeyN'; const K_o = 'KeyO'; const K_p = 'KeyP';
const K_q = 'KeyQ'; const K_r = 'KeyR'; const K_s = 'KeyS'; const K_t = 'KeyT';
const K_u = 'KeyU'; const K_v = 'KeyV'; const K_w = 'KeyW'; const K_x = 'KeyX';
const K_y = 'KeyY'; const K_z = 'KeyZ';

document.addEventListener('keydown', (e) => {{
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {{
        e.preventDefault();
    }}
    if (e.code === 'Escape') {{
        running = false;
        window.close();
    }}
}});

document.addEventListener('keyup', (e) => {{
    keys[e.code] = false;
}});

// Pygame-like draw functions
const draw = {{
    rect: function(surface, color, rect, width = 0) {{
        let x, y, w, h;
        if (rect instanceof Rect) {{
            x = rect.x; y = rect.y; w = rect.width; h = rect.height;
        }} else {{
            [x, y, w, h] = rect;
        }}
        if (width === 0) {{
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        }} else {{
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.strokeRect(x, y, w, h);
        }}
    }},
    circle: function(surface, color, center, radius, width = 0) {{
        const [x, y] = center;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (width === 0) {{
            ctx.fillStyle = color;
            ctx.fill();
        }} else {{
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }}
    }},
    line: function(surface, color, start, end, width = 1) {{
        const [x1, y1] = start;
        const [x2, y2] = end;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }},
    ellipse: function(surface, color, rect, width = 0) {{
        const [x, y, w, h] = rect;
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        if (width === 0) {{
            ctx.fillStyle = color;
            ctx.fill();
        }} else {{
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }}
    }},
    polygon: function(surface, color, points, width = 0) {{
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {{
            ctx.lineTo(points[i][0], points[i][1]);
        }}
        ctx.closePath();
        if (width === 0) {{
            ctx.fillStyle = color;
            ctx.fill();
        }} else {{
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }}
    }}
}};

// Screen fill
function fill(color) {{
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}}

// Key pressed check
function get_pressed() {{
    return keys;
}}

// Random functions
function randint(min, max) {{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}}

function choice(arr) {{
    return arr[Math.floor(Math.random() * arr.length)];
}}

// pygame.Rect 클래스
class Rect {{
    constructor(x, y, width, height) {{
        if (Array.isArray(x)) {{
            // Rect([x, y, w, h]) 형태
            [this.x, this.y, this.width, this.height] = x;
        }} else {{
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }}
    }}

    colliderect(other) {{
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }}

    get left() {{ return this.x; }}
    set left(v) {{ this.x = v; }}
    get right() {{ return this.x + this.width; }}
    set right(v) {{ this.x = v - this.width; }}
    get top() {{ return this.y; }}
    set top(v) {{ this.y = v; }}
    get bottom() {{ return this.y + this.height; }}
    set bottom(v) {{ this.y = v - this.height; }}
    get centerx() {{ return this.x + this.width / 2; }}
    get centery() {{ return this.y + this.height / 2; }}
}}

// pygame.font 모듈
const pygame_font = {{
    SysFont: function(name, size) {{
        return new Font(name, size);
    }}
}};
let font = pygame_font;  // 사용자 코드에서 재할당 가능

class Font {{
    constructor(name, size) {{
        this.name = name || 'Arial';
        this.size = size || 24;
    }}

    render(text, antialias, color) {{
        return new TextSurface(text, this.size, color);
    }}
}}

class TextSurface {{
    constructor(text, size, color) {{
        this.text = text;
        this.size = size;
        this.color = color;
    }}
}}

// screen.blit 함수
function blit(surface, pos) {{
    if (surface instanceof TextSurface) {{
        ctx.font = `${{surface.size}}px Arial`;
        ctx.fillStyle = surface.color;
        ctx.fillText(surface.text, pos[0], pos[1] + surface.size);
    }}
}}

// 화면 크기 상수
let WIDTH = {width};
let HEIGHT = {height};

// 기본 폰트 객체
let gameFont = font.SysFont(null, 40);

// 내장 함수
function max(...args) {{
    if (args.length === 1 && Array.isArray(args[0])) {{
        return Math.max(...args[0]);
    }}
    return Math.max(...args);
}}

function min(...args) {{
    if (args.length === 1 && Array.isArray(args[0])) {{
        return Math.min(...args[0]);
    }}
    return Math.min(...args);
}}

function abs(x) {{
    return Math.abs(x);
}}

function int(x) {{
    return Math.floor(x);
}}

function len(arr) {{
    return arr.length;
}}

// FPS tracking
let frameCount = 0;
let lastFpsUpdate = performance.now();
const fpsCounter = document.getElementById('fpsCounter');

function updateFPS() {{
    frameCount++;
    const now = performance.now();
    if (now - lastFpsUpdate >= 1000) {{
        fpsCounter.textContent = frameCount + ' FPS';
        frameCount = 0;
        lastFpsUpdate = now;
    }}
}}

// Game variables
let running = true;
const screen = {{ width: {width}, height: {height} }};

// User game code
{js_code}

// Game loop
const targetFPS = 60;
const frameTime = 1000 / targetFPS;
let lastFrameTime = performance.now();

function gameLoop() {{
    if (!running) return;

    const now = performance.now();
    const delta = now - lastFrameTime;

    if (delta >= frameTime) {{
        lastFrameTime = now - (delta % frameTime);

        try {{
            if (typeof update === 'function') {{
                update();
            }}
            updateFPS();
        }} catch (e) {{
            console.error('Game error:', e);
            running = false;
        }}
    }}

    requestAnimationFrame(gameLoop);
}}

// Start game
if (typeof init === 'function') {{
    init();
}}
gameLoop();
    </script>
</body>
</html>'''

    return html


def preprocess_code(code: str) -> str:
    """
    코드 전처리: main() 함수 평탄화, 불필요한 부분 제거
    """
    lines = code.split('\n')
    result = []
    in_main_func = False
    main_indent = 0

    for line in lines:
        stripped = line.strip()

        # def main(): 감지
        if re.match(r'def\s+main\s*\(\s*\)\s*:', stripped):
            in_main_func = True
            main_indent = len(line) - len(stripped) + 4
            continue

        # main() 호출 건너뛰기
        if stripped == 'main()':
            continue

        if in_main_func:
            current_indent = len(line) - len(line.lstrip()) if line.strip() else main_indent
            if line.strip() and current_indent < main_indent:
                in_main_func = False
                result.append(line)
            else:
                # 들여쓰기 제거
                if len(line) >= main_indent:
                    result.append(line[main_indent:])
                else:
                    result.append(line.lstrip())
        else:
            result.append(line)

    return '\n'.join(result)


def convert_multi_assign_inline(vars_str: str, vals_str: str) -> str:
    """다중 할당 변환 헬퍼"""
    vars_list = [v.strip() for v in vars_str.split(',')]
    vals_list = [v.strip() for v in vals_str.split(',')]
    if len(vars_list) == len(vals_list):
        result = []
        for v, val in zip(vars_list, vals_list):
            if v != '_':
                result.append(f'{v} = {val}')
        return '; '.join(result)
    return f'{vars_str} = {vals_str}'


def convert_python_to_js(code: str) -> str:
    """
    Python pygame 코드를 JavaScript로 변환
    """
    # 코드 전처리
    code = preprocess_code(code)

    # __name__ == "__main__" 체크 제거
    code = re.sub(r'if\s+__name__\s*==\s*["\']__main__["\']\s*:', '// main check removed', code)

    # string.ascii_uppercase 대체
    code = re.sub(r'string\.ascii_uppercase', '"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")', code)

    # 필터링 리스트 컴프리헨션: [x for x in list if cond] -> list.filter(x => cond)
    # 반드시 일반 리스트 컴프리헨션보다 먼저 처리해야 함
    def convert_filter_comp(match):
        expr = match.group(1)
        var = match.group(2)
        iterable = match.group(3)
        condition = match.group(4)
        # 조건 변환
        condition = condition.replace(' and ', ' && ')
        condition = condition.replace(' or ', ' || ')
        if expr == var:
            return f'{iterable}.filter(({var}) => {condition})'
        else:
            return f'{iterable}.filter(({var}) => {condition}).map(({var}) => {expr})'

    # 배열 인덱스(b[1])를 포함하는 조건 처리
    code = re.sub(r'\[(\w+)\s+for\s+(\w+)\s+in\s+(\w+)\s+if\s+((?:[^\[\]]|\[\d+\])+)\]', convert_filter_comp, code)

    # 리스트 컴프리헨션 변환: [expr for x in iterable] or [expr for x in range(n)]
    # [new_letter() for _ in range(3)] -> Array.from({length: 3}, () => new_letter())
    def convert_list_comp(match):
        expr = match.group(1)
        var = match.group(2)
        rest = match.group(3)
        # range(n) 패턴
        range_match = re.match(r'range\s*\(\s*(\d+)\s*\)', rest)
        if range_match:
            n = range_match.group(1)
            # _ 변수는 사용하지 않으므로 무시
            if var == '_':
                return f'Array.from({{length: {n}}}, () => {expr})'
            else:
                return f'Array.from({{length: {n}}}, (_, {var}) => {expr})'
        # 일반 이터러블
        return f'{rest}.map(({var}) => {expr})'

    code = re.sub(r'\[([^\[\]]+)\s+for\s+(\w+)\s+in\s+([^\]]+)\]', convert_list_comp, code)

    # 슬라이스 복사 [:] 제거 (for loop에서)
    code = re.sub(r'for\s+(\w+)\s+in\s+(\w+)\[:\]:', r'for \1 in \2:', code)

    # 다중 할당은 convert_line에서 처리 (let 선언 추적 필요)

    # 튜플 언패킹: a, b, c = list_item -> let [a, b, c] = list_item
    # 이건 convert_line에서 처리

    # 불필요한 import 및 초기화 제거
    lines = code.split('\n')
    skip_patterns = [
        r'^\s*import\s+',
        r'^\s*from\s+\w+\s+import',
        r'^\s*pygame\.init\(',
        r'^\s*pygame\.quit\(',
        r'^\s*screen\s*=\s*pygame\.display\.set_mode',
        r'^\s*clock\s*=\s*pygame\.time\.Clock',
        r'^\s*pygame\.display\.set_caption',
        r'^\s*pygame\.display\.flip\(',
        r'^\s*pygame\.display\.update\(',
        r'^\s*clock\.tick\(',
        r'^\s*sys\.exit\(',
        # 색상과 크기는 사용자가 재정의할 수 있도록 건너뛰지 않음
    ]

    in_event_loop = False
    event_loop_indent = 0
    in_main_loop = False
    main_loop_indent = 0
    main_loop_body = []
    setup_code = []

    for line in lines:
        # 빈 줄은 유지
        if not line.strip():
            if in_main_loop:
                main_loop_body.append('')
            else:
                setup_code.append('')
            continue

        # 건너뛸 패턴 체크
        skip = False
        for pattern in skip_patterns:
            if re.match(pattern, line):
                skip = True
                break

        if skip:
            continue

        # 이벤트 루프 처리 (pygame.event.get 루프 건너뛰기)
        if re.search(r'for\s+\w+\s+in\s+pygame\.event\.get', line):
            in_event_loop = True
            event_loop_indent = len(line) - len(line.lstrip())
            continue

        if in_event_loop:
            current_indent = len(line) - len(line.lstrip()) if line.strip() else event_loop_indent + 1
            if line.strip() and current_indent <= event_loop_indent:
                in_event_loop = False
            else:
                continue

        # pygame.QUIT 관련 줄 건너뛰기
        if 'pygame.QUIT' in line or 'running = False' in line.replace(' ', ''):
            continue

        # 메인 루프 감지 및 처리
        if re.match(r'\s*while\s+(running|True)\s*:', line):
            in_main_loop = True
            main_loop_indent = len(line) - len(line.lstrip())
            continue

        if in_main_loop:
            current_indent = len(line) - len(line.lstrip()) if line.strip() else main_loop_indent + 1
            if line.strip() and current_indent <= main_loop_indent:
                in_main_loop = False
                setup_code.append(line)
            else:
                # 들여쓰기 조정
                if len(line) > main_loop_indent + 4:
                    adjusted_line = line[main_loop_indent + 4:]
                else:
                    adjusted_line = line.lstrip()
                main_loop_body.append(adjusted_line)
        else:
            setup_code.append(line)

    # 템플릿에서 이미 선언된 변수들만 포함
    declared_vars = set([
        'screen', 'ctx', 'canvas', 'running', 'keys', 'draw', 'fill', 'get_pressed',
        'Rect', 'font', 'Font', 'blit', 'WIDTH', 'HEIGHT', 'randint', 'choice',
        'BLACK', 'WHITE', 'RED', 'GREEN', 'BLUE', 'YELLOW', 'CYAN', 'MAGENTA',
        'ORANGE', 'PURPLE', 'PINK', 'GRAY', 'GREY', 'rgb',
        'max', 'min', 'abs', 'int', 'len', 'gameFont', 'Math'
    ])

    def convert_line(line: str, indent_stack: list) -> tuple:
        """줄을 변환하고 들여쓰기 스택 업데이트"""
        if not line.strip():
            return '', indent_stack

        original_indent = len(line) - len(line.lstrip())
        stripped = line.strip()

        # 들여쓰기가 줄어들면 블록 닫기
        closing_braces = []
        while indent_stack and original_indent < indent_stack[-1]:
            indent_stack.pop()
            closing_braces.append(' ' * (len(indent_stack) * 4) + '}')

        result_prefix = '\n'.join(closing_braces) + '\n' if closing_braces else ''

        # pygame.draw 함수들
        stripped = re.sub(r'pygame\.draw\.rect\s*\(\s*screen\s*,', 'draw.rect(screen,', stripped)
        stripped = re.sub(r'pygame\.draw\.circle\s*\(\s*screen\s*,', 'draw.circle(screen,', stripped)
        stripped = re.sub(r'pygame\.draw\.line\s*\(\s*screen\s*,', 'draw.line(screen,', stripped)
        stripped = re.sub(r'pygame\.draw\.ellipse\s*\(\s*screen\s*,', 'draw.ellipse(screen,', stripped)
        stripped = re.sub(r'pygame\.draw\.polygon\s*\(\s*screen\s*,', 'draw.polygon(screen,', stripped)

        # screen.fill
        stripped = re.sub(r'screen\.fill\s*\(', 'fill(', stripped)

        # screen.blit
        stripped = re.sub(r'screen\.blit\s*\(', 'blit(', stripped)

        # pygame.Rect
        stripped = re.sub(r'pygame\.Rect\s*\(', 'new Rect(', stripped)

        # pygame.font.SysFont
        stripped = re.sub(r'pygame\.font\.SysFont\s*\(', 'font.SysFont(', stripped)

        # pygame.key.get_pressed
        stripped = re.sub(r'pygame\.key\.get_pressed\s*\(\s*\)', 'get_pressed()', stripped)

        # pygame 키 상수
        stripped = re.sub(r'pygame\.K_UP', 'K_UP', stripped)
        stripped = re.sub(r'pygame\.K_DOWN', 'K_DOWN', stripped)
        stripped = re.sub(r'pygame\.K_LEFT', 'K_LEFT', stripped)
        stripped = re.sub(r'pygame\.K_RIGHT', 'K_RIGHT', stripped)
        stripped = re.sub(r'pygame\.K_SPACE', 'K_SPACE', stripped)
        stripped = re.sub(r'pygame\.K_RETURN', 'K_RETURN', stripped)
        stripped = re.sub(r'pygame\.K_ESCAPE', 'K_ESCAPE', stripped)
        stripped = re.sub(r'pygame\.K_([a-z])', r'K_\1', stripped)

        # 색상 튜플을 rgb() 함수로 (3개 요소)
        # 색상 변수 정의 또는 draw, fill, render 등에서 사용
        # 색상 변수명 패턴: 대문자로 된 색상명 또는 color가 포함된 변수
        is_color_assignment = re.match(r'^[A-Z_]+\s*=\s*\(', stripped)
        is_color_usage = 'draw.' in stripped or 'fill(' in stripped or 'render(' in stripped or 'True,' in stripped or 'color' in stripped.lower()
        if is_color_assignment or is_color_usage:
            stripped = re.sub(r'\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)', r'rgb(\1, \2, \3)', stripped)

        # 정수 나눗셈 // -> Math.floor(/)
        stripped = re.sub(r'(\w+)\s*//\s*(\w+)', r'Math.floor(\1 / \2)', stripped)

        # 좌표/사각형 튜플을 배열로 변환 - draw 함수의 마지막 인자로 사용되는 경우만
        # Rect() 생성자는 괄호 유지, draw.rect의 rect 인자만 배열로 변환
        if 'draw.' in stripped:
            # 먼저 Rect 생성자 호출을 임시 토큰으로 대체하여 보호
            rect_pattern = re.compile(r'new Rect\([^)]+\)')
            rect_calls = rect_pattern.findall(stripped)
            for i, call in enumerate(rect_calls):
                stripped = stripped.replace(call, f'__RECT_CALL_{i}__')

            # draw.rect(screen, color, (x, y, w, h)) -> draw.rect(screen, color, [x, y, w, h])
            # 배열 인덱스(b[0]), 변수, 숫자 등 모든 표현식 지원
            # 4개 요소 (rect 좌표: x, y, width, height)
            stripped = re.sub(
                r',\s*\(([^,()]+)\s*,\s*([^,()]+)\s*,\s*([^,()]+)\s*,\s*([^,()]+)\)\s*\)',
                r', [\1, \2, \3, \4])',
                stripped
            )

            # Rect 생성자 호출 복원
            for i, call in enumerate(rect_calls):
                stripped = stripped.replace(f'__RECT_CALL_{i}__', call)

        # blit, circle의 2개 요소 좌표
        if 'blit(' in stripped or 'circle(' in stripped:
            # 2개 요소 (좌표: x, y)
            stripped = re.sub(r',\s*\((\w+)\s*,\s*(\w+)\)\)', r', [\1, \2])', stripped)
            stripped = re.sub(r',\s*\((\d+)\s*,\s*(\d+)\)\)', r', [\1, \2])', stripped)

        # random 함수
        stripped = re.sub(r'random\.randint\s*\(', 'randint(', stripped)
        stripped = re.sub(r'random\.choice\s*\(', 'choice(', stripped)

        # True/False/None
        stripped = re.sub(r'\bTrue\b', 'true', stripped)
        stripped = re.sub(r'\bFalse\b', 'false', stripped)
        stripped = re.sub(r'\bNone\b', 'null', stripped)

        # and/or/not
        stripped = re.sub(r'\band\b', '&&', stripped)
        stripped = re.sub(r'\bor\b', '||', stripped)
        stripped = re.sub(r'\bnot\s+', '!', stripped)

        # print -> console.log
        stripped = re.sub(r'\bprint\s*\(', 'console.log(', stripped)

        # f-string 변환: f"text {var}" -> `text ${var}`
        def convert_fstring(match):
            content = match.group(1)
            # {var} -> ${var}
            content = re.sub(r'\{(\w+)\}', r'${\1}', content)
            return f'`{content}`'
        stripped = re.sub(r'f"([^"]*)"', convert_fstring, stripped)
        stripped = re.sub(r"f'([^']*)'", convert_fstring, stripped)

        # .append() -> .push()
        stripped = re.sub(r'\.append\s*\(', '.push(', stripped)

        # .remove(item) -> splice(indexOf(item), 1)
        # 패턴: list.remove(item) -> { const idx = list.indexOf(item); if(idx > -1) list.splice(idx, 1); }
        remove_match = re.search(r'(\w+)\.remove\s*\(([^)]+)\)', stripped)
        if remove_match:
            list_name = remove_match.group(1)
            item = remove_match.group(2)
            stripped = re.sub(
                r'(\w+)\.remove\s*\(([^)]+)\)',
                f'{{ const _idx = {list_name}.indexOf({item}); if(_idx > -1) {list_name}.splice(_idx, 1); }}',
                stripped
            )

        # 'item in list' -> 'list.includes(item)' (조건문 안에서)
        stripped = re.sub(r'if\s+(\w+)\s+in\s+(\w+)', r'if (\2.includes(\1))', stripped)

        js_indent = ' ' * (len(indent_stack) * 4)

        # 제어문 처리
        if re.match(r'if\s+(.+):$', stripped):
            match = re.match(r'if\s+(.+):$', stripped)
            condition = match.group(1)
            indent_stack.append(original_indent + 4)
            return result_prefix + f'{js_indent}if ({condition}) {{', indent_stack

        if re.match(r'elif\s+(.+):$', stripped):
            match = re.match(r'elif\s+(.+):$', stripped)
            condition = match.group(1)
            return result_prefix + f'{js_indent}}} else if ({condition}) {{', indent_stack

        if stripped == 'else:':
            return result_prefix + f'{js_indent}}} else {{', indent_stack

        # for 루프 - range (숫자 또는 변수)
        if re.match(r'for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*\)\s*:$', stripped):
            match = re.match(r'for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*\)\s*:$', stripped)
            var, end = match.groups()
            indent_stack.append(original_indent + 4)
            # _ 변수는 _unused로 변환
            js_var = '_unused' if var == '_' else var
            return result_prefix + f'{js_indent}for (let {js_var} = 0; {js_var} < {end}; {js_var}++) {{', indent_stack

        if re.match(r'for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*:$', stripped):
            match = re.match(r'for\s+(\w+)\s+in\s+range\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)\s*:$', stripped)
            var, start, end = match.groups()
            indent_stack.append(original_indent + 4)
            js_var = '_unused' if var == '_' else var
            return result_prefix + f'{js_indent}for (let {js_var} = {start}; {js_var} < {end}; {js_var}++) {{', indent_stack

        # for 루프 - 리스트 순회 (for x in list:)
        if re.match(r'for\s+(\w+)\s+in\s+(\w+)\s*:$', stripped):
            match = re.match(r'for\s+(\w+)\s+in\s+(\w+)\s*:$', stripped)
            var, iterable = match.groups()
            indent_stack.append(original_indent + 4)
            return result_prefix + f'{js_indent}for (let {var} of {iterable}) {{', indent_stack

        # while 루프
        if re.match(r'while\s+(.+):$', stripped):
            match = re.match(r'while\s+(.+):$', stripped)
            condition = match.group(1)
            indent_stack.append(original_indent + 4)
            return result_prefix + f'{js_indent}while ({condition}) {{', indent_stack

        # 함수 정의
        if re.match(r'def\s+(\w+)\s*\((.*)\)\s*:$', stripped):
            match = re.match(r'def\s+(\w+)\s*\((.*)\)\s*:$', stripped)
            func_name, params = match.groups()
            indent_stack.append(original_indent + 4)
            return result_prefix + f'{js_indent}function {func_name}({params}) {{', indent_stack

        # 튜플 언패킹: a, b, c = list_item 또는 a, b, c = func()
        # -> const [a, b, c] = list_item 또는 const [a, b, c] = func()
        tuple_unpack_match = re.match(r'^(\w+(?:\s*,\s*\w+)+)\s*=\s*(\w+(?:\(\))?)$', stripped)
        if tuple_unpack_match:
            vars_str = tuple_unpack_match.group(1)
            value = tuple_unpack_match.group(2)
            vars_list = [v.strip() for v in vars_str.split(',')]
            # _는 무시 (더미 변수)
            js_vars = [v if v != '_' else '_unused' for v in vars_list]
            for v in vars_list:
                if v != '_':
                    declared_vars.add(v)
            # 항상 const 사용 (블록 스코프)
            return result_prefix + f'{js_indent}const [{", ".join(js_vars)}] = {value};', indent_stack

        # 배열 요소 언패킹: b[0], b[1], b[2] = func() -> [b[0], b[1], b[2]] = func()
        array_unpack_match = re.match(r'^(\w+\[\d+\](?:\s*,\s*\w+\[\d+\])+)\s*=\s*(\w+\(\))$', stripped)
        if array_unpack_match:
            vars_str = array_unpack_match.group(1)
            value = array_unpack_match.group(2)
            return result_prefix + f'{js_indent}[{vars_str}] = {value};', indent_stack

        # 다중 값 할당: a, b = 1, 2 -> let a = 1; let b = 2;
        multi_assign_match = re.match(r'^(\w+(?:\s*,\s*\w+)+)\s*=\s*([^=].+)$', stripped)
        if multi_assign_match and ',' in multi_assign_match.group(2):
            vars_str = multi_assign_match.group(1)
            vals_str = multi_assign_match.group(2)
            vars_list = [v.strip() for v in vars_str.split(',')]
            vals_list = [v.strip() for v in vals_str.split(',')]
            if len(vars_list) == len(vals_list):
                result_stmts = []
                for v, val in zip(vars_list, vals_list):
                    if v != '_':
                        if v not in declared_vars:
                            declared_vars.add(v)
                            result_stmts.append(f'let {v} = {val}')
                        else:
                            result_stmts.append(f'{v} = {val}')
                return result_prefix + f'{js_indent}{"; ".join(result_stmts)};', indent_stack

        # 변수 할당
        assign_match = re.match(r'^(\w+)\s*=\s*(.+)$', stripped)
        if assign_match:
            var, value = assign_match.groups()
            if var not in declared_vars:
                declared_vars.add(var)
                return result_prefix + f'{js_indent}let {var} = {value};', indent_stack
            else:
                return result_prefix + f'{js_indent}{var} = {value};', indent_stack

        # 복합 할당 (+=, -=, 등)
        compound_match = re.match(r'^(\w+)\s*([+\-*/])=\s*(.+)$', stripped)
        if compound_match:
            var, op, value = compound_match.groups()
            return result_prefix + f'{js_indent}{var} {op}= {value};', indent_stack

        # 일반 문장
        if not stripped.endswith(('{', '}', ';', ':')):
            stripped = stripped + ';'

        return result_prefix + f'{js_indent}{stripped}', indent_stack

    def process_code_block(code_lines: list) -> str:
        """코드 블록을 처리하고 적절한 블록 닫기 추가"""
        result = []
        indent_stack = []

        for line in code_lines:
            converted, indent_stack = convert_line(line, indent_stack)
            if converted.strip():
                result.append(converted)

        # 남은 블록 닫기
        while indent_stack:
            indent_stack.pop()
            result.append(' ' * (len(indent_stack) * 4) + '}')

        return '\n'.join(result)

    # 셋업 코드 변환
    js_setup = process_code_block(setup_code)

    # 루프 바디 변환
    js_loop = ''
    if main_loop_body:
        # 루프 바디 내부에서 indent_stack 초기화
        loop_result = []
        indent_stack = []

        for line in main_loop_body:
            if not line.strip():
                continue
            converted, indent_stack = convert_line('    ' + line if line.strip() else line, indent_stack)
            if converted.strip():
                loop_result.append(converted)

        # 남은 블록 닫기
        while indent_stack:
            indent_stack.pop()
            loop_result.append(' ' * (len(indent_stack) * 4) + '}')

        js_loop = '\n'.join(loop_result)

    # 최종 JavaScript 생성
    result = js_setup

    if js_loop:
        result += '\n\nfunction update() {\n'
        result += js_loop
        result += '\n}'

    return result
