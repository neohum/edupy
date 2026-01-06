# edupy.org 연결 문제 해결 가이드

## 1단계: 도메인 DNS 확인

### 로컬에서 DNS 확인

```bash
# 도메인이 IP로 해석되는지 확인
nslookup edupy.org

# 또는
dig edupy.org

# 또는
ping edupy.org
```

**예상 결과**:
- ✅ IP 주소가 반환됨 → DNS 설정 완료
- ❌ "NXDOMAIN" 또는 타임아웃 → DNS 미설정

### DNS 설정 (아직 안 한 경우)

도메인 등록업체 (예: Namecheap, GoDaddy, Gabia 등)에서:

1. DNS 관리 페이지 접속
2. A 레코드 추가:
   ```
   Type: A
   Host: @
   Value: [Lightsail IP 주소]
   TTL: 자동 또는 3600
   ```
3. www 서브도메인 추가 (선택):
   ```
   Type: A
   Host: www
   Value: [Lightsail IP 주소]
   ```

**DNS 전파 시간**: 5분 ~ 48시간 (보통 1-2시간)

---

## 2단계: Lightsail 인스턴스 확인

### SSH 접속 확인

```bash
# Lightsail IP로 직접 접속
ssh -i your-key.pem ubuntu@[LIGHTSAIL-IP]

# 또는 Lightsail 콘솔에서 브라우저 기반 SSH 사용
```

### 서버 상태 확인

```bash
# 시스템 가동 시간
uptime

# 메모리 사용량
free -h

# 디스크 사용량
df -h
```

---

## 3단계: 방화벽 설정 확인

### Lightsail 방화벽 (콘솔에서)

AWS Lightsail 콘솔:
1. 인스턴스 선택
2. **네트워킹** 탭
3. 방화벽 규칙 확인:

**필수 규칙**:
```
SSH (22)     - TCP  - 22
HTTP (80)    - TCP  - 80
HTTPS (443)  - TCP  - 443
```

### 서버 방화벽 (UFW) 확인

```bash
# UFW 상태 확인
sudo ufw status

# 비활성화된 경우 포트 열기
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4단계: 애플리케이션 실행 확인

### 백엔드 (FastAPI) 확인

```bash
# PM2 상태 확인
pm2 status

# 실행 중이 아니면 시작
cd ~/edupy/backend
pm2 start ecosystem.config.js

# 로그 확인
pm2 logs edupy-backend --lines 50
```

### 프론트엔드 확인

```bash
# 프론트엔드 상태 확인
pm2 status

# 실행 중이 아니면 시작
cd ~/edupy/frontend
pm2 start npm --name "edupy-frontend" -- run preview -- --host 0.0.0.0 --port 5173
```

### 포트 리스닝 확인

```bash
# 8000번 포트 (백엔드) 확인
sudo lsof -i :8000
sudo netstat -tuln | grep 8000

# 5173번 포트 (프론트엔드) 확인
sudo lsof -i :5173
sudo netstat -tuln | grep 5173

# 80번 포트 (Nginx) 확인
sudo lsof -i :80
sudo netstat -tuln | grep :80
```

---

## 5단계: Nginx 설정 확인

### Nginx 설치 및 상태

```bash
# Nginx 설치 (아직 안 한 경우)
sudo apt update
sudo apt install nginx -y

# Nginx 상태 확인
sudo systemctl status nginx

# 시작/재시작
sudo systemctl start nginx
sudo systemctl restart nginx
```

### Nginx 설정 생성

```bash
# 설정 파일 생성
sudo nano /etc/nginx/sites-available/edupy
```

**설정 내용**:
```nginx
server {
    listen 80;
    server_name edupy.org www.edupy.org;

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
sudo ln -sf /etc/nginx/sites-available/edupy /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택)
sudo rm -f /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 6단계: 로컬에서 테스트

### 직접 IP로 접속 테스트

```bash
# Lightsail IP로 접속
curl http://[LIGHTSAIL-IP]

# 또는 브라우저에서
# http://[LIGHTSAIL-IP]
```

**예상 결과**:
- ✅ HTML 응답 → 애플리케이션 정상 작동
- ❌ 연결 거부/타임아웃 → 애플리케이션 또는 방화벽 문제

### 도메인으로 접속 테스트

```bash
# 도메인으로 접속
curl http://edupy.org

# HTTP 헤더 확인
curl -I http://edupy.org
```

---

## 7단계: 상세 디버깅

### Nginx 로그 확인

