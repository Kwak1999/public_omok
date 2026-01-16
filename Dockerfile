# 프론트엔드 Dockerfile
# Multi-stage build를 사용하여 최적화된 이미지 생성

# Stage 1: 빌드 단계
FROM node:18-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (기본값: 개발 환경)
ARG VITE_SERVER_URL=http://3.36.70.5:3001
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# 빌드 실행
RUN npm run build

# Stage 2: 프로덕션 단계
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
