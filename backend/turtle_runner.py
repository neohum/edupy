"""
Turtle 코드를 matplotlib로 시뮬레이션하여 결과 이미지를 생성하는 모듈
"""
import io
import base64
import os
import matplotlib
matplotlib.use('Agg')  # GUI 없이 이미지 생성
import matplotlib.pyplot as plt
import numpy as np
from typing import List, Tuple
from PIL import Image
from matplotlib.offsetbox import OffsetImage, AnnotationBbox


class TurtleSimulator:
    """Turtle 명령을 matplotlib로 시뮬레이션"""

    def __init__(self, record_frames=False):
        self.x = 0.0
        self.y = 0.0
        self.angle = 90.0  # 북쪽 방향 (위)
        self.pen_down = True
        self.pen_color = 'black'
        self.fill_color = 'black'
        self.pen_size = 1
        self.speed_value = 6
        self.is_visible = True
        self.turtle_shape = 'classic'  # 거북이 모양
        self.filling = False
        self.fill_points: List[Tuple[float, float]] = []
        self.lines: List[dict] = []
        self.filled_shapes: List[dict] = []  # 채워진 도형들
        self.record_frames = record_frames
        self.frames: List[List[dict]] = []  # 각 프레임의 선 목록
        self.positions: List[Tuple[float, float, float]] = []  # 거북이 위치 기록 (x, y, angle)

    def _save_frame(self):
        """현재 상태를 프레임으로 저장"""
        if self.record_frames:
            # 현재까지의 모든 선과 채워진 도형을 복사하여 저장
            frame_data = {
                'lines': [line.copy() for line in self.lines],
                'filled_shapes': [shape.copy() for shape in self.filled_shapes]
            }
            self.frames.append(frame_data)
            # 현재 거북이 위치 저장
            self.positions.append((self.x, self.y, self.angle))

    def forward(self, distance: float):
        """앞으로 이동 (부드러운 애니메이션을 위해 4단계로 분할)"""
        # 애니메이션 모드일 때만 단계별로 나누기
        if self.record_frames and abs(distance) > 0:
            steps = 4  # 4단계로 분할 (성능 최적화)
            step_distance = distance / steps

            for _ in range(steps):
                new_x = self.x + step_distance * np.cos(np.radians(self.angle))
                new_y = self.y + step_distance * np.sin(np.radians(self.angle))

                if self.pen_down:
                    self.lines.append({
                        'x': [self.x, new_x],
                        'y': [self.y, new_y],
                        'color': self.pen_color
                    })
                    self._save_frame()  # 각 단계마다 프레임 저장

                self.x = new_x
                self.y = new_y

                # filling 모드일 때 점 기록
                if self.filling:
                    self.fill_points.append((self.x, self.y))
        else:
            # 정적 모드일 때는 한 번에 이동
            new_x = self.x + distance * np.cos(np.radians(self.angle))
            new_y = self.y + distance * np.sin(np.radians(self.angle))

            if self.pen_down:
                self.lines.append({
                    'x': [self.x, new_x],
                    'y': [self.y, new_y],
                    'color': self.pen_color
                })

            self.x = new_x
            self.y = new_y

            # filling 모드일 때 점 기록
            if self.filling:
                self.fill_points.append((self.x, self.y))

    def backward(self, distance: float):
        """뒤로 이동"""
        self.forward(-distance)

    def right(self, angle: float):
        """오른쪽으로 회전"""
        self.angle -= angle

    def left(self, angle: float):
        """왼쪽으로 회전"""
        self.angle += angle

    def penup(self):
        """펜 들기"""
        self.pen_down = False

    def pendown(self):
        """펜 내리기"""
        self.pen_down = True

    def pencolor(self, color: str):
        """펜 색상 변경"""
        self.pen_color = color

    def circle(self, radius: float, extent: float = 360):
        """원 그리기 (근사) - 애니메이션 최적화"""
        # 애니메이션 모드일 때는 원 전체를 한 번에 그리고 마지막에 한 번만 프레임 저장
        if self.record_frames:
            steps = 36  # 원을 부드럽게 그리기 위해 36단계 사용
        else:
            steps = int(abs(extent) / 5)  # 5도마다 선분 (정적 모드)

        if steps < 1:
            steps = 1

        step_angle = extent / steps
        step_distance = 2 * abs(radius) * np.sin(np.radians(abs(step_angle) / 2))

        # 원을 그릴 때는 forward()의 프레임 분할과 프레임 기록을 모두 비활성화
        original_record = self.record_frames
        self.record_frames = False  # 임시로 프레임 기록 중지

        for i in range(steps):
            self.forward(step_distance)
            self.right(step_angle) if radius > 0 else self.left(step_angle)

        # 원을 다 그린 후 마지막에 한 번만 프레임 저장
        if original_record:
            self.record_frames = True
            self._save_frame()

        # 원래 상태로 복원
        self.record_frames = original_record

    def done(self):
        """아무것도 하지 않음 (호환성)"""
        pass

    # === Turtle Motion Methods ===
    def fd(self, distance: float):
        """forward의 별칭"""
        self.forward(distance)

    def bk(self, distance: float):
        """backward의 별칭"""
        self.backward(distance)

    def back(self, distance: float):
        """backward의 별칭"""
        self.backward(distance)

    def rt(self, angle: float):
        """right의 별칭"""
        self.right(angle)

    def lt(self, angle: float):
        """left의 별칭"""
        self.left(angle)

    def goto(self, x: float, y: float = None):
        """특정 위치로 이동"""
        if y is None:
            # (x, y) 튜플로 전달된 경우
            if isinstance(x, (tuple, list)):
                y = x[1]
                x = x[0]
            else:
                return

        if self.pen_down:
            self.lines.append({
                'x': [self.x, x],
                'y': [self.y, y],
                'color': self.pen_color
            })
            if self.record_frames:
                self._save_frame()

        self.x = x
        self.y = y

    def setpos(self, x: float, y: float = None):
        """goto의 별칭"""
        self.goto(x, y)

    def setposition(self, x: float, y: float = None):
        """goto의 별칭"""
        self.goto(x, y)

    def setx(self, x: float):
        """x 좌표만 설정"""
        self.goto(x, self.y)

    def sety(self, y: float):
        """y 좌표만 설정"""
        self.goto(self.x, y)

    def setheading(self, to_angle: float):
        """방향 설정"""
        self.angle = to_angle

    def seth(self, to_angle: float):
        """setheading의 별칭"""
        self.setheading(to_angle)

    def home(self):
        """원점으로 이동하고 방향을 북쪽으로"""
        self.goto(0, 0)
        self.setheading(90)

    # === Tell Turtle's State ===
    def position(self):
        """현재 위치 반환"""
        return (self.x, self.y)

    def pos(self):
        """position의 별칭"""
        return self.position()

    def xcor(self):
        """x 좌표 반환"""
        return self.x

    def ycor(self):
        """y 좌표 반환"""
        return self.y

    def heading(self):
        """현재 방향 반환"""
        return self.angle

    def distance(self, x: float, y: float = None):
        """특정 위치까지의 거리"""
        if y is None:
            if isinstance(x, (tuple, list)):
                y = x[1]
                x = x[0]
        return np.sqrt((self.x - x)**2 + (self.y - y)**2)

    # === Pen Control ===
    def pd(self):
        """pendown의 별칭"""
        self.pendown()

    def down(self):
        """pendown의 별칭"""
        self.pendown()

    def pu(self):
        """penup의 별칭"""
        self.penup()

    def up(self):
        """penup의 별칭"""
        self.penup()

    def pensize(self, width: int = None):
        """펜 두께 설정/반환"""
        if width is None:
            return self.pen_size
        self.pen_size = width

    def width(self, width: int = None):
        """pensize의 별칭"""
        return self.pensize(width)

    def isdown(self):
        """펜이 내려져 있는지 확인"""
        return self.pen_down

    # === Color Control ===
    def color(self, *args):
        """펜 색상과 채우기 색상 설정"""
        if len(args) == 0:
            return (self.pen_color, self.fill_color)
        elif len(args) == 1:
            self.pen_color = args[0]
            self.fill_color = args[0]
        elif len(args) == 2:
            self.pen_color = args[0]
            self.fill_color = args[1]

    def fillcolor(self, color: str = None):
        """채우기 색상 설정/반환"""
        if color is None:
            return self.fill_color
        self.fill_color = color

    # === Filling ===
    def begin_fill(self):
        """채우기 시작"""
        self.filling = True
        self.fill_points = [(self.x, self.y)]

    def end_fill(self):
        """채우기 종료"""
        if self.filling and len(self.fill_points) > 2:
            self.filled_shapes.append({
                'points': self.fill_points.copy(),
                'color': self.fill_color
            })
            if self.record_frames:
                self._save_frame()
        self.filling = False
        self.fill_points = []

    # === More Drawing Control ===
    def dot(self, size: int = None, color: str = None):
        """점 그리기"""
        if size is None:
            size = max(self.pen_size + 4, 2 * self.pen_size)
        if color is None:
            color = self.pen_color

        # 점을 작은 원으로 표현
        self.lines.append({
            'x': [self.x],
            'y': [self.y],
            'color': color,
            'marker': 'o',
            'markersize': size
        })
        if self.record_frames:
            self._save_frame()

    def speed(self, speed: int = None):
        """속도 설정 (시뮬레이션에서는 무시)"""
        if speed is None:
            return self.speed_value
        self.speed_value = speed

    def hideturtle(self):
        """거북이 숨기기"""
        self.is_visible = False

    def ht(self):
        """hideturtle의 별칭"""
        self.hideturtle()

    def showturtle(self):
        """거북이 보이기"""
        self.is_visible = True

    def st(self):
        """showturtle의 별칭"""
        self.showturtle()

    def isvisible(self):
        """거북이가 보이는지 확인"""
        return self.is_visible

    def shape(self, name=None):
        """
        거북이 모양 설정/반환

        Args:
            name: 모양 이름 ('arrow', 'turtle', 'circle', 'square', 'triangle', 'classic')
                  None이면 현재 모양 반환
        """
        if name is None:
            return self.turtle_shape

        # 지원되는 모양 목록
        valid_shapes = ['arrow', 'turtle', 'circle', 'square', 'triangle', 'classic']
        if name in valid_shapes:
            self.turtle_shape = name
        else:
            # 지원하지 않는 모양이면 기본값 유지
            pass

    def title(self, titlestring=None):
        """
        창 제목 설정 (시뮬레이션에서는 무시)

        Args:
            titlestring: 창 제목 문자열
        """
        # 시뮬레이션 환경에서는 창이 없으므로 무시
        pass

    def setup(self, width=None, height=None, startx=None, starty=None):
        """
        화면 크기 및 위치 설정 (시뮬레이션에서는 무시)

        Args:
            width: 창 너비
            height: 창 높이
            startx: 창 시작 x 좌표
            starty: 창 시작 y 좌표
        """
        # 시뮬레이션 환경에서는 창 크기가 고정되어 있으므로 무시
        pass

    def done(self):
        """완료 (호환성을 위해 추가)"""
        pass


