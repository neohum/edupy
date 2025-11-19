"""
자동 오류 수정 모듈
OpenAI API를 사용하여 Python 코드의 오류를 자동으로 분석하고 수정합니다.
"""

import os
import requests
import logging
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)

# OpenAI API 설정 (Augment 대신 OpenAI 사용)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_URL = "https://api.openai.com/v1"

# 하위 호환성을 위해 AUGMENT_API_KEY도 확인
if not OPENAI_API_KEY:
    OPENAI_API_KEY = os.getenv("AUGMENT_API_KEY", "")


def fix_code_with_augment(code: str, error_message: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    OpenAI API를 사용하여 코드를 자동으로 수정합니다.

    Args:
        code: 오류가 있는 Python 코드
        error_message: 발생한 오류 메시지

    Returns:
        Tuple[bool, Optional[str], Optional[str]]:
            - 성공 여부
            - 수정된 코드 (성공 시)
            - 설명 또는 오류 메시지
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your-augment-api-key-here":
        logger.warning("OpenAI API key not configured")
        return False, None, "OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 설정해주세요."
    
    try:
        # OpenAI API 요청 준비
        prompt = f"""다음 Python 코드에 오류가 있습니다. 오류를 수정해주세요.

**오류 메시지:**
```
{error_message}
```

**원본 코드:**
```python
{code}
```

**요구사항:**
1. 오류를 수정한 완전한 코드를 제공해주세요
2. 수정 내용을 간단히 설명해주세요
3. 코드는 Python 초보자가 이해할 수 있도록 간단하게 작성해주세요

**응답 형식:**
```python
# 수정된 코드
[수정된 코드를 여기에 작성]
```

**수정 설명:**
[수정 내용 설명]
"""

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "gpt-4o-mini",  # 빠르고 저렴한 모델
            "messages": [
                {
                    "role": "system",
                    "content": "당신은 Python 코드 오류를 수정하는 전문가입니다. 초보자가 이해하기 쉽게 설명해주세요."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,  # 낮은 temperature로 일관된 결과
            "max_tokens": 2000
        }

        # API 호출
        response = requests.post(
            f"{OPENAI_API_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
            return False, None, f"API 오류: {response.status_code}"

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not content:
            return False, None, "API 응답이 비어있습니다."

        # 응답에서 코드와 설명 추출
        fixed_code, explanation = parse_augment_response(content)

        if not fixed_code:
            return False, None, "수정된 코드를 추출할 수 없습니다."

        logger.info(f"Code fixed successfully with OpenAI API")
        return True, fixed_code, explanation

    except requests.exceptions.Timeout:
        logger.error("OpenAI API timeout")
        return False, None, "API 요청 시간 초과"
    except Exception as e:
        logger.error(f"Error fixing code with OpenAI: {str(e)}")
        return False, None, f"오류 수정 실패: {str(e)}"


def parse_augment_response(content: str) -> Tuple[Optional[str], Optional[str]]:
    """
    OpenAI API 응답에서 코드와 설명을 추출합니다.

    Args:
        content: API 응답 내용

    Returns:
        Tuple[Optional[str], Optional[str]]: (수정된 코드, 설명)
    """
    try:
        # 코드 블록 추출
        code_start = content.find("```python")
        if code_start == -1:
            code_start = content.find("```")

        if code_start == -1:
            return None, None

        code_start = content.find("\n", code_start) + 1
        code_end = content.find("```", code_start)

        if code_end == -1:
            return None, None

        fixed_code = content[code_start:code_end].strip()

        # 설명 추출
        explanation_start = content.find("**수정 설명:**")
        if explanation_start == -1:
            explanation_start = content.find("수정 설명:")
        if explanation_start == -1:
            explanation_start = content.find("설명:")

        explanation = ""
        if explanation_start != -1:
            explanation = content[explanation_start:].strip()
        else:
            # 설명이 없으면 전체 응답을 설명으로 사용
            explanation = content

        return fixed_code, explanation

    except Exception as e:
        logger.error(f"Error parsing OpenAI response: {str(e)}")
        return None, None

