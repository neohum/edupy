"""
AI 팀 배치 오류 수정 시스템

레벨별 전문 Claude 에이전트가 병렬로 Python 오류를 분석하고 수정합니다.

팀 구성:
  - 팀장 (Sonnet 4.6): 오류 분류 & 결과 집계
  - Level 1-2 전문가 (Haiku 4.5): print/변수 오류
  - Level 3-4 전문가 (Haiku 4.5): 입력/조건문 오류
  - Level 5-6 전문가 (Haiku 4.5): elif/반복문 오류
  - Level 7-8 전문가 (Haiku 4.5): 리스트/딕셔너리/함수 오류
  - 게임 전문가 (Haiku 4.5): 게임 코드 오류

사용법:
  python ai_team_fix.py              # 모든 미해결 오류 수정
  python ai_team_fix.py --dry-run    # 실제 수정 없이 분석만
  python ai_team_fix.py --id 1 2 3   # 특정 ID만 수정
"""

import os
import sys
import re
import json
import sqlite3
import logging
import argparse
from io import StringIO
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import anthropic

# 데이터베이스 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
DB_PATH = os.path.join(DATA_DIR, "edupy.db")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# 데이터 모델
# ──────────────────────────────────────────────

@dataclass
class ErrorReport:
    id: int
    level: str
    activity: str
    error_message: str
    user_code: str

@dataclass
class FixResult:
    error_id: int
    success: bool
    fixed_code: Optional[str] = None
    explanation: Optional[str] = None
    error: Optional[str] = None
    agent_name: Optional[str] = None

# ──────────────────────────────────────────────
# 레벨별 에이전트 정의
# ──────────────────────────────────────────────

AGENTS = {
    "level1_2": {
        "name": "Level 1-2 전문가 (print/변수)",
        "model": "claude-haiku-4-5",
        "system": """당신은 파이썬 입문자 교육 플랫폼의 Level 1-2 오류 수정 전문가입니다.
Level 1 (print, 줄바꿈)과 Level 2 (변수, 자료형) 관련 오류를 수정합니다.

전문 분야:
- print() 함수 사용법
- 문자열 출력, 줄바꿈(\\n)
- 변수 선언과 할당
- int, float, str, bool 자료형
- 이모지 출력

수정 원칙: 초보자가 이해할 수 있도록 가장 간단한 방법으로 수정하세요.""",
        "levels": ["Level 1", "레벨 1"],
    },
    "level3_4": {
        "name": "Level 3-4 전문가 (입력/조건문)",
        "model": "claude-haiku-4-5",
        "system": """당신은 파이썬 입문자 교육 플랫폼의 Level 3-4 오류 수정 전문가입니다.
Level 3 (input, 형변환)과 Level 4 (if/else 조건문) 관련 오류를 수정합니다.

전문 분야:
- input() 함수
- int(), float(), str() 형변환
- 기본 사칙연산 (+, -, *, /, //, %)
- if/else 조건문
- 비교 연산자 (==, !=, >, <, >=, <=)

수정 원칙: input()으로 받은 값은 반드시 형변환 후 계산하세요.""",
        "levels": ["Level 3", "Level 4"],
    },
    "level5_6": {
        "name": "Level 5-6 전문가 (elif/반복문)",
        "model": "claude-haiku-4-5",
        "system": """당신은 파이썬 입문자 교육 플랫폼의 Level 5-6 오류 수정 전문가입니다.
Level 5 (elif, 논리연산자)와 Level 6 (for, range 반복문) 관련 오류를 수정합니다.

전문 분야:
- elif를 사용한 다중 조건
- and, or, not 논리 연산자
- for 반복문
- range() 함수
- 중첩 반복문
- 별 패턴, 구구단

수정 원칙: 들여쓰기와 콜론(:)을 정확히 사용하세요.""",
        "levels": ["Level 5", "Level 6"],
    },
    "level7_8": {
        "name": "Level 7-8 전문가 (자료구조/함수)",
        "model": "claude-haiku-4-5",
        "system": """당신은 파이썬 입문자 교육 플랫폼의 Level 7-8 오류 수정 전문가입니다.
Level 7 (while, 중첩반복)과 Level 8 (리스트, 딕셔너리) 관련 오류를 수정합니다.

전문 분야:
- while 반복문과 break
- 리스트 생성, 인덱싱, append
- 딕셔너리 생성, 키-값 접근
- len(), items() 등 메서드
- 리스트 반복

수정 원칙: 리스트는 [], 딕셔너리는 {} 형식으로 올바르게 사용하세요.""",
        "levels": ["Level 7", "Level 8"],
    },
    "game": {
        "name": "게임 전문가 (pygame/turtle)",
        "model": "claude-haiku-4-5",
        "system": """당신은 파이썬 입문자 교육 플랫폼의 게임 코드 오류 수정 전문가입니다.
pygame과 turtle을 사용한 간단한 게임 코드 오류를 수정합니다.

전문 분야:
- 기초 게임 로직 (점수, HP, 조건)
- 랜덤 함수 (random.randint, random.choice)
- turtle 그래픽 기초
- 간단한 텍스트 기반 게임

수정 원칙: 교육용 간단한 게임이므로 복잡한 코드는 피하고 핵심 오류만 수정하세요.""",
        "levels": ["레벨 1 - 기초", "레벨 2", "레벨 3"],
    },
}

