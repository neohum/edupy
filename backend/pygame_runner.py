"""
Pygame 코드 실행 모듈
사용자가 작성한 Pygame 코드를 실행하고 결과를 이미지로 반환합니다.
키 입력 시뮬레이션을 통해 게임이 자동으로 플레이되는 것처럼 보이게 합니다.
"""

import pygame
import io
import base64
from PIL import Image
import sys
from io import StringIO
import traceback
import random


def simulate_key_inputs(frame_count: int, game_type: str = 'auto') -> list:
    """
    프레임별로 시뮬레이션할 키 입력 생성

    Args:
        frame_count: 현재 프레임 번호
        game_type: 게임 타입 ('auto', 'avoid', 'collect', 'shoot', 'pong', 'typing')

    Returns:
        list: 눌러야 할 키 리스트 (pygame.K_* 상수)
    """
    keys = []

    if game_type == 'avoid':
        # 피하기 게임: 좌우로 움직이기
        if frame_count % 30 < 15:
            keys.append(pygame.K_LEFT)
        else:
            keys.append(pygame.K_RIGHT)

    elif game_type == 'collect':
        # 수집 게임: 랜덤하게 움직이기
        if frame_count % 20 < 10:
            keys.append(pygame.K_LEFT)
        else:
            keys.append(pygame.K_RIGHT)

    elif game_type == 'shoot':
        # 슈팅 게임: 좌우 이동 + 발사
        if frame_count % 40 < 20:
            keys.append(pygame.K_LEFT)
        else:
            keys.append(pygame.K_RIGHT)

        # 주기적으로 발사
        if frame_count % 10 == 0:
            keys.append(pygame.K_SPACE)

    elif game_type == 'pong':
        # 탁구 게임: 위아래 이동
        if frame_count % 30 < 15:
            keys.append(pygame.K_UP)
        else:
            keys.append(pygame.K_DOWN)

    elif game_type == 'typing':
        # 타이핑 게임: 랜덤 키 입력
        if frame_count % 15 == 0:
            # a-z 중 랜덤 선택
            random_key = random.choice([
                pygame.K_a, pygame.K_b, pygame.K_c, pygame.K_d, pygame.K_e,
                pygame.K_f, pygame.K_g, pygame.K_h, pygame.K_i, pygame.K_j
            ])
            keys.append(random_key)

    else:  # 'auto'
        # 자동 감지: 좌우 이동 + 가끔 스페이스
        if frame_count % 25 < 12:
            keys.append(pygame.K_LEFT)
        else:
            keys.append(pygame.K_RIGHT)

        if frame_count % 20 == 0:
            keys.append(pygame.K_SPACE)

    return keys


