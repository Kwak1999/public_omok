# 🧪 백엔드 배포 테스트 가이드

백엔드 서버가 정상적으로 배포되었는지 테스트하는 방법입니다.

## ✅ 올바른 테스트 방법

### 1. EC2 내부에서 테스트 (로컬)

```bash
# EC2 서버 내부에서 실행
curl http://localhost:3001/api/rooms

# 또는
curl http://127.0.0.1:3001/api/rooms
```

### 2. EC2 퍼블릭 IP로 테스트

```bash
# EC2 퍼블릭 IP를 사용 (예: 3.36.70.5)
curl http://3.36.70.5:3001/api/rooms

# 또는 HTTPS (SSL 인증서가 설정된 경우)
curl https://3.36.70.5:3001/api/rooms
```

### 3. 프론트엔드 도메인과 백엔드의 차이

- **프론트엔드**: `https://strategia-mok.store` (S3 + CloudFront)
- **백엔드**: `http://your-ec2-ip:3001` 또는 별도 API 도메인

> ⚠️ **주의**: `strategia-mok.store`는 프론트엔드 도메인이므로 백엔드 API 테스트에는 사용할 수 없습니다.

## 🔍 문제 해결

### CloudFront 301 응답이 나오는 경우

CloudFront는 프론트엔드 정적 파일을 서빙하는 용도입니다. 백엔드 API는 EC2에서 직접 실행되므로:

1. **EC2 퍼블릭 IP 사용**: `http://your-ec2-ip:3001/api/rooms`
2. **별도 API 서브도메인 설정** (선택사항): `https://api.strategia-mok.store`

### 포트 접근이 안 되는 경우

1. **EC2 보안 그룹 확인**:
   - 인바운드 규칙에 포트 3001이 열려있는지 확인
   - 소스: `0.0.0.0/0` (모든 IP 허용) 또는 특정 IP

2. **방화벽 확인**:
   ```bash
   # UFW 방화벽 확인
   sudo ufw status
   
   # 포트 열기 (필요시)
   sudo ufw allow 3001/tcp
   ```

3. **Docker 포트 매핑 확인**:
   ```bash
   docker ps
   # 포트가 3001:3001으로 매핑되어 있는지 확인
   ```

### 컨테이너가 실행 중인지 확인

```bash
# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs omok-backend

# 컨테이너 내부에서 테스트
docker exec omok-backend curl http://localhost:3001/api/rooms
```

## 📋 체크리스트

- [ ] Docker 컨테이너가 실행 중인가? (`docker ps`)
- [ ] 포트 3001이 열려있는가? (EC2 보안 그룹)
- [ ] EC2 내부에서 `curl http://localhost:3001/api/rooms` 성공하는가?
- [ ] EC2 퍼블릭 IP로 외부에서 접근 가능한가?
- [ ] 프론트엔드에서 백엔드로 연결되는가? (`https://strategia-mok.store`에서 게임 테스트)

## 🌐 프론트엔드 연결 설정

프론트엔드가 백엔드에 연결되려면:

1. **프론트엔드 빌드 시 백엔드 URL 설정**:
   ```bash
   # EC2 IP 사용
   VITE_SERVER_URL=http://your-ec2-ip:3001 npm run build
   
   # 또는 API 서브도메인 사용 (설정된 경우)
   VITE_SERVER_URL=https://api.strategia-mok.store npm run build
   ```

2. **CORS 설정 확인**:
   백엔드 `.env` 파일에 프론트엔드 도메인 포함:
   ```env
   CORS_ORIGIN=https://strategia-mok.store,https://www.strategia-mok.store
   ```

## 🔧 API 서브도메인 설정 (선택사항)

백엔드를 별도 API 도메인으로 사용하려면:

1. Route 53에서 A 레코드 생성:
   - 이름: `api.strategia-mok.store`
   - 값: EC2 퍼블릭 IP

2. 또는 CloudFront + API Gateway 사용 (고급)

---

**테스트 성공 후 프론트엔드에서 게임이 정상 작동하는지 확인하세요! 🎮**
