# 서버 배포 가이드

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
cd server
npm install --production
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
# PORT=3001
# NODE_ENV=production
# CORS_ORIGIN=https://yourdomain.com
```

### 3. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
# 또는
npm run prod
```

---

## 📦 프로덕션 배포

### 방법 1: 직접 실행
```bash
NODE_ENV=production PORT=3001 node server.js
```

### 방법 2: PM2 사용 (권장)
```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start ecosystem.config.js --env production

# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs omok-server

# 서버 재시작
pm2 restart omok-server

# 서버 중지
pm2 stop omok-server
```

### 방법 3: Docker 사용
```dockerfile
# Dockerfile 예시
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

---

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `PORT` | 서버 포트 | 3001 | ❌ |
| `NODE_ENV` | 환경 모드 | development | ❌ |
| `CORS_ORIGIN` | CORS 허용 도메인 | * | ❌ |

### CORS_ORIGIN 설정 예시
```bash
# 단일 도메인
CORS_ORIGIN=https://yourdomain.com

# 여러 도메인 (쉼표로 구분)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5173
```

---

## 📝 체크리스트

배포 전 확인사항:

- [ ] `node_modules` 설치 완료 (`npm install --production`)
- [ ] 환경 변수 설정 (`.env` 파일 또는 시스템 환경 변수)
- [ ] 포트가 사용 가능한지 확인
- [ ] 방화벽 설정 확인 (포트 3001 열기)
- [ ] CORS 설정 확인 (프로덕션에서는 특정 도메인만 허용)
- [ ] 로그 디렉토리 생성 (`mkdir -p logs`)

---

## 🐛 문제 해결

### 포트가 이미 사용 중일 때
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

### 서버가 시작되지 않을 때
1. Node.js 버전 확인 (`node --version` - v16 이상 필요)
2. 의존성 재설치: `rm -rf node_modules && npm install`
3. 로그 확인: `pm2 logs` 또는 콘솔 출력 확인

### CORS 오류가 발생할 때
- `.env` 파일에서 `CORS_ORIGIN` 설정 확인
- 클라이언트 도메인이 허용 목록에 있는지 확인

---

## 📊 모니터링

### PM2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 메모리/CPU 사용량 확인
pm2 status
```

### 로그 확인
```bash
# PM2 로그
pm2 logs omok-server

# 또는 직접 로그 파일 확인
tail -f logs/out.log
tail -f logs/err.log
```
