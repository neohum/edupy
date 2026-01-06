# Ubuntu에서 Claude API 사용 및 개발 환경 설정 가이드

## ⚠️ 중요: Claude Code CLI는 현재 공개 배포되지 않음

Claude Code CLI는 아직 npm 레지스트리에 공개되지 않았습니다. 대신 다음 방법들을 사용할 수 있습니다:

## 방법 1: Anthropic Python SDK 사용 (권장)

### 1. Python 및 pip 설치

```bash
# Python 3.10+ 설치
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# 버전 확인
python3 --version
```

### 2. Anthropic SDK 설치

```bash
# 가상 환경 생성 (권장)
python3 -m venv claude-env
source claude-env/bin/activate

# Anthropic SDK 설치
pip install anthropic

# 설치 확인
python -c "import anthropic; print(anthropic.__version__)"
```

### 3. API 사용 예제

```python
# test_claude.py
import anthropic
import os

client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

```bash
# 실행
export ANTHROPIC_API_KEY="your-api-key"
python test_claude.py
```

## 방법 2: TypeScript/JavaScript SDK 사용

### 1. Node.js 설치

```bash
# Node.js 20.x LTS 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 2. Anthropic SDK 설치

```bash
# 프로젝트 디렉토리 생성
mkdir claude-project
cd claude-project
npm init -y

# Anthropic SDK 설치
npm install @anthropic-ai/sdk

# TypeScript 사용 시
npm install -D typescript @types/node
npx tsc --init
```

### 3. TypeScript 예제

```typescript
// index.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'Hello, Claude!' }
    ],
  });

  console.log(message.content[0].text);
}

main();
```

```bash
# 실행
export ANTHROPIC_API_KEY="your-api-key"
npx tsx index.ts
```

## 방법 3: Claude Desktop (GUI)

Ubuntu에서는 공식 .deb 패키지가 없지만 다음 방법으로 사용 가능:

```bash
# AppImage 다운로드 (있는 경우)
# 또는 Snap 패키지
# 현재 Linux용 Claude Desktop은 제한적으로 배포됨
```

## 방법 4: 커스텀 CLI 도구 만들기

## API 키 설정

### 1. Anthropic API 키 발급

1. https://console.anthropic.com/ 접속
2. 로그인 또는 회원가입
3. Settings → API Keys
4. "Create Key" 클릭
5. API 키 복사

### 2. API 키 설정 방법

#### 방법 A: 환경 변수 (권장)

```bash
# .bashrc 또는 .zshrc에 추가
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# 확인
echo $ANTHROPIC_API_KEY
```

#### 방법 B: Claude Code 설정 파일

```bash
# 설정 디렉토리 생성
mkdir -p ~/.config/claude-code

# API 키 저장
echo "your-api-key-here" > ~/.config/claude-code/api-key

# 또는 대화형으로 설정
claude --configure
```

#### 방법 C: .env 파일

```bash
# 프로젝트 디렉토리에 .env 파일 생성
cat > .env << EOF
ANTHROPIC_API_KEY=your-api-key-here
EOF
```

## 기본 사용법

```bash
# Claude Code 시작
claude

# 특정 디렉토리에서 시작
claude /path/to/project

# 특정 모델 지정
claude --model opus
claude --model sonnet
claude --model haiku

# 도움말
claude --help

# 버전 확인
claude --version
```

## 서버 환경에서 사용 (SSH)

### tmux 사용 (권장)

```bash
# tmux 설치
sudo apt install tmux -y

# tmux 세션 시작
tmux new -s claude

# Claude 실행
claude

# tmux 세션에서 나가기 (Ctrl+B, D)
# 세션 복귀
tmux attach -t claude
```

### screen 사용

```bash
# screen 설치
sudo apt install screen -y

# screen 세션 시작
screen -S claude

# Claude 실행
claude

# 세션에서 나가기 (Ctrl+A, D)
# 세션 복귀
screen -r claude
```

## SSH를 통한 원격 사용

### 로컬에서 원격 서버의 Claude 사용

```bash
# SSH로 접속
ssh user@your-server-ip

# tmux 세션에서 Claude 실행
tmux new -s claude
claude

# 로컬로 터미널 출력 포워딩 (선택사항)
```

### VS Code Remote SSH

1. VS Code에서 Remote SSH 확장 설치
2. 서버에 연결
3. 내장 터미널에서 `claude` 실행

