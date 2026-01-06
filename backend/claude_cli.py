#!/usr/bin/env python3
"""
간단한 Claude CLI 도구
Ubuntu/Linux 환경에서 터미널로 Claude와 대화하기
"""

import os
import sys
import anthropic
from datetime import datetime

def get_api_key():
    """환경 변수 또는 설정 파일에서 API 키 가져오기"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        config_file = os.path.expanduser("~/.claude_api_key")
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                api_key = f.read().strip()

    if not api_key:
        print("Error: ANTHROPIC_API_KEY not found!")
        print("Set it with: export ANTHROPIC_API_KEY='your-key'")
        print("Or save it to: ~/.claude_api_key")
        sys.exit(1)

    return api_key

def chat(model="claude-sonnet-4-5", max_tokens=4096):
    """대화형 Claude CLI"""
    client = anthropic.Anthropic(api_key=get_api_key())

    conversation_history = []

    print("=" * 60)
    print("Claude CLI - Interactive Mode")
    print("=" * 60)
    print(f"Model: {model}")
    print("Commands: /exit, /clear, /model, /save")
    print("=" * 60)
    print()

    while True:
        try:
            # 사용자 입력
            user_input = input("You: ").strip()

            if not user_input:
                continue

            # 명령어 처리
            if user_input == "/exit":
                print("Goodbye!")
                break

            elif user_input == "/clear":
                conversation_history = []
                print("Conversation cleared!")
                continue

            elif user_input.startswith("/model"):
                parts = user_input.split()
                if len(parts) > 1:
                    model = parts[1]
                print(f"Model changed to: {model}")
                continue

            elif user_input == "/save":
                filename = f"conversation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                with open(filename, 'w') as f:
                    for msg in conversation_history:
                        f.write(f"{msg['role'].upper()}: {msg['content']}\n\n")
                print(f"Conversation saved to: {filename}")
                continue

            # 대화 기록에 추가
            conversation_history.append({
                "role": "user",
                "content": user_input
            })

            # Claude API 호출
            print("\nClaude: ", end="", flush=True)

            response_text = ""
            with client.messages.stream(
                model=model,
                max_tokens=max_tokens,
                messages=conversation_history
            ) as stream:
                for text in stream.text_stream:
                    print(text, end="", flush=True)
                    response_text += text

            print("\n")

            # 응답을 대화 기록에 추가
            conversation_history.append({
                "role": "assistant",
                "content": response_text
            })

        except KeyboardInterrupt:
            print("\n\nUse /exit to quit")
            continue
        except Exception as e:
            print(f"\nError: {str(e)}")
            continue

def one_shot(prompt, model="claude-sonnet-4-5"):
    """일회성 질문"""
    client = anthropic.Anthropic(api_key=get_api_key())

    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    print(message.content[0].text)

def main():
    """메인 함수"""
    import argparse

    parser = argparse.ArgumentParser(description="Claude CLI Tool")
    parser.add_argument("prompt", nargs="*", help="One-shot prompt")
    parser.add_argument("--model", default="claude-sonnet-4-5",
                       choices=["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4"],
                       help="Claude model to use")
    parser.add_argument("--interactive", "-i", action="store_true",
                       help="Interactive mode")
    parser.add_argument("--configure", action="store_true",
                       help="Configure API key")

    args = parser.parse_args()

    # API 키 설정
    if args.configure:
        api_key = input("Enter your Anthropic API key: ").strip()
        config_file = os.path.expanduser("~/.claude_api_key")
        with open(config_file, 'w') as f:
            f.write(api_key)
        os.chmod(config_file, 0o600)
        print(f"API key saved to {config_file}")
        return

    # 대화형 모드
    if args.interactive or not args.prompt:
        chat(model=args.model)
    else:
        # 일회성 모드
        prompt = " ".join(args.prompt)
        one_shot(prompt, model=args.model)

if __name__ == "__main__":
    main()
