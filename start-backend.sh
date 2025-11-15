#!/bin/bash

# EduPy 백엔드 서버 자동 시작 스크립트 (핫 리로딩)

echo "🚀 EduPy 백엔드 서버를 시작합니다..."
echo ""

# 현재 디렉토리 확인
if [ ! -d "backend" ]; then
    echo "❌ backend 디렉토리를 찾을 수 없습니다."
    echo "   프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 가상환경 활성화 (있는 경우)
if [ -d "backend/venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source backend/venv/bin/activate
fi

# .env 파일 확인
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env 파일이 없습니다. 루트의 .env를 사용합니다."
fi

# 백엔드 디렉토리로 이동
cd backend

# Python 버전 확인
echo "🐍 Python 버전:"
python --version
echo ""

# 필요한 패키지 확인
echo "📚 필수 패키지 확인 중..."
python -c "import fastapi, uvicorn, resend" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  필수 패키지가 설치되지 않았습니다."
    echo "   pip install -r requirements.txt 를 실행해주세요."
    exit 1
fi

echo "✅ 모든 패키지가 설치되어 있습니다."
echo ""

# 포트 8000이 사용 중인지 확인
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  포트 8000이 이미 사용 중입니다."
    echo "   기존 프로세스를 종료하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔄 기존 프로세스를 종료합니다..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo "❌ 서버 시작을 취소합니다."
        exit 1
    fi
fi

echo "🔥 핫 리로딩이 활성화된 상태로 서버를 시작합니다..."
echo "   파일 변경 시 자동으로 재시작됩니다."
echo ""
echo "📡 서버 주소: http://localhost:8000"
echo "📖 API 문서: http://localhost:8000/docs"
echo ""
echo "⏹️  종료하려면 Ctrl+C를 누르세요."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 서버 실행 (핫 리로딩 활성화)
python main.py

