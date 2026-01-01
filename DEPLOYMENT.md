# AWS Lightsail + GitHub Actions CI/CD 배포 가이드

## 목차
1. [사전 준비](#1-사전-준비)
2. [AWS Lightsail 인스턴스 생성](#2-aws-lightsail-인스턴스-생성)
3. [서버 초기 설정](#3-서버-초기-설정)
4. [Docker 설치 및 설정](#4-docker-설치-및-설정)
5. [GitHub Secrets 설정](#5-github-secrets-설정)
6. [GitHub Actions 워크플로우 설정](#6-github-actions-워크플로우-설정)
7. [도메인 및 SSL 설정](#7-도메인-및-ssl-설정)
8. [배포 테스트](#8-배포-테스트)

---

## 1. 사전 준비

### 필요한 것들
- AWS 계정
- GitHub 계정 및 저장소
- 도메인 (선택사항, 권장)
- SSH 키 페어

### 로컬에서 SSH 키 생성 (없는 경우)
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/lightsail_key
```

---

## 2. AWS Lightsail 인스턴스 생성

### 2.1 AWS Console 접속
1. https://lightsail.aws.amazon.com 접속
2. AWS 계정으로 로그인

### 2.2 인스턴스 생성
1. **"Create instance"** 클릭
2. **리전 선택**: `Seoul (ap-northeast-2)` 권장
3. **플랫폼 선택**: `Linux/Unix`
4. **블루프린트 선택**: `OS Only` → `Ubuntu 22.04 LTS`
5. **SSH 키 페어**:
   - 기존 키 사용 또는 새 키 생성
   - 새 키 생성 시 반드시 다운로드하여 안전하게 보관

### 2.3 인스턴스 플랜 선택
- **권장**: `$10/월` (2GB RAM, 1 vCPU, 60GB SSD)
- 트래픽이 많으면: `$20/월` (4GB RAM, 2 vCPU)

### 2.4 인스턴스 이름 설정
```
edupy-production
```

### 2.5 인스턴스 생성 완료
- "Create instance" 클릭
- 2-3분 후 인스턴스가 Running 상태가 됨

### 2.6 고정 IP 할당 (중요!)
1. **Networking** 탭 클릭
2. **"Create static IP"** 클릭
3. 이름: `edupy-static-ip`
4. 인스턴스에 연결
5. 할당된 IP 주소 기록: `___.___.___.__`

### 2.7 방화벽 규칙 추가
Networking 탭에서 다음 포트 열기:
| 포트 | 용도 |
|------|------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 8000 | Backend API (개발 시) |

---

## 3. 서버 초기 설정

### 3.1 SSH 접속
```bash
# Lightsail 콘솔에서 다운로드한 키 사용
chmod 400 ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@YOUR_STATIC_IP
```

### 3.2 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.3 필수 패키지 설치
```bash
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nginx \
    certbot \
    python3-certbot-nginx
```

### 3.4 배포 사용자 생성 (선택사항)
```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# SSH 키 설정
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 4. Docker 설치 및 설정

### 4.1 Docker 설치
```bash
# Docker GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 설치
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# Docker 서비스 시작
sudo systemctl enable docker
sudo systemctl start docker
```

### 4.2 Docker 설치 확인
```bash
# 로그아웃 후 다시 로그인
exit
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@YOUR_STATIC_IP

# 확인
docker --version
docker compose version
```

### 4.3 애플리케이션 디렉토리 생성
```bash
sudo mkdir -p /app/edupy
sudo chown -R $USER:$USER /app/edupy
```

---

## 5. GitHub Secrets 설정

### 5.1 GitHub 저장소에서 Secrets 추가
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **"New repository secret"** 클릭하여 다음 항목 추가:

| Secret Name | 값 | 설명 |
|-------------|---|------|
| `LIGHTSAIL_HOST` | 고정 IP 주소 | 예: `13.124.xxx.xxx` |
| `LIGHTSAIL_USERNAME` | `ubuntu` | SSH 사용자명 |
| `LIGHTSAIL_SSH_KEY` | SSH 개인키 내용 | 아래 참조 |
| `RESEND_API_KEY` | Resend API 키 | 이메일 발송용 |
| `ERROR_REPORT_EMAIL` | 오류 수신 이메일 | 예: `admin@edupy.dev` |
| `FROM_EMAIL` | 발신 이메일 | 예: `noreply@edupy.dev` |
| `ADMIN_USERNAME` | 관리자 ID | 예: `admin` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | 강력한 비밀번호 |

### 5.2 SSH 키 등록 방법

**로컬에서 실행:**
```bash
# Lightsail에서 다운로드한 키 내용 복사
cat ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem
```

전체 내용을 복사하여 `LIGHTSAIL_SSH_KEY` secret에 붙여넣기:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

---

## 6. GitHub Actions 워크플로우 설정

### 6.1 워크플로우 파일 생성
`.github/workflows/deploy.yml` 파일이 자동으로 생성됩니다.

### 6.2 배포 트리거
- `main` 브랜치에 push 시 자동 배포
- 수동 배포: Actions 탭 → "Deploy to Lightsail" → "Run workflow"

---

## 7. 도메인 및 SSL 설정

### 7.1 도메인 DNS 설정
도메인 관리 사이트에서 A 레코드 추가:
```
Type: A
Name: @ (또는 www)
Value: YOUR_STATIC_IP
TTL: 300
```

### 7.2 Nginx 설정 (서버에서)
```bash
sudo nano /etc/nginx/sites-available/edupy
```

```nginx
server {
    listen 80;
    server_name edupy.dev www.edupy.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/edupy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3 SSL 인증서 발급 (Let's Encrypt)
```bash
sudo certbot --nginx -d edupy.dev -d www.edupy.dev
```

자동 갱신 확인:
```bash
sudo certbot renew --dry-run
```

---

## 8. 배포 테스트

### 8.1 수동 배포 테스트
1. GitHub 저장소 → **Actions** 탭
2. **"Deploy to Lightsail"** 워크플로우 선택
3. **"Run workflow"** 클릭
4. 배포 로그 확인

### 8.2 자동 배포 테스트
```bash
# 로컬에서
git add .
git commit -m "test: CI/CD deployment"
git push origin main
```

### 8.3 배포 확인
```bash
# 서버에서
docker ps
docker logs edupy-frontend
docker logs edupy-backend
```

### 8.4 웹사이트 확인
- Frontend: `https://edupy.dev`
- Backend API: `https://edupy.dev/api/health`

---

## 문제 해결

### 컨테이너 로그 확인
```bash
docker logs -f edupy-frontend
docker logs -f edupy-backend
```

### 컨테이너 재시작
```bash
cd /app/edupy
docker compose restart
```

### 전체 재배포
```bash
cd /app/edupy
docker compose down
docker compose pull
docker compose up -d
```

### 디스크 정리
```bash
docker system prune -af
```

---

## 비용 예상

| 항목 | 월 비용 |
|------|--------|
| Lightsail 인스턴스 ($10 플랜) | $10 |
| 고정 IP (인스턴스 연결 시 무료) | $0 |
| 도메인 (연간 $10-15) | ~$1 |
| **합계** | **~$11/월** |

---

## 다음 단계

1. 모니터링 설정 (Lightsail 알람)
2. 백업 스냅샷 자동화
3. 로그 관리 (CloudWatch 또는 자체 솔루션)
4. 성능 최적화 (CDN 추가 등)
