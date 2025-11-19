#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔄 EduPy 프로젝트 동기화${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Git 상태 확인
echo -e "${YELLOW}📊 현재 Git 상태 확인 중...${NC}"
git status

echo ""
read -p "로컬 변경사항을 모두 삭제하고 원격 저장소와 동기화하시겠습니까? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}❌ 동기화가 취소되었습니다.${NC}"
    exit 1
fi

# 2. 원격 저장소 정보 가져오기
echo ""
echo -e "${YELLOW}🌐 원격 저장소 정보 가져오는 중...${NC}"
git fetch origin --prune

# 3. main 브랜치로 전환
echo -e "${YELLOW}🔀 main 브랜치로 전환 중...${NC}"
git checkout main

# 4. 로컬 변경사항 삭제 및 원격과 동기화
echo -e "${YELLOW}🔄 원격 저장소와 동기화 중...${NC}"
git reset --hard origin/main

# 5. 추적되지 않는 파일 삭제
echo -e "${YELLOW}🧹 추적되지 않는 파일 정리 중...${NC}"
git clean -fd

# 6. 최신 커밋 확인
echo ""
echo -e "${GREEN}✅ 동기화 완료!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 최신 커밋:${NC}"
git log --oneline -1
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 7. .env 파일 확인
echo ""
echo -e "${YELLOW}🔐 환경 변수 파일 확인 중...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}⚠️  backend/.env 파일이 없습니다!${NC}"
    echo -e "${YELLOW}📋 backend/.env.example을 복사하여 .env 파일을 생성하세요:${NC}"
    echo ""
    echo -e "  ${BLUE}cd backend${NC}"
    echo -e "  ${BLUE}cp .env.example .env${NC}"
    echo -e "  ${BLUE}# .env 파일을 열어서 실제 API 키를 입력하세요${NC}"
    echo ""
else
    echo -e "${GREEN}✅ backend/.env 파일이 존재합니다.${NC}"
fi

# 8. 의존성 확인
echo ""
echo -e "${YELLOW}📦 의존성 확인 중...${NC}"

# 백엔드 의존성
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}⚠️  백엔드 가상환경이 없습니다!${NC}"
    echo -e "${YELLOW}다음 명령어로 설치하세요:${NC}"
    echo ""
    echo -e "  ${BLUE}cd backend${NC}"
    echo -e "  ${BLUE}python -m venv venv${NC}"
    echo -e "  ${BLUE}source venv/bin/activate${NC}"
    echo -e "  ${BLUE}pip install -r requirements.txt${NC}"
    echo ""
else
    echo -e "${GREEN}✅ 백엔드 가상환경이 존재합니다.${NC}"
fi

# 프론트엔드 의존성
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}⚠️  프론트엔드 의존성이 설치되지 않았습니다!${NC}"
    echo -e "${YELLOW}다음 명령어로 설치하세요:${NC}"
    echo ""
    echo -e "  ${BLUE}cd frontend${NC}"
    echo -e "  ${BLUE}npm install --legacy-peer-deps${NC}"
    echo ""
else
    echo -e "${GREEN}✅ 프론트엔드 의존성이 설치되어 있습니다.${NC}"
fi

# 9. 완료 메시지
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 동기화가 완료되었습니다!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🚀 서버를 시작하려면:${NC}"
echo -e "  ${BLUE}./start-dev.sh${NC}"
echo ""

