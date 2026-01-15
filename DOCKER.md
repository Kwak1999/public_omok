# 🐳 Docker 배포 가이드

Docker를 사용하여 오목 게임을 쉽게 배포할 수 있습니다.

## 📋 사전 요구사항

- Docker 설치 (v20.10 이상)
- Docker Compose 설치 (v2.0 이상)

## 🚀 빠른 시작

### 1. 전체 스택 실행 (프론트엔드 + 백엔드)

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 2. 개별 서비스 실행

#### 백엔드만 실행

```bash
cd server
docker build -t omok-backend .
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CORS_ORIGIN=http://localhost:80 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --name omok-backend \
  omok-backend
```

#### 프론트엔드만 실행

```bash
# 서버 URL 설정하여 빌드
docker build \
  --build-arg VITE_SERVER_URL=http://localhost:3001 \
  -t omok-frontend .

docker run -d \
  -p 80:80 \
  --name omok-frontend \
  omok-frontend
```

## 🔧 환경 변수 설정

### docker-compose.yml 수정

프로덕션 환경에서는 `docker-compose.yml`의 환경 변수를 수정하세요:

```yaml
services:
  backend:
    environment:
      - CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
  
  frontend:
    build:
      args:
        - VITE_SERVER_URL=https://api.yourdomain.com
```

### .env 파일 사용 (선택사항)

`docker-compose.env` 파일 생성:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
VITE_SERVER_URL=https://api.yourdomain.com
```

docker-compose.yml에서 사용:

```yaml
services:
  backend:
    env_file:
      - docker-compose.env
```

## 📦 빌드 옵션

### 프로덕션 빌드

```bash
# 전체 스택 빌드
docker-compose build

# 특정 서비스만 빌드
docker-compose build backend
docker-compose build frontend
```

### 개발 모드 빌드

개발 모드로 실행하려면 `docker-compose.dev.yml` 파일을 만들거나 기존 파일을 수정하세요.

## 🌐 프로덕션 배포

### 1. 도메인 설정

프로덕션 환경에서는 리버스 프록시(Nginx)를 사용하는 것을 권장합니다:

```nginx
# /etc/nginx/sites-available/omok
server {
    listen 80;
    server_name yourdomain.com;
    
    # 프론트엔드 프록시
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 백엔드 API 프록시
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket 프록시
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 2. HTTPS 설정

Let's Encrypt를 사용한 SSL 인증서:

```bash
sudo certbot --nginx -d yourdomain.com
```

### 3. Docker Compose 프로덕션 설정

`docker-compose.prod.yml` 생성:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=https://yourdomain.com
    volumes:
      - ./server/data:/app/data
      - ./server/logs:/app/logs
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_SERVER_URL=https://api.yourdomain.com
    restart: always
```

실행:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 모니터링 및 로그

### 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend

# 최근 100줄
docker-compose logs --tail=100
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 리소스 사용량 확인
docker stats
```

### 헬스 체크

백엔드 헬스 체크는 자동으로 실행됩니다. 수동 확인:

```bash
docker-compose exec backend node -e "require('http').get('http://localhost:3001/api/rooms', (r) => console.log(r.statusCode))"
```

## 🗄️ 데이터 영구 저장

데이터베이스와 로그는 볼륨을 통해 영구 저장됩니다:

```yaml
volumes:
  - ./server/data:/app/data      # 데이터베이스 파일
  - ./server/logs:/app/logs      # 로그 파일
```

## 🔄 업데이트 및 재배포

### 코드 업데이트 후 재배포

```bash
# 이미지 재빌드
docker-compose build

# 컨테이너 재시작
docker-compose up -d

# 또는 한 번에
docker-compose up -d --build
```

### 데이터베이스 백업

```bash
# 데이터베이스 백업
docker-compose exec backend cp /app/data/omok.db /app/data/omok.db.backup

# 또는 호스트에서
cp server/data/omok.db server/data/omok.db.backup
```

## 🐛 문제 해결

### 포트 충돌

포트가 이미 사용 중인 경우:

```bash
# 포트 사용 확인
netstat -tulpn | grep :3001
netstat -tulpn | grep :80

# docker-compose.yml에서 포트 변경
ports:
  - "3002:3001"  # 호스트:컨테이너
```

### 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker-compose logs backend
docker-compose logs frontend

# 컨테이너 재시작
docker-compose restart

# 완전히 재생성
docker-compose down
docker-compose up -d --build
```

### 권한 문제

```bash
# 데이터 디렉토리 권한 설정
sudo chown -R $USER:$USER server/data server/logs
chmod -R 755 server/data server/logs
```

## 📊 성능 최적화

### 멀티 스테이지 빌드

프론트엔드 Dockerfile은 이미 멀티 스테이지 빌드를 사용하여 최적화되어 있습니다.

### 이미지 크기 최적화

```bash
# 이미지 크기 확인
docker images | grep omok

# 불필요한 이미지 정리
docker system prune -a
```

## 🔒 보안 권장사항

1. **환경 변수**: 민감한 정보는 환경 변수로 관리
2. **네트워크**: 필요한 포트만 노출
3. **이미지**: 최신 보안 패치가 적용된 베이스 이미지 사용
4. **권한**: root 사용자로 실행하지 않도록 설정 (현재 alpine 이미지 사용)

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Nginx 문서](https://nginx.org/en/docs/)

---

**Docker를 사용하면 배포가 훨씬 쉬워집니다! 🚀**