## 문제 해결

### Node.js 버전 오류

```bash
# Node.js 버전 확인 (최소 18.x 필요)
node --version

# 업그레이드 필요 시
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

### 권한 오류

```bash
# npm 전역 디렉토리 권한 설정
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 재설치
npm install -g @anthropics/claude-code
```

### API 키 오류

```bash
# API 키 확인
echo $ANTHROPIC_API_KEY

# API 키 재설정
claude --configure

# 또는 환경 변수 다시 설정
export ANTHROPIC_API_KEY="your-new-api-key"
```

### 네트워크 오류 (방화벽)

```bash
# Anthropic API 접근 확인
curl -I https://api.anthropic.com

# 프록시 설정 (필요한 경우)
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

## 고급 설정

### 자동 완성 설정

```bash
# Bash
claude --completion bash >> ~/.bashrc
source ~/.bashrc

# Zsh
claude --completion zsh >> ~/.zshrc
source ~/.zshrc
```

### 설정 파일 커스터마이징

```bash
# 설정 파일 위치
~/.config/claude-code/config.json

# 예시 설정
{
  "model": "claude-sonnet-4-5",
  "temperature": 0.7,
  "max_tokens": 4096,
  "editor": "vim"
}
```

### 로그 설정

```bash
# 로그 활성화
export CLAUDE_LOG_LEVEL=debug

# 로그 파일 위치
~/.config/claude-code/logs/
```

## 성능 최적화

### 캐시 설정

```bash
# 캐시 디렉토리 설정
export CLAUDE_CACHE_DIR=~/.cache/claude-code

# 캐시 크기 제한 (MB)
export CLAUDE_CACHE_SIZE=1024
```

### 메모리 제한 (서버 환경)

```bash
# Node.js 메모리 제한
export NODE_OPTIONS="--max-old-space-size=4096"

# Claude 실행
claude
```

## 업데이트

```bash
# NPM 설치 버전 업데이트
sudo npm update -g @anthropics/claude-code

# 또는 재설치
sudo npm uninstall -g @anthropics/claude-code
sudo npm install -g @anthropics/claude-code

# 버전 확인
claude --version
```

## 제거

```bash
# NPM 설치 버전 제거
sudo npm uninstall -g @anthropics/claude-code

# 설정 파일 제거
rm -rf ~/.config/claude-code
rm -rf ~/.cache/claude-code

# 환경 변수 제거
# ~/.bashrc에서 ANTHROPIC_API_KEY 라인 삭제
```

## 유용한 팁

### 1. 별칭 설정

```bash
# ~/.bashrc에 추가
alias c='claude'
alias cs='claude --model sonnet'
alias co='claude --model opus'

source ~/.bashrc
```

### 2. 프로젝트별 설정

```bash
# 프로젝트 디렉토리에 .claude 파일 생성
cat > .claude << EOF
{
  "model": "claude-sonnet-4-5",
  "context_files": ["README.md", "src/**/*.py"]
}
EOF
```

### 3. 백그라운드 실행

```bash
# nohup 사용
nohup claude &

# 또는 systemd 서비스로 등록
sudo nano /etc/systemd/system/claude.service
```

### 4. Docker 컨테이너에서 실행

```dockerfile
FROM node:20-alpine

RUN npm install -g @anthropics/claude-code

ENV ANTHROPIC_API_KEY=your-api-key-here

CMD ["claude"]
```

## AWS Lightsail 특정 설정

```bash
# Lightsail 인스턴스 접속
ssh -i your-key.pem ubuntu@your-lightsail-ip

# Claude 설치
sudo npm install -g @anthropics/claude-code

# API 키 설정
export ANTHROPIC_API_KEY="your-api-key"

# tmux에서 실행
tmux new -s claude
claude
```

## 참고 자료

- 공식 문서: https://docs.anthropic.com/claude/docs
- GitHub: https://github.com/anthropics/claude-code
- API 문서: https://docs.anthropic.com/api
- 커뮤니티: https://discord.gg/anthropic

---

**빠른 시작**:
```bash
# 1줄 설치 및 실행
sudo npm install -g @anthropics/claude-code && claude
```

**주의사항**:
- API 키를 안전하게 보관하세요
- `.env` 파일을 git에 커밋하지 마세요
- 서버에서는 tmux/screen 사용을 권장합니다