def render_frame(frame_data, width: int, height: int, turtle_pos: Tuple[float, float, float] = None) -> str:
    """
    프레임을 이미지로 렌더링

    Args:
        frame_data: dict with 'lines' and 'filled_shapes' or just a list of lines (legacy)
        width: 캔버스 너비
        height: 캔버스 높이
        turtle_pos: 거북이 위치 (x, y, angle) - None이면 거북이를 그리지 않음
    """
    fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
    ax.set_aspect('equal')
    ax.set_xlim(-width/2, width/2)
    ax.set_ylim(-height/2, height/2)
    ax.axis('off')

    # frame_data가 dict인지 list인지 확인 (하위 호환성)
    if isinstance(frame_data, dict):
        lines = frame_data.get('lines', [])
        filled_shapes = frame_data.get('filled_shapes', [])
    else:
        lines = frame_data
        filled_shapes = []

    # 채워진 도형 먼저 그리기 (배경)
    for shape in filled_shapes:
        points = shape['points']
        if len(points) > 2:
            xs = [p[0] for p in points]
            ys = [p[1] for p in points]
            ax.fill(xs, ys, color=shape['color'], alpha=0.7)

    # 모든 선 그리기
    for line in lines:
        if 'marker' in line:
            # 점 그리기
            ax.plot(line['x'], line['y'], color=line['color'],
                   marker=line['marker'], markersize=line.get('markersize', 10))
        else:
            # 선 그리기
            ax.plot(line['x'], line['y'], color=line['color'], linewidth=2)

    # 거북이 그리기 (PNG 이미지 사용)
    if turtle_pos is not None:
        x, y, angle = turtle_pos

        # PNG 이미지 로드
        script_dir = os.path.dirname(os.path.abspath(__file__))
        turtle_img_path = os.path.join(script_dir, 'static', 'turtle.png')

        try:
            # PNG 이미지 로드
            img = Image.open(turtle_img_path)

            # 이미지 회전 (거북이가 바라보는 방향)
            # angle은 북쪽이 90도이므로, 이미지는 위쪽을 향하도록 회전
            rotated_img = img.rotate(90 - angle, expand=True, resample=Image.BICUBIC)

            # matplotlib에 이미지 추가
            imagebox = OffsetImage(rotated_img, zoom=0.15)
            ab = AnnotationBbox(imagebox, (x, y), frameon=False, pad=0)
            ax.add_artist(ab)
        except Exception as e:
            # 이미지 로드 실패 시 이모지 사용
            ax.text(x, y, '🐢', fontsize=40, ha='center', va='center',
                    rotation=90-angle,
                    rotation_mode='anchor')

    # 이미지를 바이트로 변환
    img_byte_arr = io.BytesIO()
    plt.savefig(img_byte_arr, format='PNG', bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    img_byte_arr.seek(0)

    # Base64 인코딩
    img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
    return f'data:image/png;base64,{img_base64}'


def run_turtle_code(code: str, width: int = 600, height: int = 600, animate: bool = False) -> dict:
    """
    Turtle 코드를 matplotlib로 시뮬레이션하여 결과 이미지를 Base64로 반환

    Args:
        code: 실행할 Python turtle 코드
        width: 캔버스 너비 (픽셀)
        height: 캔버스 높이 (픽셀)
        animate: True이면 프레임 배열 반환, False이면 최종 이미지만 반환

    Returns:
        dict: {
            'success': bool,
            'image': str (base64 encoded image) - animate=False일 때,
            'frames': list[str] (base64 encoded images) - animate=True일 때,
            'error': str (에러 메시지, 있는 경우)
        }
    """
    try:
        # Turtle 시뮬레이터 생성
        t = TurtleSimulator(record_frames=animate)

        # 사용자 코드 실행 (t.done() 제거)
        user_code = code.replace('t.done()', '').replace('turtle.done()', '')
        user_code = user_code.replace('import turtle as t', '')
        user_code = user_code.replace('import turtle', '')

        # input() 함수를 기본값으로 대체하는 함수
        def mock_input(prompt=''):
            # 숫자를 요구하는 경우 기본값 반환
            if '변의 수' in prompt or '수' in prompt:
                return '6'
            return '5'

        # 전역 네임스페이스에 t 추가
        exec_globals = {
            't': t,
            'input': mock_input,
            'int': int,
            'range': range,
            '__import__': __import__,  # import 문 지원
            '_': None  # for _ in range() 지원
        }

        # 코드 실행
        exec(user_code, exec_globals)

        # 애니메이션 모드인 경우 모든 프레임 렌더링
        if animate and t.frames:
            frames = []
            for i, frame_data in enumerate(t.frames):
                # 해당 프레임의 거북이 위치 가져오기
                turtle_pos = t.positions[i] if i < len(t.positions) else None
                frame_image = render_frame(frame_data, width, height, turtle_pos)
                frames.append(frame_image)

            return {
                'success': True,
                'frames': frames,
                'frame_count': len(frames),
                'error': None
            }

        # 정적 이미지 모드 - 최종 결과만 렌더링 (거북이 위치 포함)
        final_turtle_pos = (t.x, t.y, t.angle) if t.is_visible else None
        final_frame_data = {
            'lines': t.lines,
            'filled_shapes': t.filled_shapes
        }
        final_image = render_frame(final_frame_data, width, height, final_turtle_pos)

        return {
            'success': True,
            'image': final_image,
            'error': None
        }

    except Exception as e:
        # 에러 발생 시 matplotlib 정리
        try:
            plt.close('all')
        except:
            pass

        return {
            'success': False,
            'image': None,
            'error': str(e)
        }