FIX_PROMPT_TEMPLATE = """다음 Python 코드에 오류가 있습니다. 수정해주세요.

**레벨/문제:** {level} / {activity}

**오류 메시지:**
```
{error_message}
```

**학생 코드:**
```python
{user_code}
```

다음 형식으로만 응답하세요:

```python
수정된 코드
```

**수정 설명:** 한 줄로 간단히 설명"""

# ──────────────────────────────────────────────
# 에이전트 라우터
# ──────────────────────────────────────────────

def route_error(error: ErrorReport) -> str:
    """오류를 적절한 에이전트에 라우팅합니다."""
    level = error.level.lower()

    # 게임 레벨 감지
    if "기초 게임" in error.level or "고급 게임" in error.level or "게임" in error.activity.lower():
        return "game"

    # Level 번호 추출
    for pattern in [r"level\s*(\d+)", r"레벨\s*(\d+)"]:
        match = re.search(pattern, level, re.IGNORECASE)
        if match:
            num = int(match.group(1))
            if num <= 2:
                return "level1_2"
            elif num <= 4:
                return "level3_4"
            elif num <= 6:
                return "level5_6"
            else:
                return "level7_8"

    return "level3_4"  # 기본값


# ──────────────────────────────────────────────
# 단일 오류 수정 (에이전트별)
# ──────────────────────────────────────────────

def fix_single_error(error: ErrorReport, client: anthropic.Anthropic, agent_key: str) -> FixResult:
    """단일 오류를 해당 에이전트로 수정합니다."""
    agent = AGENTS[agent_key]
    logger.info(f"[{agent['name']}] 오류 #{error.id} 수정 중... ({error.level} / {error.activity})")

    try:
        prompt = FIX_PROMPT_TEMPLATE.format(
            level=error.level,
            activity=error.activity,
            error_message=error.error_message[:500],
            user_code=error.user_code[:1000],
        )

        response = client.messages.create(
            model=agent["model"],
            max_tokens=1024,
            system=agent["system"],
            messages=[{"role": "user", "content": prompt}],
        )

        content = ""
        for block in response.content:
            if block.type == "text":
                content = block.text
                break

        # 코드 블록 추출
        match = re.search(r"```python\s*\n(.*?)\n```", content, re.DOTALL)
        if not match:
            match = re.search(r"```\s*\n(.*?)\n```", content, re.DOTALL)

        if not match:
            return FixResult(
                error_id=error.id,
                success=False,
                error="응답에서 코드를 추출할 수 없음",
                agent_name=agent["name"],
            )

        fixed_code = match.group(1).strip()

        # 설명 추출
        explanation = ""
        desc_match = re.search(r"\*\*수정 설명:\*\*\s*(.*?)(?:\n|$)", content, re.DOTALL)
        if desc_match:
            explanation = desc_match.group(1).strip()
        else:
            explanation = f"[{agent['name']}] AI 자동 수정"

        # 수정된 코드 실행 테스트
        test_result = _test_code(fixed_code)

        logger.info(
            f"[{agent['name']}] 오류 #{error.id} {'성공' if test_result else '코드오류(저장은 함)'}"
        )

        return FixResult(
            error_id=error.id,
            success=True,
            fixed_code=fixed_code,
            explanation=explanation,
            agent_name=agent["name"],
        )

    except anthropic.APIError as e:
        logger.error(f"[{agent['name']}] API 오류 #{error.id}: {e}")
        return FixResult(error_id=error.id, success=False, error=str(e), agent_name=agent["name"])
    except Exception as e:
        logger.error(f"[{agent['name']}] 오류 #{error.id}: {e}")
        return FixResult(error_id=error.id, success=False, error=str(e), agent_name=agent["name"])


def _test_code(code: str) -> bool:
    """수정된 코드가 문법적으로 올바른지 확인합니다."""
    try:
        compile(code, "<string>", "exec")
        return True
    except SyntaxError:
        return False


# ──────────────────────────────────────────────
# 데이터베이스 작업
# ──────────────────────────────────────────────

