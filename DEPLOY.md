# 🚀 전체 배포 가이드

이 문서는 오목 게임의 프론트엔드와 백엔드를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 목차

1. [배포 전 준비사항](#배포-전-준비사항)
2. [백엔드 서버 배포](#백엔드-서버-배포)
3. [프론트엔드 배포](#프론트엔드-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 플랫폼별 가이드](#배포-플랫폼별-가이드)

---

## 배포 전 준비사항

### 필수 요구사항
- Node.js v16 이상
- npm v8 이상
- 서버 접근 권한 (SSH 등)

### 프론트엔드 vs 백엔드 배포 차이점

| 항목 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| **빌드 필요** | ✅ 필요 (`npm run build`) | ❌ 불필요 (JavaScript 직접 실행) |
| **배포 파일** | `dist/` 디렉토리 (빌드 결과물) | 소스 코드 그대로 (`server/` 디렉토리) |
| **실행 방법** | 정적 파일 서빙 (Nginx, Apache 등) | Node.js로 직접 실행 (`node server.js`) |
| **의존성 설치** | 빌드 시 설치 (`npm install`) | 서버에서 설치 (`npm install --production`) |

### 체크리스트
- [ ] Node.js 버전 확인 (`node --version`)
- [ ] 포트 3001 (백엔드) 사용 가능 여부 확인
- [ ] 도메인 또는 IP 주소 준비
- [ ] SSL 인증서 준비 (HTTPS 권장)

---

## 백엔드 서버 배포

> **⚠️ 중요**: 백엔드는 **빌드가 필요 없습니다**. JavaScript로 작성되어 있어 Node.js가 직접 실행할 수 있습니다. 의존성만 설치하고 바로 실행하면 됩니다.

### 1. 서버 파일 업로드

```bash
# 서버 디렉토리 전체를 서버에 업로드
scp -r server/ user@your-server:/path/to/app/
```

### 2. 서버에서 의존성 설치

```bash
cd /path/to/app/server
npm install --production
```

> **참고**: `--production` 플래그는 개발 의존성을 제외하고 프로덕션 의존성만 설치합니다. 빌드 과정 없이 소스 코드를 그대로 실행합니다.

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cat > .env << EOF
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
EOF
```

### 4. 서버 실행 방법

#### 방법 1: PM2 사용 (권장)

```bash
# PM2 전역 설치
npm install -g pm2

# 서버 시작
cd /path/to/app/server
pm2 start ecosystem.config.js --env production

# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs omok-server

# 서버 재시작
pm2 restart omok-server

# 서버 중지
pm2 stop omok-server

# 서버 삭제
pm2 delete omok-server

# 시스템 재부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### 방법 2: systemd 서비스 (Linux)

```bash
# /etc/systemd/system/omok-server.service 파일 생성
sudo nano /etc/systemd/system/omok-server.service
```

서비스 파일 내용:
```ini
[Unit]
Description=Omok Game Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/app/server
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="CORS_ORIGIN=https://yourdomain.com"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 실행:
```bash
sudo systemctl daemon-reload
sudo systemctl enable omok-server
sudo systemctl start omok-server
sudo systemctl status omok-server
```

#### 방법 3: 직접 실행 (개발/테스트용)

```bash
cd /path/to/app/server
NODE_ENV=production PORT=3001 node server.js
```

### 5. 방화벽 설정

```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 6. 리버스 프록시 설정 (Nginx)

```nginx
# /etc/nginx/sites-available/omok-server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/omok-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 프론트엔드 배포

> **⚠️ 중요**: 프론트엔드는 **빌드가 필수**입니다. React + Vite 프로젝트이므로 배포 전에 반드시 빌드해야 합니다.

### 1. 빌드

```bash
# 프로젝트 루트에서
npm install
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다. 이 디렉토리의 내용을 웹 서버에 배포하면 됩니다.

> **참고**: 백엔드와 달리 프론트엔드는 소스 코드를 그대로 배포할 수 없습니다. React 컴포넌트와 JSX 코드를 브라우저가 이해할 수 있는 JavaScript로 변환하는 빌드 과정이 필요합니다.

### 2. 서버 URL 설정

배포 전에 프론트엔드에서 사용할 서버 URL을 설정해야 합니다.

#### 방법 1: 환경 변수 사용 (권장)

`vite.config.js` 수정:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react],
  define: {
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(
      process.env.VITE_SERVER_URL || 'http://localhost:3001'
    ),
  },
})
```

`src/services/socketService.js` 수정:
```javascript
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

