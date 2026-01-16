# 🚀 EC2 백엔드 배포 가이드

이 가이드는 AWS EC2 인스턴스에 백엔드 서버를 배포하는 방법을 설명합니다.

> **🐳 Docker 사용**: Docker를 사용하여 배포하는 경우 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)를 참고하세요.

## 📋 사전 요구사항

- AWS 계정 및 EC2 인스턴스
- SSH 접근 권한
- Node.js 18 이상 설치 (또는 Docker)
- PM2 또는 systemd (프로세스 관리, Docker 사용 시 불필요)

## 🔧 1. EC2 인스턴스 설정

### 1.1 보안 그룹 설정

EC2 보안 그룹에서 다음 포트를 열어주세요:

- **포트 3001**: 백엔드 서버 (HTTP/WebSocket)
- **포트 22**: SSH (기본)

보안 그룹 인바운드 규칙 예시:
```
Type: Custom TCP
Port: 3001
Source: 0.0.0.0/0 (또는 특정 IP/도메인)
```

### 1.2 EC2 인스턴스 접속

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## 📦 2. 서버 환경 설정

### 2.1 Node.js 설치

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 2.2 PM2 설치 (프로세스 관리)

```bash
sudo npm install -g pm2
```

### 2.3 프로젝트 업로드

#### 방법 1: Git 사용 (권장)

```bash
# Git 설치
sudo apt-get install git

# 프로젝트 클론
cd ~
git clone <your-repo-url> public_omok
cd public_omok/server

# 의존성 설치
npm install --production
```

#### 방법 2: SCP 사용

로컬에서:
```bash
scp -i your-key.pem -r server/ ubuntu@your-ec2-ip:~/
```

EC2에서:
```bash
cd ~/server
npm install --production
```

## 🗄️ 3. 데이터베이스 설정

### 3.1 SQLite 데이터베이스 위치

SQLite 데이터베이스는 `server/data/omok.db`에 저장됩니다.

### 3.2 데이터베이스 디렉토리 생성

```bash
cd ~/server
mkdir -p data logs
chmod 755 data logs
```

### 3.3 데이터베이스 백업 전략

#### 자동 백업 스크립트 생성

```bash
# 백업 스크립트 생성
nano ~/backup-db.sh
```

스크립트 내용:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/db-backups"
DB_PATH="$HOME/server/data/omok.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH "$BACKUP_DIR/omok_${DATE}.db"

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "omok_*.db" -mtime +7 -delete

echo "백업 완료: omok_${DATE}.db"
```

실행 권한 부여:
```bash
chmod +x ~/backup-db.sh
```

#### Cron을 사용한 자동 백업 설정

```bash
# Crontab 편집
crontab -e
```

매일 새벽 2시에 백업:
```
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

### 3.4 데이터베이스 복원

```bash
# 백업 파일에서 복원
cp ~/db-backups/omok_20240101_020000.db ~/server/data/omok.db
```

### 3.5 데이터베이스 초기화 정책

**기본 동작**: 서버 재시작 시 모든 데이터(방, 플레이어, 경기 기록)가 자동으로 초기화됩니다.

**데이터 유지가 필요한 경우**: 환경 변수 `RESET_DB_ON_START=false`를 설정하면 데이터가 유지됩니다.

```bash
# .env 파일에 추가
RESET_DB_ON_START=false
```

> **참고**: 기본적으로는 서버 재시작 시 모든 데이터가 초기화되므로, 중요한 데이터는 정기적으로 백업해야 합니다.

## ⚙️ 4. 환경 변수 설정

### 4.1 .env 파일 생성

```bash
cd ~/server
nano .env
```

`.env` 파일 내용:
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://strategia-mok.store,https://www.strategia-mok.store

# 데이터베이스 초기화 설정 (선택사항)
# false: 서버 재시작 시 데이터 유지 (기본값: true - 항상 초기화)
# RESET_DB_ON_START=false
```

### 4.2 환경 변수 확인

```bash
cat .env
```

## 🚀 5. 서버 실행

### 5.1 PM2를 사용한 실행 (권장)

#### PM2 설정 파일 사용

`ecosystem.config.js` 파일이 이미 있습니다:

```bash
cd ~/server
pm2 start ecosystem.config.js
```

#### PM2 명령어로 직접 실행

```bash
cd ~/server
pm2 start server.js --name omok-backend \
  --env production \
  --node-args="--env-file=.env"
```

또는 환경 변수를 직접 지정:

```bash
pm2 start server.js --name omok-backend \
  -e ~/server/logs/error.log \
  -o ~/server/logs/out.log \
  --env production
```

#### PM2 환경 변수 설정

`ecosystem.config.js` 수정:
```javascript
module.exports = {
  apps: [{
    name: 'omok-backend',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      CORS_ORIGIN: 'https://yourdomain.com'
    }
  }]
};
```

### 5.2 PM2 자동 시작 설정

```bash
# PM2 시작 스크립트 생성
pm2 startup

# 출력된 명령어 실행 (예: sudo env PATH=...)
# 그 다음 현재 프로세스 저장
pm2 save
```

### 5.3 systemd를 사용한 실행 (대안)

```bash
# 서비스 파일 생성
sudo nano /etc/systemd/system/omok-backend.service
```

서비스 파일 내용:
```ini
[Unit]
Description=Omok Backend Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/server
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="CORS_ORIGIN=https://yourdomain.com"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=omok-backend

[Install]
WantedBy=multi-user.target
```

서비스 시작:
```bash
sudo systemctl daemon-reload
sudo systemctl enable omok-backend
sudo systemctl start omok-backend
sudo systemctl status omok-backend
```

## 🔍 6. 서버 모니터링

### 6.1 PM2 모니터링

```bash
# 프로세스 상태 확인
pm2 status