```bash
# 에러 로그
sudo tail -f /var/log/nginx/error.log

# 액세스 로그
sudo tail -f /var/log/nginx/access.log
```

### PM2 로그 확인

```bash
# 실시간 로그
pm2 logs

# 특정 앱 로그
pm2 logs edupy-backend
pm2 logs edupy-frontend
```

### 네트워크 연결 테스트

```bash
# 로컬호스트 연결 테스트
curl http://localhost:8000/api/health
curl http://localhost:5173

# 외부 접속 테스트 (다른 터미널에서)
curl http://[LIGHTSAIL-IP]:8000/api/health
```

---

## 8단계: 빠른 수정 스크립트

```bash
# 전체 재시작 스크립트
cat > ~/restart_all.sh << 'EOF'
#!/bin/bash
echo "애플리케이션 재시작 중..."

# PM2 앱 재시작
pm2 restart all

# Nginx 재시작
sudo systemctl restart nginx

# 상태 확인
echo ""
echo "PM2 상태:"
pm2 status

echo ""
echo "Nginx 상태:"
sudo systemctl status nginx --no-pager

echo ""
echo "포트 리스닝:"
sudo netstat -tuln | grep -E ':(80|8000|5173)\s'

echo ""
echo "완료!"
EOF

chmod +x ~/restart_all.sh
./restart_all.sh
```

---

## 일반적인 문제 및 해결

### 문제 1: "Connection refused"

**원인**: 애플리케이션이 실행되지 않음

**해결**:
```bash
pm2 start all
sudo systemctl start nginx
```

### 문제 2: "This site can't be reached"

**원인**: DNS 미설정 또는 전파 중

**해결**:
- DNS 설정 확인
- 1-2시간 대기
- IP로 직접 접속 테스트

### 문제 3: "502 Bad Gateway"

**원인**: Nginx는 실행 중이나 백엔드 연결 실패

**해결**:
```bash
pm2 restart all
sudo nginx -t
sudo systemctl restart nginx
```

### 문제 4: Nginx 설정 오류

**원인**: 문법 오류

**해결**:
```bash
sudo nginx -t  # 오류 확인
sudo nano /etc/nginx/sites-available/edupy  # 수정
```

---

## 완전 초기화 및 재설정

모든 것이 작동하지 않으면:

```bash
# 1. PM2 완전 재시작
pm2 delete all
cd ~/edupy/backend
pm2 start ecosystem.config.js
cd ~/edupy/frontend
pm2 start npm --name "edupy-frontend" -- run preview -- --host 0.0.0.0 --port 5173

# 2. Nginx 완전 재설정
sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/edupy
sudo ln -s /etc/nginx/sites-available/edupy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl start nginx

# 3. 방화벽 재설정
sudo ufw disable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 4. 상태 확인
pm2 status
sudo systemctl status nginx
```

---

## 체크리스트

- [ ] DNS A 레코드 설정 완료
- [ ] Lightsail 방화벽 80/443 포트 오픈
- [ ] 서버 UFW 방화벽 80/443 포트 허용
- [ ] 백엔드 (8000 포트) 실행 중
- [ ] 프론트엔드 (5173 포트) 실행 중
- [ ] Nginx 설치 및 실행 중
- [ ] Nginx 설정 파일 생성 및 활성화
- [ ] IP 직접 접속 테스트 성공
- [ ] 도메인 접속 테스트 성공

---

## 긴급 지원

모든 시도가 실패하면:

1. **현재 상태 확인**:
```bash
# 상태 정보 수집
cat > ~/debug_info.txt << 'EOF'
=== PM2 Status ===
$(pm2 status)

=== Nginx Status ===
$(sudo systemctl status nginx --no-pager)

=== Port Listening ===
$(sudo netstat -tuln | grep -E ':(22|80|443|5173|8000)\s')

=== DNS Resolution ===
$(nslookup edupy.org)

=== Firewall Status ===
$(sudo ufw status)

=== Nginx Config Test ===
$(sudo nginx -t 2>&1)

=== Recent Nginx Errors ===
$(sudo tail -20 /var/log/nginx/error.log)
EOF

cat ~/debug_info.txt
```

2. **기본 웹 서버 테스트**:
```bash
# 간단한 Python 웹 서버로 연결 테스트
cd ~
python3 -m http.server 8080
# 브라우저에서 http://edupy.org:8080 접속
```

---

**다음 단계**: 위 체크리스트를 순서대로 확인하세요.
