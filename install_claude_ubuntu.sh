#!/bin/bash
# Ubuntu에 Claude API 환경 설치 스크립트

set -e

echo "======================================"
echo "Claude API 환경 설치 시작"
echo "======================================"

# Python 설치 확인
if ! command -v python3 &> /dev/null; then
    echo "Python3 설치 중..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
else
    echo "✓ Python3 이미 설치됨"
fi

# Anthropic SDK 설치
echo ""
echo "Anthropic Python SDK 설치 중..."
pip3 install --user anthropic

# CLI 도구 설치
echo ""
echo "Claude CLI 도구 설치 중..."

# claude_cli.py를 ~/bin으로 복사
mkdir -p ~/bin
cat > ~/bin/claude << 'EOFCLI'
#!/usr/bin/env python3
"""간단한 Claude CLI 도구"""

import os
import sys
import anthropic
from datetime import datetime

def get_api_key():
    """API 키 가져오기"""
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

def chat(model="claude-sonnet-4-5"):
    """대화형 모드"""
    client = anthropic.Anthropic(api_key=get_api_key())
    conversation = []

    print("=" * 60)
    print("Claude CLI - Interactive Mode")
    print("=" * 60)
    print(f"Model: {model}")
    print("Commands: /exit, /clear, /save")
    print("=" * 60)
    print()

    while True:
        try:
            user_input = input("You: ").strip()
            if not user_input:
                continue
            if user_input == "/exit":
                print("Goodbye!")
                break
            elif user_input == "/clear":
                conversation = []
                print("Conversation cleared!")
                continue
            elif user_input == "/save":
                filename = f"conversation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                with open(filename, 'w') as f:
                    for msg in conversation:
                        f.write(f"{msg['role'].upper()}: {msg['content']}\n\n")
                print(f"Saved to: {filename}")
                continue

            conversation.append({"role": "user", "content": user_input})
            print("\nClaude: ", end="", flush=True)

            response_text = ""
            with client.messages.stream(model=model, max_tokens=4096, messages=conversation) as stream:
                for text in stream.text_stream:
                    print(text, end="", flush=True)
                    response_text += text
            print("\n")

            conversation.append({"role": "assistant", "content": response_text})
        except KeyboardInterrupt:
            print("\n\nUse /exit to quit")
        except Exception as e:
            print(f"\nError: {str(e)}")

def one_shot(prompt, model="claude-sonnet-4-5"):
    """일회성 질문"""
    client = anthropic.Anthropic(api_key=get_api_key())
    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    print(message.content[0].text)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Claude CLI Tool")
    parser.add_argument("prompt", nargs="*", help="One-shot prompt")
    parser.add_argument("--model", default="claude-sonnet-4-5", help="Model to use")
    parser.add_argument("-i", "--interactive", action="store_true", help="Interactive mode")
    parser.add_argument("--configure", action="store_true", help="Configure API key")
    args = parser.parse_args()

    if args.configure:
        api_key = input("Enter your Anthropic API key: ").strip()
        config_file = os.path.expanduser("~/.claude_api_key")
        with open(config_file, 'w') as f:
            f.write(api_key)
        os.chmod(config_file, 0o600)
        print(f"API key saved to {config_file}")
        return

    if args.interactive or not args.prompt:
        chat(model=args.model)
    else:
        one_shot(" ".join(args.prompt), model=args.model)

if __name__ == "__main__":
    main()
EOFCLI

chmod +x ~/bin/claude

# PATH에 ~/bin 추가
if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/bin:$PATH"
fi

echo ""
echo "======================================"
echo "✓ 설치 완료!"
echo "======================================"
echo ""
echo "다음 단계:"
echo "1. API 키 설정:"
echo "   claude --configure"
echo "   (또는 export ANTHROPIC_API_KEY='your-key')"
echo ""
echo "2. 사용 방법:"
echo "   claude -i                    # 대화형 모드"
echo "   claude 'Hello, Claude!'      # 일회성 질문"
echo "   claude --model opus -i       # 다른 모델 사용"
echo ""
echo "3. 새 터미널 열기 또는:"
echo "   source ~/.bashrc"
echo ""