connect(serverUrl = SERVER_URL) {
  // ...
}
```

빌드 시:
```bash
VITE_SERVER_URL=https://api.yourdomain.com npm run build
```

#### 방법 2: 빌드 후 수정

빌드 후 `dist/assets/*.js` 파일에서 `localhost:3001`을 찾아 실제 서버 URL로 변경

### 3. 정적 파일 서빙

#### 방법 1: Nginx 사용 (권장)

```nginx
# /etc/nginx/sites-available/omok-frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /path/to/app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 방법 2: Apache 사용

`.htaccess` 파일 생성:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 방법 3: Node.js 서버 사용

```javascript
// serve.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
```

### 4. HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

---

## 환경 변수 설정

### 백엔드 환경 변수

`server/.env` 파일 생성 (또는 환경 변수로 설정):

```bash
# Node.js 환경
NODE_ENV=production

# 서버 포트
PORT=3001

# CORS 허용 오리진 (쉼표로 구분)
# 예: CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
# 모든 오리진 허용: CORS_ORIGIN=*
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# 데이터베이스 초기화 설정 (선택사항)
# false: 서버 재시작 시 데이터 유지 (기본값: true - 항상 초기화)
# RESET_DB_ON_START=false
```

### 프론트엔드 환경 변수

빌드 시 환경 변수 설정:

```bash
# 개발 환경
VITE_SERVER_URL=http://localhost:3001

# 프로덕션 환경
VITE_SERVER_URL=https://api.yourdomain.com
# 또는 EC2 사용 시
VITE_SERVER_URL=http://your-ec2-ip:3001
```

빌드 명령어:
```bash
VITE_SERVER_URL=https://api.yourdomain.com npm run build
```

### Docker Compose 환경 변수

`docker-compose.yml` 사용 시 환경 변수 설정:

```bash
# .env 파일 생성 (프로젝트 루트)
PORT=3001
CORS_ORIGIN=https://yourdomain.com
VITE_SERVER_URL=https://api.yourdomain.com
```

또는 환경 변수 직접 설정:
```bash
export PORT=3001
export CORS_ORIGIN=https://yourdomain.com
export VITE_SERVER_URL=https://api.yourdomain.com
docker-compose up -d
```

---

## 배포 플랫폼별 가이드

### Vercel (프론트엔드)

1. Vercel에 프로젝트 연결
2. 빌드 설정:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. 환경 변수 설정:
   - `VITE_SERVER_URL`: 백엔드 서버 URL
4. 배포

### Netlify (프론트엔드)

1. Netlify에 프로젝트 연결
2. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 환경 변수 설정
4. `_redirects` 파일 생성:
   ```
   /*    /index.html   200
   ```

### Railway (백엔드)

1. Railway에 프로젝트 연결
2. 루트 디렉토리를 `server`로 설정
3. 환경 변수 설정
4. 포트는 Railway가 자동 할당

### Heroku (백엔드)

1. Heroku CLI 설치 및 로그인
2. 프로젝트 초기화:
   ```bash
   cd server
   heroku create your-app-name
   ```
3. 환경 변수 설정:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://yourdomain.com
   ```
4. 배포:
   ```bash
   git push heroku main
   ```

### AWS EC2 (전체)

1. EC2 인스턴스 생성
2. Node.js 설치
3. Nginx 설치 및 설정
4. PM2로 백엔드 실행
5. Nginx로 프론트엔드 서빙

### Docker 사용

#### Dockerfile (백엔드)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

#### Dockerfile (프론트엔드)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=https://yourdomain.com
    restart: always

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

실행:
```bash
docker-compose up -d
```

---

## 배포 후 확인사항

### 체크리스트

- [ ] 백엔드 서버가 정상 실행 중인가?
- [ ] 프론트엔드가 정상적으로 로드되는가?
- [ ] Socket.io 연결이 정상적으로 작동하는가?
- [ ] 멀티플레이어 게임이 정상적으로 작동하는가?
- [ ] HTTPS가 정상적으로 설정되었는가?
- [ ] CORS 설정이 올바른가?
- [ ] 로그가 정상적으로 기록되는가?

### 테스트

1. 브라우저에서 프론트엔드 접속
2. 멀티플레이어 모드 진입
3. 방 생성 및 참가 테스트
4. 게임 플레이 테스트
5. 브라우저 콘솔에서 오류 확인

---

## 문제 해결

### 백엔드 연결 안 됨

1. 서버가 실행 중인지 확인: `pm2 status` 또는 `systemctl status omok-server`
2. 포트가 열려있는지 확인: `netstat -tulpn | grep 3001`
3. 방화벽 설정 확인
4. CORS 설정 확인

### 프론트엔드 빌드 실패

1. Node.js 버전 확인
2. 의존성 재설치: `rm -rf node_modules && npm install`
3. 빌드 로그 확인

### Socket.io 연결 실패

1. 서버 URL이 올바른지 확인
2. HTTPS/HTTP 프로토콜 일치 확인
3. 브라우저 콘솔에서 오류 확인
4. 네트워크 탭에서 WebSocket 연결 확인

---

## 모니터링 및 유지보수

### 로그 확인

```bash
# PM2 로그
pm2 logs omok-server

# systemd 로그
sudo journalctl -u omok-server -f

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 성능 모니터링

```bash
# PM2 모니터링
pm2 monit

# 시스템 리소스 확인
htop
```

### 백업

```bash
# 데이터베이스 백업
cp server/data/omok.db server/data/omok.db.backup
```

---

## EC2 배포 가이드

AWS EC2 인스턴스에 백엔드를 배포하는 상세한 가이드는 별도 문서를 참조하세요:

👉 **[server/EC2_DEPLOY.md](./server/EC2_DEPLOY.md)**

이 가이드에는 다음 내용이 포함되어 있습니다:
- EC2 인스턴스 설정 및 보안 그룹 구성
- 데이터베이스 관리 및 백업 전략 (SQLite)
- PM2/systemd를 사용한 프로세스 관리
- Nginx 리버스 프록시 설정
- SSL 인증서 설정 (Let's Encrypt)
- 모니터링 및 문제 해결

---

## 보안 권장사항

1. **환경 변수 사용**: 민감한 정보는 환경 변수로 관리
2. **HTTPS 사용**: SSL/TLS 인증서 적용
3. **CORS 제한**: 프로덕션에서는 특정 도메인만 허용
4. **방화벽 설정**: 필요한 포트만 열기
5. **정기 업데이트**: Node.js 및 패키지 정기 업데이트
6. **로그 모니터링**: 의심스러운 활동 감지
7. **데이터베이스 백업**: 정기적인 백업 및 복원 계획 수립 (EC2 배포 시 필수)

---

## 추가 리소스

- [PM2 문서](https://pm2.keymetrics.io/)
- [Nginx 문서](https://nginx.org/en/docs/)
- [Let's Encrypt 문서](https://letsencrypt.org/docs/)
- [Socket.io 배포 가이드](https://socket.io/docs/v4/production-checklist/)
