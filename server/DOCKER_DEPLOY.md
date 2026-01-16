# 🐳 EC2 Docker 백엔드 배포 가이드

EC2에서 Docker를 사용하여 백엔드를 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- EC2 인스턴스에 Docker 설치 완료
- Git clone 완료
- Dockerfile 빌드 완료

## 🚀 배포 단계

### 1. 환경 변수 파일 확인

`server/.env` 파일이 올바르게 설정되었는지 확인:

```bash
cd ~/public_omok/server
cat .env
```

`.env` 파일 예시:
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://strategia-mok.store,https://www.strategia-mok.store
```

### 2. 데이터베이스 디렉토리 생성

```bash
cd ~/public_omok/server
mkdir -p data logs
chmod 755 data logs
```

### 3. Docker 이미지 빌드 (이미 완료)

```bash
cd ~/public_omok/server
docker build -t omok-backend .
```

### 4. Docker 컨테이너 실행

#### 방법 1: docker run 사용

```bash
cd ~/public_omok/server

# 컨테이너 실행
docker run -d \
  --name omok-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  omok-backend
```

#### 방법 2: 환경 변수 직접 지정

```bash
docker run -d \
  --name omok-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CORS_ORIGIN=https://strategia-mok.store,https://www.strategia-mok.store \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  omok-backend
```

### 5. 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 로그 확인
docker logs omok-backend

# 실시간 로그 확인
docker logs -f omok-backend
```

### 6. 서버 헬스 체크

```bash
# EC2 내부에서 확인 (로컬)
curl http://localhost:3001/api/rooms

# 외부에서 확인 (EC2 퍼블릭 IP 사용)
# 예: curl http://3.36.70.5:3001/api/rooms
curl http://your-ec2-ip:3001/api/rooms
```

> ⚠️ **주의**: `strategia-mok.store`는 프론트엔드 도메인(CloudFront)이므로 백엔드 API 테스트에는 사용할 수 없습니다. EC2 퍼블릭 IP를 사용하세요.

자세한 테스트 방법은 [TEST_DEPLOY.md](./TEST_DEPLOY.md)를 참고하세요.

### 7. 자동 재시작 설정

`--restart unless-stopped` 옵션으로 컨테이너가 자동으로 재시작됩니다.

## 🔄 업데이트 및 재배포

### 코드 업데이트 후 재배포

```bash
cd ~/public_omok/server

# 1. Git에서 최신 코드 가져오기
git pull

# 2. 기존 컨테이너 중지 및 삭제
docker stop omok-backend
docker rm omok-backend

# 3. 이미지 재빌드
docker build -t omok-backend .

# 4. 컨테이너 재실행
docker run -d \
  --name omok-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  omok-backend
```

## 🛠️ 유용한 명령어

### 컨테이너 관리

```bash
# 컨테이너 중지
docker stop omok-backend

# 컨테이너 시작
docker start omok-backend

# 컨테이너 재시작
docker restart omok-backend

# 컨테이너 삭제
docker rm omok-backend

# 컨테이너 중지 및 삭제
docker stop omok-backend && docker rm omok-backend
```

### 로그 관리

```bash
# 최근 로그 확인
docker logs --tail 100 omok-backend

# 실시간 로그
docker logs -f omok-backend

# 로그 파일 확인 (볼륨 마운트된 경우)
tail -f ~/public_omok/server/logs/out.log
tail -f ~/public_omok/server/logs/err.log
```

### 리소스 확인

```bash
# 컨테이너 리소스 사용량
docker stats omok-backend

# 디스크 사용량
docker system df
```

## 🐛 문제 해결

### 컨테이너가 시작되지 않을 때

```bash
# 로그 확인
docker logs omok-backend

# 컨테이너 상세 정보 확인
docker inspect omok-backend
```

### 포트 충돌

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep 3001

# 다른 컨테이너가 포트를 사용 중인지 확인
docker ps | grep 3001
```

### 환경 변수 확인

```bash
# 컨테이너 내부 환경 변수 확인
docker exec omok-backend env
```

### 데이터베이스 권한 문제

```bash
# 데이터 디렉토리 권한 확인
ls -la ~/public_omok/server/data/

# 권한 수정
chmod 755 ~/public_omok/server/data
chmod 644 ~/public_omok/server/data/omok.db
```

## 📊 모니터링

### 헬스 체크 스크립트

```bash
#!/bin/bash
# healthcheck.sh

response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/rooms)

if [ $response -eq 200 ]; then
    echo "✅ 서버 정상 작동 중"
else
    echo "❌ 서버 오류 (HTTP $response)"
    # 필요시 알림 전송 또는 재시작
fi
```

## 🔒 보안 권장사항

1. **방화벽 설정**: EC2 보안 그룹에서 필요한 포트만 열기
2. **환경 변수**: 민감한 정보는 환경 변수로 관리
3. **로그 관리**: 정기적으로 로그 파일 확인 및 정리
4. **업데이트**: 정기적으로 Docker 이미지 및 시스템 업데이트

---

**배포 완료 후 프론트엔드에서 `https://strategia-mok.store`로 접속하여 테스트하세요! 🎉**
