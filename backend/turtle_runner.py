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
        self.lines: List[dict] = []
        self.record_frames = record_frames
        self.frames: List[List[dict]] = []  # 각 프레임의 선 목록
        self.positions: List[Tuple[float, float, float]] = []  # 거북이 위치 기록 (x, y, angle)

    def _save_frame(self):
        """현재 상태를 프레임으로 저장"""
        if self.record_frames:
            # 현재까지의 모든 선을 복사하여 저장
            self.frames.append([line.copy() for line in self.lines])
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


def render_frame(lines: List[dict], width: int, height: int, turtle_pos: Tuple[float, float, float] = None) -> str:
    """
    프레임을 이미지로 렌더링

    Args:
        lines: 그려진 선들의 리스트
        width: 캔버스 너비
        height: 캔버스 높이
        turtle_pos: 거북이 위치 (x, y, angle) - None이면 거북이를 그리지 않음
    """
    fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
    ax.set_aspect('equal')
    ax.set_xlim(-width/2, width/2)
    ax.set_ylim(-height/2, height/2)
    ax.axis('off')

    # 모든 선 그리기
    for line in lines:
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
            '_': None  # for _ in range() 지원
        }

        # 코드 실행
        exec(user_code, exec_globals)

        # 애니메이션 모드인 경우 모든 프레임 렌더링
        if animate and t.frames:
            frames = []
            for i, frame_lines in enumerate(t.frames):
                # 해당 프레임의 거북이 위치 가져오기
                turtle_pos = t.positions[i] if i < len(t.positions) else None
                frame_image = render_frame(frame_lines, width, height, turtle_pos)
                frames.append(frame_image)

            return {
                'success': True,
                'frames': frames,
                'frame_count': len(frames),
                'error': None
            }

        # 정적 이미지 모드 - 최종 결과만 렌더링 (거북이 위치 포함)
        final_turtle_pos = (t.x, t.y, t.angle)
        final_image = render_frame(t.lines, width, height, final_turtle_pos)

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

