#!/bin/bash

# EduPy 프론트엔드 서버 자동 시작 스크립트 (핫 리로딩)

echo "🚀 EduPy 프론트엔드 서버를 시작합니다..."
echo ""

# 현재 디렉토리 확인
if [ ! -d "frontend" ]; then
    echo "❌ frontend 디렉토리를 찾을 수 없습니다."
    echo "   프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 프론트엔드 디렉토리로 이동
cd frontend

# Node.js 버전 확인
echo "📦 Node.js 버전:"
node --version
echo ""

# npm 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되지 않았습니다."
    echo "   Node.js를 먼저 설치해주세요."
    exit 1
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo "📚 의존성 패키지를 설치합니다..."
    npm install
    echo ""
fi

# 포트 5173이 사용 중인지 확인
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  포트 5173이 이미 사용 중입니다."
    echo "   기존 프로세스를 종료하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔄 기존 프로세스를 종료합니다..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo "❌ 서버 시작을 취소합니다."
        exit 1
    fi
fi

echo "🔥 핫 리로딩이 활성화된 상태로 서버를 시작합니다..."
echo "   파일 변경 시 자동으로 재로드됩니다."
echo ""
echo "📡 서버 주소: http://localhost:5173"
echo ""
echo "⏹️  종료하려면 Ctrl+C를 누르세요."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 서버 실행 (Vite 자동 핫 리로딩)
npm run dev