# 로그 확인
pm2 logs omok-backend

# 실시간 모니터링
pm2 monit

# 리소스 사용량 확인
pm2 list
```

### 6.2 systemd 모니터링

```bash
# 서비스 상태 확인
sudo systemctl status omok-backend

# 로그 확인
sudo journalctl -u omok-backend -f
```

### 6.3 서버 헬스 체크

```bash
# API 엔드포인트 확인
curl http://localhost:3001/api/rooms

# 외부에서 확인 (EC2 퍼블릭 IP 사용)
curl http://your-ec2-ip:3001/api/rooms
```

## 🔄 7. 업데이트 및 재배포

### 7.1 코드 업데이트

```bash
# Git 사용 시
cd ~/server
git pull
npm install --production
pm2 restart omok-backend

# 또는 SCP 사용 시
# 로컬에서 파일 업로드 후
pm2 restart omok-backend
```

### 7.2 데이터베이스 백업 후 업데이트

```bash
# 1. 백업
~/backup-db.sh

# 2. 코드 업데이트
cd ~/server
git pull
npm install --production

# 3. 서버 재시작
pm2 restart omok-backend
```

## 🛡️ 8. 보안 설정

### 8.1 방화벽 설정 (UFW)

```bash
# UFW 설치 및 활성화
sudo apt-get install ufw
sudo ufw allow 22/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
sudo ufw status
```

### 8.2 Nginx 리버스 프록시 설정 (권장)

Nginx를 사용하여 HTTPS를 적용하고 포트를 숨길 수 있습니다:

```bash
# Nginx 설치
sudo apt-get install nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/omok-backend
```

설정 파일 내용:
```nginx
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

    # WebSocket 지원
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

심볼릭 링크 생성 및 활성화:
```bash
sudo ln -s /etc/nginx/sites-available/omok-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8.3 SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d api.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 📊 9. 데이터베이스 관리

### 9.1 데이터베이스 파일 위치

```
~/server/data/omok.db
```

### 9.2 데이터베이스 백업

```bash
# 수동 백업
cp ~/server/data/omok.db ~/db-backups/omok_$(date +%Y%m%d_%H%M%S).db

# 또는 백업 스크립트 사용
~/backup-db.sh
```

### 9.3 데이터베이스 복원

```bash
# 서버 중지
pm2 stop omok-backend

# 백업 파일 복원
cp ~/db-backups/omok_20240101_020000.db ~/server/data/omok.db

# 서버 재시작
pm2 start omok-backend
```

### 9.4 데이터베이스 크기 확인

```bash
du -h ~/server/data/omok.db
ls -lh ~/server/data/omok.db
```

### 9.5 데이터베이스 최적화

SQLite 데이터베이스 최적화 (VACUUM):

```bash
# SQLite CLI 설치
sudo apt-get install sqlite3

# 데이터베이스 최적화
sqlite3 ~/server/data/omok.db "VACUUM;"
```

### 9.6 원격 백업 (S3 등)

AWS S3에 자동 백업:

```bash
# AWS CLI 설치
sudo apt-get install awscli

# 백업 스크립트 수정
nano ~/backup-db.sh
```

백업 스크립트에 추가:
```bash
# S3에 업로드
aws s3 cp "$BACKUP_DIR/omok_${DATE}.db" s3://your-bucket/db-backups/omok_${DATE}.db
```

## 🐛 10. 문제 해결

### 10.1 서버가 시작되지 않을 때

```bash
# 로그 확인
pm2 logs omok-backend
# 또는
tail -f ~/server/logs/error.log

# 포트 사용 확인
sudo netstat -tulpn | grep 3001
# 또는
sudo lsof -i :3001

# 프로세스 강제 종료
sudo kill -9 <PID>
```

### 10.2 데이터베이스 권한 문제

```bash
# 권한 확인
ls -la ~/server/data/

# 권한 수정
chmod 644 ~/server/data/omok.db
chown ubuntu:ubuntu ~/server/data/omok.db
```

### 10.3 메모리 부족

```bash
# 메모리 사용량 확인
free -h
pm2 monit

# Node.js 메모리 제한 설정 (PM2)
pm2 start server.js --max-memory-restart 500M
```

### 10.4 연결 문제

```bash
# 방화벽 확인
sudo ufw status

# 보안 그룹 확인 (AWS 콘솔)
# 포트 3001이 열려있는지 확인

# 서버 로그 확인
pm2 logs omok-backend --lines 100
```

## 📝 11. 체크리스트

배포 전 확인사항:

- [ ] EC2 보안 그룹에서 포트 3001 열림
- [ ] Node.js 18 이상 설치됨
- [ ] PM2 설치 및 설정됨
- [ ] 환경 변수 설정 완료 (CORS_ORIGIN 등)
- [ ] 데이터베이스 디렉토리 생성 및 권한 설정
- [ ] 백업 스크립트 설정 및 테스트
- [ ] 서버 실행 및 헬스 체크 통과
- [ ] PM2 자동 시작 설정 완료
- [ ] 방화벽 설정 완료
- [ ] (선택) Nginx 리버스 프록시 설정
- [ ] (선택) SSL 인증서 설정

## 🔗 12. 추가 리소스

- [PM2 공식 문서](https://pm2.keymetrics.io/)
- [Node.js 배포 가이드](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
- [SQLite 백업 가이드](https://www.sqlite.org/backup.html)

---

**배포 완료 후 프론트엔드의 `VITE_SERVER_URL` 환경 변수를 EC2 서버 주소로 설정하세요!**
