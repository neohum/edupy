#!/usr/bin/env python3
"""
pygame-games 커리큘럼의 모든 게임을 HTML 파일로 생성
"""

import json
import os
import re
import sys

# 프로젝트 루트 경로
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CURRICULUM_FILE = os.path.join(PROJECT_ROOT, 'frontend/src/data/pygameGamesCurriculum.ts')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'frontend/public/games')

# pygame_to_html 모듈 임포트
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pygame_to_html import convert_pygame_to_html


def extract_activities_from_ts(ts_content: str) -> list:
    """
    TypeScript 파일에서 활동 정보 추출
    """
    activities = []

    # 각 활동의 id와 exampleCode 추출
    # 정규식으로 id: 'x-x' 와 exampleCode: `...` 패턴 찾기
    pattern = r"id:\s*'(\d+-\d+)'.*?exampleCode:\s*`([^`]+)`"
    matches = re.findall(pattern, ts_content, re.DOTALL)

    for match in matches:
        activity_id = match[0]
        code = match[1]
        # 이스케이프된 문자 처리
        code = code.replace('\\n', '\n').replace('\\t', '\t')
        activities.append({
            'id': activity_id,
            'code': code
        })

    return activities


def main():
    print(f"커리큘럼 파일: {CURRICULUM_FILE}")
    print(f"출력 디렉토리: {OUTPUT_DIR}")

    # 출력 디렉토리 생성
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # TypeScript 파일 읽기
    with open(CURRICULUM_FILE, 'r', encoding='utf-8') as f:
        ts_content = f.read()

    # 활동 추출
    activities = extract_activities_from_ts(ts_content)
    print(f"\n총 {len(activities)}개의 활동 발견")

    # 각 활동에 대해 HTML 생성
    success_count = 0
    error_count = 0

    for activity in activities:
        activity_id = activity['id']
        code = activity['code']

        try:
            # HTML 생성
            html = convert_pygame_to_html(code, width=600, height=400)

            # 파일 저장
            filename = f"game_{activity_id.replace('-', '_')}.html"
            filepath = os.path.join(OUTPUT_DIR, filename)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)

            print(f"✓ {activity_id} -> {filename}")
            success_count += 1

        except Exception as e:
            print(f"✗ {activity_id} 오류: {str(e)}")
            error_count += 1

    print(f"\n완료: {success_count}개 성공, {error_count}개 실패")

    # 인덱스 JSON 파일 생성
    index_data = {
        'games': [
            {
                'id': a['id'],
                'file': f"game_{a['id'].replace('-', '_')}.html"
            }
            for a in activities
        ]
    }

    index_path = os.path.join(OUTPUT_DIR, 'index.json')
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print(f"인덱스 파일 생성: {index_path}")


if __name__ == '__main__':
    main()
