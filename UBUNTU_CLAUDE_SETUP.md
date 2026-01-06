# Ubuntu에서 Claude API 사용하기

## ⚠️ 중요 안내

**`@anthropics/claude-code`는 npm에 공개되지 않았습니다.**

대신 다음 방법으로 Claude API를 사용할 수 있습니다:

---

## 🚀 빠른 설치 (권장)

### Ubuntu/Lightsail에서 원클릭 설치

```bash
# 설치 스크립트 다운로드 및 실행
curl -sSL https://raw.githubusercontent.com/neohum/edupy/main/install_claude_ubuntu.sh | bash

# 또는 로컬에 있는 경우
cd ~/edupy
./install_claude_ubuntu.sh
```

### API 키 설정

```bash
# 대화형으로 설정
claude --configure

# 또는 환경 변수로 설정
export ANTHROPIC_API_KEY='your-api-key-here'
echo 'export ANTHROPIC_API_KEY="your-key"' >> ~/.bashrc
```

### 사용 방법

```bash
# 대화형 모드
claude -i

# 일회성 질문
claude "Python으로 Hello World 출력하는 방법"

# 다른 모델 사용
claude --model claude-opus-4-5 -i
```

---

## 📦 수동 설치

### 방법 1: Python SDK (권장)

```bash
# Python 및 pip 설치
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# Anthropic SDK 설치
pip3 install --user anthropic

# 테스트
python3 << EOF
import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
EOF
```

### 방법 2: TypeScript/JavaScript SDK

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 프로젝트 생성
mkdir claude-project && cd claude-project
npm init -y

# SDK 설치
npm install @anthropic-ai/sdk

# 사용 예제
cat > index.js << 'EOF'
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(message.content[0].text);
EOF

# 실행
export ANTHROPIC_API_KEY='your-key'
node index.js
```

---

## 🛠️ 커스텀 CLI 도구

프로젝트에 포함된 `backend/claude_cli.py`를 사용:

```bash
cd ~/edupy/backend

# API 키 설정
export ANTHROPIC_API_KEY='your-key'

# 실행
python3 claude_cli.py -i

# 도움말
python3 claude_cli.py --help
```

### 시스템 전역 설치

```bash
# ~/bin에 복사
mkdir -p ~/bin
cp ~/edupy/backend/claude_cli.py ~/bin/claude
chmod +x ~/bin/claude

# PATH 추가
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 이제 어디서든 사용 가능
claude -i
```

---

## 🔑 API 키 발급

1. https://console.anthropic.com/ 접속
2. 로그인 또는 회원가입
3. **Settings** → **API Keys**
4. **Create Key** 클릭
5. 키 복사 및 안전하게 보관

---

## 💡 사용 예제

### 대화형 모드

```bash
$ claude -i

============================================================
Claude CLI - Interactive Mode
============================================================
Model: claude-sonnet-4-5
Commands: /exit, /clear, /save
============================================================

You: Python으로 피보나치 수열 생성하는 함수 작성해줘

Claude: 다음은 Python으로 피보나치 수열을 생성하는 여러 가지 방법입니다:

1. 재귀 함수:
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)

2. 반복문 (더 효율적):
def fibonacci_iterative(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

...

You: /save
Saved to: conversation_20260106_012345.txt

You: /exit
Goodbye!
```

### 일회성 질문

```bash
$ claude "JavaScript에서 배열 정렬하는 방법"

JavaScript에서 배열을 정렬하는 방법은 다음과 같습니다:

1. sort() 메서드 사용:
const arr = [3, 1, 4, 1, 5, 9];
arr.sort((a, b) => a - b);  // 오름차순
console.log(arr);  // [1, 1, 3, 4, 5, 9]

...
```

---

## 🌐 서버(SSH) 환경에서 사용

### tmux 사용 (권장)

```bash
# tmux 설치
sudo apt install tmux -y

# 세션 시작
tmux new -s claude

# Claude 실행
claude -i

# 세션에서 나가기: Ctrl+B, D
# 세션 복귀: tmux attach -t claude
```

### 백그라운드 실행

```bash
# nohup 사용
nohup claude -i > claude.log 2>&1 &

# 로그 확인
tail -f claude.log
```

---

## 📊 모델 선택

| 모델 | 용도 | 속도 | 비용 |
|------|------|------|------|
| `claude-opus-4-5` | 복잡한 작업, 최고 성능 | 느림 | 높음 |
| `claude-sonnet-4-5` | 균형잡힌 성능 (기본) | 중간 | 중간 |
| `claude-haiku-4` | 빠른 응답, 간단한 작업 | 빠름 | 낮음 |

```bash
# 모델 지정
claude --model claude-opus-4-5 -i
claude --model claude-haiku-4 "간단한 질문"
```

---

## 🔧 문제 해결

### Python 패키지 설치 오류

```bash
# pip 업그레이드
python3 -m pip install --upgrade pip

# 가상 환경 사용
python3 -m venv ~/claude-env
source ~/claude-env/bin/activate
pip install anthropic
```

### API 키 오류

```bash
# API 키 확인
echo $ANTHROPIC_API_KEY

# ~/.claude_api_key 확인
cat ~/.claude_api_key

# 재설정
claude --configure
```

### 권한 오류

```bash
# 실행 권한 부여
chmod +x ~/bin/claude

# PATH 확인
echo $PATH | grep "$HOME/bin"

# PATH 재로드
source ~/.bashrc
```

---

## 📚 추가 리소스

- **Anthropic API 문서**: https://docs.anthropic.com/
- **Python SDK**: https://github.com/anthropics/anthropic-sdk-python
- **TypeScript SDK**: https://github.com/anthropics/anthropic-sdk-typescript
- **API 레퍼런스**: https://docs.anthropic.com/api/reference

---

## 🎯 빠른 참조

```bash
# 설치
curl -sSL https://raw.githubusercontent.com/neohum/edupy/main/install_claude_ubuntu.sh | bash

# 설정
claude --configure

# 사용
claude -i                              # 대화형
claude "질문"                          # 일회성
claude --model opus -i                 # 모델 변경
claude --help                          # 도움말

# 대화 저장
(대화 중) /save

# 종료
(대화 중) /exit
```

---

**작성일**: 2026-01-06
**버전**: 1.0.0
