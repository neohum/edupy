#!/bin/bash

# EduPy 개발 서버 통합 시작 스크립트
# 백엔드와 프론트엔드를 동시에 실행합니다 (핫 리로딩)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎓 EduPy 개발 환경을 시작합니다"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 프로젝트 루트 디렉토리 확인
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ backend 또는 frontend 디렉토리를 찾을 수 없습니다."
    echo "   프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 기존 프로세스 정리 함수
cleanup() {
    echo ""
    echo "🛑 서버를 종료합니다..."
    
    # 백엔드 프로세스 종료
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # 프론트엔드 프로세스 종료
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # 포트 정리
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    
    echo "✅ 모든 서버가 종료되었습니다."
    exit 0
}

# Ctrl+C 시그널 처리
trap cleanup SIGINT SIGTERM

# 기존 프로세스 확인 및 종료
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 || lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  포트 8000 또는 5173이 이미 사용 중입니다."
    echo "🔄 기존 프로세스를 종료합니다..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "📦 환경 확인 중..."
echo ""

# Python 확인
if ! command -v python &> /dev/null; then
    echo "❌ Python이 설치되지 않았습니다."
    exit 1
fi

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    exit 1
fi

echo "✅ Python: $(python --version)"
echo "✅ Node.js: $(node --version)"
echo ""

# 백엔드 의존성 확인
echo "🔍 백엔드 의존성 확인 중..."
cd backend
python -c "import fastapi, uvicorn, resend" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  백엔드 패키지를 설치합니다..."
    pip install -r requirements.txt
fi
cd ..

# 프론트엔드 의존성 확인
echo "🔍 프론트엔드 의존성 확인 중..."
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  프론트엔드 패키지를 설치합니다..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 서버를 시작합니다..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 백엔드 서버 시작 (백그라운드)
echo "🔧 백엔드 서버 시작 중... (포트 8000)"
cd backend
python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 백엔드 시작 대기
sleep 3

# 백엔드 상태 확인
if ! lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ 백엔드 서버 시작 실패"
    echo "   backend.log 파일을 확인해주세요."
    cat backend.log
    exit 1
fi

echo "✅ 백엔드 서버 실행 중 (PID: $BACKEND_PID)"
echo "   📡 http://localhost:8000"
echo "   📖 API 문서: http://localhost:8000/docs"
echo ""

# 프론트엔드 서버 시작 (백그라운드)
echo "⚛️  프론트엔드 서버 시작 중... (포트 5173)"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 프론트엔드 시작 대기
sleep 5

# 프론트엔드 상태 확인
if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ 프론트엔드 서버 시작 실패"
    echo "   frontend.log 파일을 확인해주세요."
    cat frontend.log
    cleanup
    exit 1
fi

echo "✅ 프론트엔드 서버 실행 중 (PID: $FRONTEND_PID)"
echo "   📡 http://localhost:5173"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 모든 서버가 실행되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔥 핫 리로딩이 활성화되어 있습니다."
echo "   파일 변경 시 자동으로 재시작/재로드됩니다."
echo ""
echo "📝 로그 파일:"
echo "   - 백엔드: backend.log"
echo "   - 프론트엔드: frontend.log"
echo ""
echo "⏹️  종료하려면 Ctrl+C를 누르세요."
echo ""

# 로그 실시간 출력 (선택사항)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 실시간 로그 (Ctrl+C로 종료)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 두 로그를 동시에 출력
tail -f backend.log frontend.log

