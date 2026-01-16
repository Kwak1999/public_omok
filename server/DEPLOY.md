# 서버 배포 가이드

## 🚀 빠른 시작

### 1. 프론트엔드 빌드
```bash
# 프로젝트 루트에서 실행
cd ..
npm install
npm run build
```

프론트엔드 빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 2. 백엔드 의존성 설치
```bash
cd server
npm install --production
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
# PORT=3001
# NODE_ENV=production
# CORS_ORIGIN=https://yourdomain.com
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드 (프론트엔드 정적 파일도 함께 서빙)
npm start
# 또는
npm run prod
```

> **참고**: 프로덕션 모드(`NODE_ENV=production`)에서는 서버가 자동으로 `dist/` 폴더의 정적 파일을 서빙합니다.

---

## 📦 프로덕션 배포

### 사전 준비: 프론트엔드 빌드
```bash
# 프로젝트 루트에서 실행
npm install
npm run build
```

빌드가 완료되면 `dist/` 폴더가 생성됩니다. 이 폴더는 서버와 같은 위치에 있어야 합니다.

### 방법 1: 직접 실행
```bash
cd server
NODE_ENV=production PORT=3001 node server.js
```

### 방법 2: PM2 사용 (권장)
```bash
# PM2 설치
npm install -g pm2

# 서버 시작 (프로덕션 모드)
cd server
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

> **중요**: 프로덕션 모드에서는 서버가 자동으로 `../dist/` 폴더의 프론트엔드 빌드 파일을 서빙합니다. 
> - API 요청(`/api/*`)과 WebSocket(`/socket.io/*`)은 정상적으로 처리됩니다.
> - 그 외 모든 요청은 `index.html`로 리다이렉트되어 SPA 라우팅이 작동합니다.

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

- [ ] 프론트엔드 빌드 완료 (`npm run build` - `dist/` 폴더 생성 확인)
- [ ] 백엔드 `node_modules` 설치 완료 (`npm install --production`)
- [ ] 환경 변수 설정 (`.env` 파일 또는 시스템 환경 변수)
- [ ] `NODE_ENV=production` 설정 확인 (정적 파일 서빙을 위해 필수)
- [ ] 포트가 사용 가능한지 확인
- [ ] 방화벽 설정 확인 (포트 3001 열기)
- [ ] CORS 설정 확인 (프로덕션에서는 특정 도메인만 허용)
- [ ] 로그 디렉토리 생성 (`mkdir -p logs`)
- [ ] `dist/` 폴더가 서버와 같은 레벨에 있는지 확인

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

### 정적 파일이 로드되지 않을 때 (404 오류)
1. **프론트엔드 빌드 확인**: `dist/` 폴더가 존재하는지 확인
   ```bash
   ls -la ../dist/
   ```

2. **프로덕션 모드 확인**: `NODE_ENV=production`이 설정되어 있는지 확인
   ```bash
   echo $NODE_ENV
   ```

3. **빌드 재실행**: 프론트엔드를 다시 빌드
   ```bash
   cd ..
   npm run build
   ```

4. **서버 재시작**: 변경사항 적용을 위해 서버 재시작
   ```bash
   pm2 restart omok-server
   ```

5. **파일 경로 확인**: 서버가 `dist/` 폴더를 찾을 수 있는지 확인
   - 서버는 `server/` 폴더에서 실행되므로 `../dist/` 경로를 사용합니다
   - 프로젝트 구조: `project/dist/`와 `project/server/`가 같은 레벨에 있어야 합니다

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
