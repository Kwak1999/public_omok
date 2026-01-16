# 🚀 S3 프론트엔드 배포 가이드

프론트엔드를 AWS S3에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- AWS 계정
- AWS CLI 설치 및 구성
- S3 버킷 생성
- CloudFront 배포 (선택사항, HTTPS 권장)

## 🔧 1. S3 버킷 설정

### 1.1 버킷 생성

1. AWS 콘솔에서 S3 서비스로 이동
2. "버킷 만들기" 클릭
3. 버킷 이름 입력 (예: `strategia-mok-store`)
4. 리전 선택
5. 퍼블릭 액세스 차단 설정 해제 (정적 웹사이트 호스팅 사용 시)

### 1.2 정적 웹사이트 호스팅 활성화

1. 버킷 선택 → "속성" 탭
2. "정적 웹사이트 호스팅" 섹션에서 "편집"
3. 활성화하고 다음 설정:
   - 인덱스 문서: `index.html`
   - 오류 문서: `index.html` (SPA 라우팅을 위해)

### 1.3 버킷 정책 설정

버킷 → "권한" 탭 → "버킷 정책" 편집:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::strategia-mok-store/*"
    }
  ]
}
```

## 📦 2. 프론트엔드 빌드

### 2.1 환경 변수 설정

`.env.production` 파일 생성:

```env
# 백엔드 서버 주소
VITE_SERVER_URL=https://api.strategia-mok.store
# 또는 EC2 사용 시
# VITE_SERVER_URL=http://your-ec2-ip:3001
```

### 2.2 빌드 실행

```bash
npm run build
```

빌드 결과물이 `dist/` 디렉토리에 생성됩니다.

## 🚀 3. S3에 업로드

### 3.1 AWS CLI 사용

```bash
# AWS CLI 설치 확인
aws --version

# AWS 자격 증명 구성 (처음 한 번만)
aws configure

# S3에 업로드
aws s3 sync dist/ s3://strategia-mok-store --delete

# 또는 특정 프로필 사용
aws s3 sync dist/ s3://strategia-mok-store --delete --profile your-profile
```

### 3.2 수동 업로드

1. AWS 콘솔에서 S3 버킷 선택
2. "업로드" 클릭
3. `dist/` 디렉토리의 모든 파일 선택
4. 업로드

## 🌐 4. 도메인 연결

### 4.1 Route 53 사용 (권장)

1. Route 53에서 호스팅 영역 생성
2. A 레코드 생성:
   - 이름: `strategia-mok.store`
   - 유형: A - IPv4 주소
   - 별칭: 예
   - 별칭 대상: S3 버킷 엔드포인트 선택

### 4.2 CloudFront 사용 (HTTPS 권장)

1. CloudFront 배포 생성
2. 원본 도메인: S3 버킷 선택
3. 뷰어 프로토콜 정책: Redirect HTTP to HTTPS
4. 기본 루트 객체: `index.html`
5. 커스텀 오류 응답 설정:
   - HTTP 403 → 200 → `/index.html`
   - HTTP 404 → 200 → `/index.html`
6. Route 53에서 CloudFront 배포로 A 레코드 연결

## 🔄 5. 업데이트 및 재배포

코드 변경 후 재배포:

```bash
# 빌드
npm run build

# S3에 업로드
aws s3 sync dist/ s3://strategia-mok-store --delete

# CloudFront 캐시 무효화 (사용하는 경우)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## ⚙️ 6. 환경 변수 확인

배포 후 다음을 확인하세요:

1. **프론트엔드 도메인**: `https://strategia-mok.store`
2. **백엔드 서버 URL**: 백엔드 서버 주소 확인
3. **CORS 설정**: 백엔드의 `CORS_ORIGIN`에 프론트엔드 도메인 포함 확인

## 🔒 7. 보안 설정

### 7.1 HTTPS 설정

- CloudFront 사용 시 자동으로 HTTPS 제공
- Route 53만 사용 시 SSL 인증서 필요 (ACM 사용)

### 7.2 CORS 설정

백엔드 서버의 `CORS_ORIGIN`에 프론트엔드 도메인 포함:

```env
CORS_ORIGIN=https://strategia-mok.store,https://www.strategia-mok.store
```

## 📝 8. 체크리스트

- [ ] S3 버킷 생성 및 정적 웹사이트 호스팅 활성화
- [ ] 버킷 정책 설정 (퍼블릭 읽기)
- [ ] 프론트엔드 빌드 (`npm run build`)
- [ ] `.env.production`에 백엔드 서버 URL 설정
- [ ] S3에 파일 업로드
- [ ] 도메인 연결 (Route 53 또는 CloudFront)
- [ ] HTTPS 설정 확인
- [ ] 백엔드 CORS 설정 확인
- [ ] 브라우저에서 접속 테스트

## 🐛 문제 해결

### 파일이 업로드되지 않음

```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# 버킷 권한 확인
aws s3 ls s3://strategia-mok-store
```

### 404 오류 발생

- S3 정적 웹사이트 호스팅이 활성화되었는지 확인
- CloudFront 사용 시 오류 응답 설정 확인
- `index.html` 파일이 루트에 있는지 확인

### CORS 오류

- 백엔드 서버의 `CORS_ORIGIN`에 프론트엔드 도메인 포함 확인
- 브라우저 콘솔에서 정확한 오류 메시지 확인

---

**배포 완료 후 `https://strategia-mok.store`에서 접속 가능합니다! 🎉**
