"""
자동 오류 수정 모듈
Anthropic Claude API를 사용하여 Python 코드의 오류를 자동으로 분석하고 수정합니다.
"""

import os
import re
import logging
from typing import Optional, Tuple

import anthropic

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

_client: Optional[anthropic.Anthropic] = None


def _get_client() -> Optional[anthropic.Anthropic]:
    global _client
    if _client is None and ANTHROPIC_API_KEY:
        _client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


SYSTEM_PROMPT = """당신은 파이썬 초보자 교육 플랫폼의 코드 오류 수정 전문가입니다.
학생들이 제출한 코드의 오류를 분석하고, 초보자가 이해할 수 있도록 친절하게 수정해주세요.

규칙:
- 오류를 수정한 완전한 Python 코드를 제공하세요
- 수정 내용을 초보자 눈높이에서 간단히 설명하세요
- 코드는 최대한 간결하게 유지하세요
- 불필요한 기능을 추가하지 마세요"""


def fix_code_with_augment(code: str, error_message: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Claude API를 사용하여 코드를 자동으로 수정합니다.

    Returns:
        Tuple[bool, Optional[str], Optional[str]]: (성공 여부, 수정된 코드, 설명)
    """
    client = _get_client()
    if not client:
        logger.warning("Anthropic API key not configured")
        return False, None, "ANTHROPIC_API_KEY가 설정되지 않았습니다."

    try:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""다음 Python 코드에 오류가 있습니다. 수정해주세요.

**오류 메시지:**
```
{error_message}
```

**원본 코드:**
```python
{code}
```

다음 형식으로 응답해주세요:

```python
# 수정된 코드 여기에
```

**수정 설명:**
수정 내용을 여기에 설명"""
            }]
        )

        content = ""
        for block in response.content:
            if block.type == "text":
                content = block.text
                break

        if not content:
            return False, None, "API 응답이 비어있습니다."

        fixed_code, explanation = _parse_response(content)

        if not fixed_code:
            return False, None, "수정된 코드를 추출할 수 없습니다."

        logger.info("Code fixed successfully with Claude API")
        return True, fixed_code, explanation

    except anthropic.APIError as e:
        logger.error(f"Claude API error: {e}")
        return False, None, f"API 오류: {str(e)}"
    except Exception as e:
        logger.error(f"Error fixing code: {e}")
        return False, None, f"오류 수정 실패: {str(e)}"


def _parse_response(content: str) -> Tuple[Optional[str], Optional[str]]:
    """API 응답에서 코드와 설명을 추출합니다."""
    try:
        # ```python ... ``` 블록 추출
        match = re.search(r"```python\s*\n(.*?)\n```", content, re.DOTALL)
        if not match:
            match = re.search(r"```\s*\n(.*?)\n```", content, re.DOTALL)

        if not match:
            return None, None

        fixed_code = match.group(1).strip()

        # 설명 추출 (코드 블록 이후)
        explanation_text = content[match.end():].strip()
        if not explanation_text:
            explanation_text = content[:match.start()].strip()

        # **수정 설명:** 이후 텍스트
        desc_match = re.search(r"\*\*수정 설명:\*\*\s*(.*)", explanation_text, re.DOTALL)
        if desc_match:
            explanation_text = desc_match.group(1).strip()

        return fixed_code, explanation_text or "AI 자동 수정"

    except Exception as e:
        logger.error(f"Error parsing response: {e}")
        return None, None
