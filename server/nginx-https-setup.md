# Nginx HTTPS 설정 가이드

## 문제 진단

터미널에서 다음 명령어로 확인:

```bash
# 1. Nginx 설정 파일 확인
sudo cat /etc/nginx/sites-available/omok | grep -A 5 "listen 443"

# 2. SSL 인증서 확인
sudo ls -la /etc/letsencrypt/live/api.strategia-mok.store/ 2>/dev/null || echo "SSL 인증서 없음"

# 3. 포트 443 리스닝 확인
sudo ss -tlnp | grep 443

# 4. Nginx 에러 로그 확인
sudo tail -20 /var/log/nginx/error.log

# 5. EC2 보안 그룹 확인 (AWS 콘솔에서)
# - 인바운드 규칙에 포트 443 (HTTPS)이 열려있는지 확인
```

## 해결 방법

### 방법 1: HTTP만 사용 (빠른 해결)

HTTPS가 필요 없다면 HTTP로만 사용:

```bash
# Nginx 설정 파일 수정
sudo nano /etc/nginx/sites-available/omok
```

HTTP 리다이렉션 제거 (301 리다이렉트 부분 주석 처리):

```nginx
server {
    listen 80;
    server_name api.strategia-mok.store;
    
    # 301 리다이렉트 제거 (이 부분 주석 처리)
    # return 301 https://$server_name$request_uri;
    
    # 나머지 설정...
}
```

또는 리다이렉트 없이 직접 서빙:

```nginx
server {
    listen 80;
    server_name api.strategia-mok.store;
    
    # 정적 파일 직접 서빙
    location /assets/ {
        alias /root/omok/public_omok/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 요청은 Express 서버로 프록시
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 프록시
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 프론트엔드 서빙
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

설정 적용:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 방법 2: HTTPS 설정 (권장)

#### 2.1 Let's Encrypt SSL 인증서 설치

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d api.strategia-mok.store

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

#### 2.2 Nginx HTTPS 설정 활성화

설정 파일에 HTTPS 서버 블록 추가:

```bash
sudo nano /etc/nginx/sites-available/omok
```

HTTPS 서버 블록 추가:

```nginx
# HTTP를 HTTPS로 리다이렉트
server {
    listen 80;
    server_name api.strategia-mok.store;
    return 301 https://$server_name$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name api.strategia-mok.store;

    # SSL 인증서 (Certbot이 자동으로 설정)
    ssl_certificate /etc/letsencrypt/live/api.strategia-mok.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.strategia-mok.store/privkey.pem;
    
    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 정적 파일 직접 서빙
    location /assets/ {
        alias /root/omok/public_omok/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 요청은 Express 서버로 프록시
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 프록시
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 프론트엔드 서빙
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

설정 적용:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.3 EC2 보안 그룹 설정

AWS 콘솔에서:
1. EC2 → 보안 그룹 선택
2. 인바운드 규칙 편집
3. 규칙 추가:
   - 유형: HTTPS
   - 프로토콜: TCP
   - 포트: 443
   - 소스: 0.0.0.0/0 (또는 특정 IP)

## 확인

```bash
# HTTP 리다이렉트 확인
curl -I http://api.strategia-mok.store

# HTTPS 연결 확인
curl -I https://api.strategia-mok.store

# 서비스 상태 확인
sudo systemctl status nginx
```
