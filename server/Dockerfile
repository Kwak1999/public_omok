# 백엔드 Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 데이터베이스 디렉토리 생성
RUN mkdir -p data logs

# 포트 노출
EXPOSE 3001

# 환경 변수 기본값 설정
ENV NODE_ENV=production
ENV PORT=3001
ENV CORS_ORIGIN=*

# 서버 실행
CMD ["node", "server.js"]