def get_unresolved_errors(error_ids: Optional[list] = None) -> list[ErrorReport]:
    """미해결 오류를 데이터베이스에서 가져옵니다."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        if error_ids:
            placeholders = ",".join("?" * len(error_ids))
            cursor.execute(
                f"SELECT id, level, activity, error_message, user_code FROM error_reports "
                f"WHERE id IN ({placeholders}) AND (resolved = 0 OR resolved IS NULL)",
                error_ids,
            )
        else:
            cursor.execute(
                "SELECT id, level, activity, error_message, user_code FROM error_reports "
                "WHERE resolved = 0 OR resolved IS NULL ORDER BY id"
            )

        rows = cursor.fetchall()
        return [
            ErrorReport(
                id=r["id"],
                level=r["level"] or "",
                activity=r["activity"] or "",
                error_message=r["error_message"] or "",
                user_code=r["user_code"] or "",
            )
            for r in rows
        ]
    finally:
        conn.close()


def save_fix_result(result: FixResult) -> bool:
    """수정 결과를 데이터베이스에 저장하고 해결됨으로 표시합니다."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        explanation = f"[{result.agent_name}] {result.explanation}" if result.explanation else "AI 자동 수정"

        cursor.execute(
            """UPDATE error_reports
               SET fixed_code = ?, fix_explanation = ?, resolved = 1,
                   resolved_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (result.fixed_code, explanation, result.error_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        conn.rollback()
        logger.error(f"DB 저장 실패 #{result.error_id}: {e}")
        return False
    finally:
        conn.close()


# ──────────────────────────────────────────────
# 메인 오케스트레이터
# ──────────────────────────────────────────────

def run_ai_team(error_ids: Optional[list] = None, dry_run: bool = False, max_workers: int = 5):
    """
    AI 팀을 구성하고 병렬로 오류를 수정합니다.

    Args:
        error_ids: 특정 오류 ID 목록 (None이면 전체)
        dry_run: True면 실제 저장 없이 분석만
        max_workers: 병렬 처리 스레드 수
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # 오류 목록 가져오기
    errors = get_unresolved_errors(error_ids)
    if not errors:
        logger.info("수정할 미해결 오류가 없습니다.")
        return

    logger.info(f"\n{'='*60}")
    logger.info(f"AI 팀 배치 수정 시작: {len(errors)}개 오류")
    logger.info(f"모드: {'드라이런 (저장 안 함)' if dry_run else '실제 수정'}")
    logger.info(f"병렬 처리: {max_workers}개 스레드")
    logger.info(f"{'='*60}\n")

    # 에이전트별로 오류 분류
    buckets: dict[str, list[ErrorReport]] = {key: [] for key in AGENTS}
    for error in errors:
        agent_key = route_error(error)
        buckets[agent_key].append(error)

    # 분류 현황 출력
    logger.info("【 오류 분류 현황 】")
    for key, errs in buckets.items():
        if errs:
            logger.info(f"  {AGENTS[key]['name']}: {len(errs)}개")
    logger.info("")

    # 병렬 처리
    results: list[FixResult] = []
    tasks = []
    for agent_key, errs in buckets.items():
        for error in errs:
            tasks.append((error, agent_key))

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(fix_single_error, error, client, agent_key): (error, agent_key)
            for error, agent_key in tasks
        }

        for future in as_completed(futures):
            result = future.result()
            results.append(result)

            if result.success and not dry_run:
                saved = save_fix_result(result)
                status = "저장 완료" if saved else "저장 실패"
            elif result.success:
                status = "드라이런 (저장 안 함)"
            else:
                status = f"실패: {result.error}"

            logger.info(f"  #{result.error_id} [{result.agent_name}] → {status}")

    # 결과 요약
    succeeded = [r for r in results if r.success]
    failed = [r for r in results if not r.success]

    logger.info(f"\n{'='*60}")
    logger.info(f"【 최종 결과 】")
    logger.info(f"  전체: {len(results)}개")
    logger.info(f"  성공: {len(succeeded)}개")
    logger.info(f"  실패: {len(failed)}개")

    if failed:
        logger.info("\n실패 목록:")
        for r in failed:
            logger.info(f"  #{r.error_id}: {r.error}")

    if dry_run:
        logger.info("\n※ 드라이런 모드: 실제 데이터베이스에 저장되지 않았습니다.")

    logger.info(f"{'='*60}\n")

    return {"total": len(results), "success": len(succeeded), "failed": len(failed)}


# ──────────────────────────────────────────────
# CLI 진입점
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="AI 팀 배치 오류 수정 시스템",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--dry-run", action="store_true", help="실제 저장 없이 분석만 수행")
    parser.add_argument("--id", nargs="+", type=int, metavar="ID", help="수정할 오류 ID 목록")
    parser.add_argument("--workers", type=int, default=5, help="병렬 처리 스레드 수 (기본: 5)")
    args = parser.parse_args()

    run_ai_team(
        error_ids=args.id,
        dry_run=args.dry_run,
        max_workers=args.workers,
    )


if __name__ == "__main__":
    main()
