# AWS Lightsail에 Node.js 최신 버전 설치 가이드

## 1. Lightsail 인스턴스 SSH 접속

```bash
# AWS Lightsail 콘솔에서 SSH 키 다운로드 후
ssh -i your-key.pem ubuntu@your-lightsail-ip
# 또는 Lightsail 콘솔에서 브라우저 기반 SSH 사용
```

## 2. Node.js 최신 버전 설치 (NodeSource 사용)

### Ubuntu/Debian 계열

```bash
# 시스템 업데이트
sudo apt update
sudo apt upgrade -y

# Node.js 21.x (최신 Current 버전) 설치
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
sudo apt-get install -y nodejs

# 또는 Node.js 20.x (LTS 버전) 설치 - 권장
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 설치 확인
node --version
npm --version
```

### Amazon Linux 2

```bash
# 시스템 업데이트
sudo yum update -y

# Node.js 20.x (LTS) 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 설치 확인
node --version
npm --version
```

## 3. NVM 사용 (권장)

NVM(Node Version Manager)을 사용하면 여러 Node.js 버전을 쉽게 관리할 수 있습니다.

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 환경 변수 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# .bashrc에 추가 (재부팅 후에도 사용 가능)
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

# 최신 LTS 버전 설치
nvm install --lts

# 또는 특정 버전 설치
nvm install 20
nvm install 21

# 기본 버전 설정
nvm use --lts
nvm alias default node

# 설치된 버전 확인
nvm list
node --version
```

## 4. 추가 도구 설치

```bash
# Yarn 설치 (선택사항)
npm install -g yarn

# PM2 설치 (프로세스 관리자)
npm install -g pm2

# pnpm 설치 (선택사항)
npm install -g pnpm
```

## 5. EduPy 프로젝트 배포

```bash
# Git 설치 (없는 경우)
sudo apt install git -y  # Ubuntu/Debian
# sudo yum install git -y  # Amazon Linux

# 프로젝트 클론
cd ~
git clone https://github.com/neohum/edupy.git
cd edupy

# 백엔드 설정
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 프론트엔드 빌드
cd ../frontend
npm install
npm run build

# 또는 yarn 사용
yarn install
yarn build
```

## 6. Python 및 백엔드 설정

```bash
# Python 3.10+ 설치 (Ubuntu 22.04 이상은 기본 포함)
sudo apt install python3 python3-pip python3-venv -y

# 필요한 시스템 패키지 설치
sudo apt install -y libgdk-pixbuf2.0-0 libcairo2-dev pkg-config
```

## 7. PM2로 애플리케이션 실행

### 백엔드 (FastAPI)

```bash
cd ~/edupy/backend

# PM2 ecosystem 파일 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'edupy-backend',
    script: 'venv/bin/uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/ubuntu/edupy/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      ENVIRONMENT: 'production',
      DEBUG: 'false'
    }
  }]
}
EOF

# PM2로 실행
pm2 start ecosystem.config.js

# PM2 상태 확인
pm2 status
pm2 logs edupy-backend

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### 프론트엔드 (Vite 프리뷰 서버)

```bash
cd ~/edupy/frontend

# 프로덕션 모드로 실행
pm2 start npm --name "edupy-frontend" -- run preview -- --host 0.0.0.0 --port 5173

# 또는 정적 파일 서버 사용 (권장)
npm install -g serve
pm2 start serve --name "edupy-frontend" -- -s dist -l 5173
```

## 8. Nginx 리버스 프록시 설정 (선택사항)

```bash
# Nginx 설치
sudo apt install nginx -y

# Nginx 설정
sudo nano /etc/nginx/sites-available/edupy

# 다음 내용 추가:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 지원
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/edupy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. 방화벽 설정 (Lightsail)

AWS Lightsail 콘솔에서:
1. 인스턴스 선택
2. "네트워킹" 탭
3. 방화벽 규칙 추가:
   - HTTP (80)
   - HTTPS (443)
   - Custom TCP (8000) - 백엔드 직접 접근
   - Custom TCP (5173) - 프론트엔드 직접 접근 (개발용)

## 10. 환경 변수 설정

```bash
cd ~/edupy/backend

# .env 파일 생성
nano .env
```

```env
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-domain.com,http://your-lightsail-ip
RESEND_API_KEY=your-api-key
JWT_SECRET=your-secret-key-here
```

## 11. SSL/HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 12. 유용한 명령어

```bash
# PM2 관리
pm2 list                  # 실행 중인 앱 목록
pm2 logs                  # 로그 확인
pm2 restart all           # 모든 앱 재시작
pm2 stop all              # 모든 앱 중지
pm2 delete all            # 모든 앱 제거

# 시스템 모니터링
pm2 monit                 # 실시간 모니터링
htop                      # 시스템 리소스 확인
df -h                     # 디스크 사용량

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t             # 설정 테스트
```

## 13. 데이터베이스 백업 스크립트

```bash
# 백업 스크립트 생성
cat > ~/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
cp ~/edupy/backend/edupy.db $BACKUP_DIR/edupy_$DATE.db
# 30일 이상 된 백업 삭제
find $BACKUP_DIR -name "edupy_*.db" -mtime +30 -delete
EOF

chmod +x ~/backup_db.sh

# Cron 작업 추가 (매일 새벽 3시)
crontab -e
# 다음 라인 추가:
# 0 3 * * * /home/ubuntu/backup_db.sh
```

## 14. 성능 모니터링

```bash
# PM2 Plus (무료) 연동
pm2 link your-secret-key your-public-key

# 또는 로컬 모니터링
pm2 install pm2-logrotate  # 로그 로테이션
```

## 트러블슈팅

### Node.js 설치 오류
```bash
# 기존 Node.js 완전 제거
sudo apt remove nodejs npm -y
sudo apt autoremove -y
# 재설치
```

### 포트 충돌
```bash
# 특정 포트 사용 중인 프로세스 확인
sudo lsof -i :8000
sudo lsof -i :5173
# 프로세스 종료
sudo kill -9 <PID>
```

### PM2 앱이 재시작되지 않음
```bash
pm2 unstartup
pm2 startup
pm2 save
```

## 빠른 시작 스크립트

```bash
# 전체 자동 설치 스크립트
cat > ~/install.sh << 'EOF'
#!/bin/bash
set -e

echo "=== EduPy Lightsail 설치 시작 ==="

# Node.js LTS 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 필수 패키지 설치
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git nginx \
    libgdk-pixbuf2.0-0 libcairo2-dev pkg-config

# PM2 설치
sudo npm install -g pm2

# 프로젝트 클론
git clone https://github.com/neohum/edupy.git ~/edupy

# 백엔드 설정
cd ~/edupy/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python optimize_database.py

# 프론트엔드 빌드
cd ~/edupy/frontend
npm install
npm run build

echo "=== 설치 완료! ==="
echo "다음 단계:"
echo "1. backend/.env 파일 설정"
echo "2. PM2로 앱 실행: pm2 start ecosystem.config.js"
echo "3. Nginx 설정"
EOF

chmod +x ~/install.sh
```

---

**참고**:
- Node.js 20.x (LTS)가 프로덕션 환경에 권장됩니다
- Lightsail 최소 사양: 2GB RAM 이상 권장
- 정기적인 백업과 모니터링을 설정하세요
