#!/bin/bash
# Docker 백엔드 로그를 클립보드에 복사하는 스크립트

# 사용법 표시
show_usage() {
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -l, --lines N    최근 N줄만 복사 (기본: 전체)"
    echo "  -s, --server     원격 서버에서 가져오기"
    echo "  -h, --help       도움말 표시"
    echo ""
    echo "예제:"
    echo "  $0                           # 로컬 로그 전체 복사"
    echo "  $0 --lines 100               # 최근 100줄만 복사"
    echo "  $0 --server                  # 원격 서버 로그 복사"
}

# 기본값
LINES=""
SERVER=""

# 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--lines)
            LINES="--tail=$2"
            shift 2
            ;;
        -s|--server)
            SERVER="yes"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "알 수 없는 옵션: $1"
            show_usage
            exit 1
            ;;
    esac
done

# OS 감지
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLIP_CMD="pbcopy"
elif command -v xclip &> /dev/null; then
    CLIP_CMD="xclip -selection clipboard"
elif command -v xsel &> /dev/null; then
    CLIP_CMD="xsel --clipboard"
elif command -v clip.exe &> /dev/null; then
    CLIP_CMD="clip.exe"  # WSL
else
    echo "❌ 클립보드 도구를 찾을 수 없습니다."
    echo "다음 중 하나를 설치하세요: xclip, xsel, pbcopy"
    exit 1
fi

# 로그 가져오기
if [[ "$SERVER" == "yes" ]]; then
    echo "🌐 원격 서버에서 로그 가져오는 중..."
    ssh ubuntu@edupy.org "cd /app/edupy && docker compose logs $LINES backend" | eval $CLIP_CMD
else
    echo "💻 로컬에서 로그 가져오는 중..."
    docker compose logs $LINES backend | eval $CLIP_CMD
fi

if [[ $? -eq 0 ]]; then
    echo "✅ 로그가 클립보드에 복사되었습니다!"
    echo "📋 이제 Ctrl+V (또는 Cmd+V)로 붙여넣기 하세요."
else
    echo "❌ 로그 복사에 실패했습니다."
    exit 1
fi