def run_pygame_code(code: str, width: int = 600, height: int = 400, max_frames: int = 60,
                    simulate_input: bool = True, game_type: str = 'auto') -> dict:
    """
    Pygame 코드를 실행하고 결과를 이미지로 반환

    Args:
        code: 실행할 Pygame 코드
        width: 화면 너비
        height: 화면 높이
        max_frames: 최대 프레임 수 (무한 루프 방지)
        simulate_input: 키 입력 시뮬레이션 활성화 여부
        game_type: 게임 타입 ('auto', 'avoid', 'collect', 'shoot', 'pong', 'typing')

    Returns:
        dict: {
            'success': bool,
            'image': str (base64 인코딩된 이미지) 또는 None,
            'output': str (print 출력),
            'error': str 또는 None
        }
    """
    
    # 출력 캡처를 위한 StringIO
    output_capture = StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    try:
        # stdout, stderr 리다이렉트
        sys.stdout = output_capture
        sys.stderr = output_capture
        
        # Pygame 초기화
        pygame.init()
        
        # 화면 생성 (headless 모드)
        screen = pygame.display.set_mode((width, height))
        
        # 사용자 코드 실행을 위한 네임스페이스
        namespace = {
            'pygame': pygame,
            'screen': screen,
            '__name__': '__main__',
            '__frame_count__': 0,
            '__max_frames__': max_frames
        }

        # 코드 수정: running 루프를 제한된 프레임으로 변경
        modified_code = code

        # pygame.quit() 제거 (이미지 캡처 전에 종료되는 것 방지)
        modified_code = modified_code.replace('pygame.quit()', '# pygame.quit() - 자동 제거됨')

        # while running: 루프를 찾아서 프레임 카운터 및 키 입력 시뮬레이션 추가
        if 'while running:' in modified_code or 'while True:' in modified_code:
            # while running: 또는 while True: 다음에 프레임 카운터 체크 추가
            lines = modified_code.split('\n')
            new_lines = []

            # 이벤트 루프 찾기
            event_loop_found = False

            for i, line in enumerate(lines):
                new_lines.append(line)

                # while 루프 시작 감지
                if 'while running:' in line or 'while True:' in line:
                    # 들여쓰기 레벨 계산
                    indent_level = len(line) - len(line.lstrip())
                    indent = ' ' * (indent_level + 4)

                    # 프레임 카운터 추가
                    new_lines.append(f"{indent}global __frame_count__, __max_frames__")
                    new_lines.append(f"{indent}__frame_count__ += 1")
                    new_lines.append(f"{indent}if __frame_count__ >= __max_frames__:")
                    new_lines.append(f"{indent}    running = False")
                    new_lines.append(f"{indent}    break")

                # 이벤트 루프 감지 (for event in pygame.event.get():)
                if 'for event in pygame.event.get():' in line and simulate_input:
                    event_loop_found = True
                    indent_level = len(line) - len(line.lstrip())
                    indent = ' ' * indent_level

                    # 이벤트 루프 전에 키 입력 시뮬레이션 추가
                    new_lines.insert(-1, f"{indent}# 키 입력 시뮬레이션")
                    new_lines.insert(-1, f"{indent}__simulated_keys__ = simulate_key_inputs(__frame_count__, '{game_type}')")
                    new_lines.insert(-1, f"{indent}for __key__ in __simulated_keys__:")
                    new_lines.insert(-1, f"{indent}    __sim_event__ = pygame.event.Event(pygame.KEYDOWN, {{'key': __key__}})")
                    new_lines.insert(-1, f"{indent}    pygame.event.post(__sim_event__)")
                    new_lines.insert(-1, f"{indent}")

            modified_code = '\n'.join(new_lines)

            # 키 입력 시뮬레이션 함수를 네임스페이스에 추가
            if simulate_input:
                namespace['simulate_key_inputs'] = simulate_key_inputs

        # 코드 실행
        try:
            exec(modified_code, namespace)
        except SystemExit:
            # pygame.quit()나 sys.exit() 호출 시 무시
            pass

        # 화면을 이미지로 변환
        # Pygame surface를 PIL Image로 변환
        pygame_surface = screen

        # 실제 surface 크기 가져오기
        actual_width, actual_height = pygame_surface.get_size()

        # Surface를 문자열 버퍼로 변환
        image_str = pygame.image.tostring(pygame_surface, 'RGB')
        image = Image.frombytes('RGB', (actual_width, actual_height), image_str)
        
        # 이미지를 base64로 인코딩
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        # 출력 가져오기
        output = output_capture.getvalue()
        
        # Pygame 종료
        pygame.quit()
        
        # stdout, stderr 복원
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        return {
            'success': True,
            'image': f'data:image/png;base64,{image_base64}',
            'output': output,
            'error': None
        }
        
    except Exception as e:
        # Pygame 종료
        try:
            pygame.quit()
        except:
            pass
        
        # stdout, stderr 복원
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        
        # 에러 메시지
        error_msg = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        output = output_capture.getvalue()
        
        return {
            'success': False,
            'image': None,
            'output': output,
            'error': error_msg
        }

