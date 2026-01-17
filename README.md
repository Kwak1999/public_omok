# 🎮 오목 게임 (Omok Game)

React와 Socket.io를 활용한 실시간 멀티플레이어 오목 게임입니다. 싱글플레이어와 멀티플레이어 모드를 지원하며, 렌주룰(連珠ルール)을 적용한 정식 오목 규칙을 구현했습니다.

![오목 게임](https://img.shields.io/badge/React-19.1.1-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-green) ![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ 주요 기능

### 🎯 게임 모드
- **싱글플레이어 모드**: 혼자서 연습할 수 있는 모드
- **멀티플레이어 모드**: 비공개 방 생성 및 참가
- **공개방 모드**: 공개 방 목록에서 방 입장 및 게임 (방 제목 설정 가능)

### ⏱️ 타이머 시스템
- **메인 타이머**: 각 플레이어에게 최초 40초 부여
- **턴 타이머**: 메인 타이머 소진 후 20초씩 초읽기 구간
- **자동 차례 전환**: 시간 초과 시 자동으로 상대방 차례로 전환
- **실시간 게이지**: 각 플레이어의 남은 시간을 시각적으로 표시

### 🎲 게임 규칙
- **렌주룰 적용**: 흑돌에 대한 공정한 제약 규칙
  - 3-3 금지 (열린 3이 2개 이상)
  - 4-4 금지 (열린 4가 2개 이상, 한 칸 떨어진 4도 포함)
  - 6목 이상 금지 (장목 금지)
- **승리 조건**: 5목을 먼저 만드는 플레이어 승리
- **15x15 보드**: 표준 오목판 크기

### 🌐 실시간 멀티플레이어
- Socket.io 기반 실시간 동기화
- 방 생성 및 참가 시스템 (방 제목 설정 가능)
- 공개방 목록 조회
- 플레이어 준비 상태 관리
- 실시간 게임 상태 동기화
- 방장/게스트 역할 자동 관리 (방장은 항상 흑돌)
- 시간 초과 처리 (서버 측 차례 전환)

### 👤 게스트 인증
- 간편한 게스트 로그인 (별도 회원가입 불필요)
- 24시간 유효 게스트 ID
- 페이지 종료 시 자동 정리

### 📊 경기 기록
- 게임 종료 후 경기 기록 저장
- 경기 기록 목록 조회
- 경기 복기 기능 (착수 순서 재현)
- 게스트별 경기 기록 관리

### 🎨 사용자 인터페이스
- 다크 모드 지원
- 반응형 디자인
- 직관적인 UI/UX
- 실시간 연결 상태 표시
- 게임 규칙 모달 (React Portal 사용)

### 🔒 보안 및 최적화
- 프로덕션 환경에서 개발자 로그 자동 숨김
- 소켓 ID 등 민감한 정보 보호
- 개발 모드와 프로덕션 모드 자동 구분

## 🛠️ 기술 스택

### 프론트엔드
- **React 19.1.1** - UI 라이브러리
- **Vite 7.1.7** - 빌드 도구
- **React Router 6.30.3** - 라우팅
- **Zustand 5.0.9** - 상태 관리
- **Socket.io Client 4.8.3** - 실시간 통신
- **Tailwind CSS 3.4.17** - 스타일링
- **React Icons 5.5.0** - 아이콘

### 백엔드
- **Node.js 16+** - 런타임
- **Express 4.18.2** - 웹 프레임워크
- **Socket.io 4.7.2** - WebSocket 통신
- **Better-SQLite3 12.6.0** - 데이터베이스
- **CORS 2.8.5** - Cross-Origin 리소스 공유

### 배포
- **Docker** - 컨테이너화 지원
- **Docker Compose** - 다중 컨테이너 오케스트레이션
- **PM2** - 프로세스 관리
- **Nginx** - 리버스 프록시 (선택사항)

## 📁 프로젝트 구조

```
public_omok/
├── src/                          # 프론트엔드 소스 코드
│   ├── components/               # React 컴포넌트
│   │   ├── Navbar.jsx           # 네비게이션 바
│   │   └── omok/                # 오목 게임 컴포넌트
│   │       ├── Board.jsx        # 게임 보드
│   │       ├── Cell.jsx         # 개별 셀
│   │       ├── MultiplayerLobby.jsx  # 멀티플레이어 로비
│   │       ├── Rule.jsx         # 게임 규칙 설명 (React Portal)
│   │       └── Timer.jsx        # 타이머 컴포넌트
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── Home.jsx             # 홈 페이지
│   │   ├── RoomList.jsx         # 방 목록 페이지
│   │   ├── PublicRoom.jsx       # 공개방 페이지
│   │   ├── GameHistory.jsx      # 경기 기록 페이지
│   │   └── Replay.jsx           # 경기 복기 페이지
│   ├── hooks/                   # 커스텀 훅
│   │   └── omok/
│   │       ├── useOmokGame.js   # 게임 로직 훅
│   │       ├── useRenjuRule.js  # 렌주룰 체크 훅
│   │       └── useWinner.js     # 승리 체크 훅
│   ├── stores/                   # 상태 관리 (Zustand)
│   │   ├── useGameStore.js      # 게임 상태
│   │   └── useMultiplayerStore.js  # 멀티플레이어 상태
│   ├── services/                 # 서비스 레이어
│   │   └── socketService.js     # Socket.io 서비스
│   └── utils/                    # 유틸리티
│       ├── constants.js         # 상수 정의
│       ├── checkWinner.js       # 승리 체크 로직
│       ├── guestAuth.js         # 게스트 인증
│       └── gameHistory.js       # 경기 기록 관리
├── server/                       # 백엔드 서버
│   ├── server.js                # 서버 메인 파일
│   ├── database.js              # 데이터베이스 로직
│   ├── ecosystem.config.js      # PM2 설정
│   ├── EC2_DEPLOY.md            # EC2 배포 가이드
│   ├── DEPLOY.md                 # 서버 배포 가이드
│   ├── DOCKER_DEPLOY.md         # Docker 배포 가이드
│   └── data/                    # 데이터베이스 파일 (Git에서 제외)
│       └── omok.db              # SQLite 데이터베이스
├── dist/                         # 빌드 결과물 (프론트엔드)
├── Dockerfile                    # 프론트엔드 Dockerfile
├── docker-compose.yml           # Docker Compose 설정
├── nginx.conf                    # Nginx 설정 (프론트엔드)
├── package.json                  # 프론트엔드 의존성
├── vite.config.js               # Vite 설정
├── tailwind.config.js           # Tailwind 설정
├── .gitignore                   # Git 제외 파일 목록
├── DEPLOY.md                     # 전체 배포 가이드
├── DEPLOY_S3.md                  # S3 배포 가이드
├── DOCKER.md                     # Docker 배포 가이드
├── README_MULTIPLAYER.md         # 멀티플레이어 가이드
└── README.md                     # 프로젝트 문서
```

## 🚀 시작하기

### 필수 요구사항

- **Node.js** v16 이상
- **npm** v8 이상
- (선택) **Docker** 및 **Docker Compose** (Docker 배포 시)

### 설치 및 실행

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd public_omok
```

#### 2. 프론트엔드 의존성 설치

```bash
npm install
```

#### 3. 백엔드 의존성 설치

```bash
cd server
npm install
cd ..
```

#### 4. 개발 서버 실행

**터미널 1: 백엔드 서버**
```bash
cd server
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

**터미널 2: 프론트엔드**
```bash
npm run dev
```

프론트엔드가 `http://localhost:5173` (또는 다른 포트)에서 실행됩니다.

#### 5. 브라우저에서 접속

브라우저에서 `http://localhost:5173`을 열어 게임을 시작하세요.

### Docker를 사용한 실행

```bash
# 전체 스택 실행 (프론트엔드 + 백엔드)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

자세한 내용은 [DOCKER.md](./DOCKER.md)를 참고하세요.

## 🎮 사용 방법

### 게스트 로그인

1. 홈 페이지에서 **"게스트"** 버튼 클릭
2. 자동으로 게스트 ID가 생성됩니다 (24시간 유효)
3. 게스트 ID는 페이지 상단에 표시됩니다

### 싱글플레이어 모드

1. 게스트 로그인 후 홈 페이지에서 게임 보드가 표시됩니다
2. 흑돌부터 시작하여 번갈아가며 돌을 놓습니다
3. 5목을 먼저 만드는 플레이어가 승리합니다
4. 흑돌에는 렌주룰이 적용됩니다 (3-3, 4-4, 6목 금지)
5. 각 플레이어에게 40초의 메인 타이머가 주어지며, 소진 후 20초씩 초읽기 구간으로 전환됩니다

### 멀티플레이어 모드 (비공개 방)

1. 게임 보드에서 **"멀티플레이어 시작"** 버튼 클릭
2. **"방 만들기"** 클릭하여 새 방 생성
3. 생성된 방 ID를 복사하여 상대방에게 공유
4. 상대방이 **"방 참가"**를 클릭하고 방 ID 입력
5. 두 플레이어가 모두 준비되면 게임 시작
6. 타이머는 각 플레이어 독립적으로 작동합니다

### 공개방 모드

1. 게스트 로그인 후 홈 페이지에서 **"공개방 입장"** 버튼 클릭
2. 방 목록에서 원하는 방 선택 또는 **"방 만들기"** 클릭
3. 방 만들기 시 방 제목을 설정할 수 있습니다 (선택사항)
4. 방에 입장하여 준비 상태로 변경
5. 호스트가 **"START"** 버튼을 누르면 게임 시작
6. 게임 중 타이머가 표시되며 시간 초과 시 자동으로 차례가 전환됩니다

### 경기 기록

1. 게임 종료 후 **"저장하기"** 버튼 클릭
2. 네비게이션 바의 **"경기 기록"** 메뉴 클릭
3. 저장된 경기 목록 확인
4. **"복기"** 버튼을 클릭하여 경기 재현
5. 복기 페이지에서 `<`, `>` 버튼으로 착수 순서 탐색

### 게임 규칙 확인

1. 네비게이션 바의 **"규칙"** 버튼 클릭
2. 렌주룰 및 게임 규칙 확인
3. 모달 창을 닫으려면 배경을 클릭하거나 X 버튼 클릭

## 📋 게임 규칙

### 기본 규칙

- **보드 크기**: 15x15
- **승리 조건**: 가로, 세로, 대각선 중 하나의 방향으로 5개 연속
- **선수**: 흑돌이 먼저 시작
- **방장 역할**: 공개방에서 방을 만든 플레이어는 항상 흑돌

### 타이머 규칙

- **메인 타이머**: 각 플레이어에게 최초 40초 부여
- **턴 타이머**: 메인 타이머 소진 후 20초씩 초읽기 구간
- **시간 초과**: 턴 타이머가 0이 되면 자동으로 상대방 차례로 전환
- **타이머 리셋**: 착수 시 턴 타이머가 20초로 리셋됨

### 렌주룰 (흑돌 제약)

흑돌은 다음의 금수를 두면 안 됩니다:

1. **3-3 금지**: 열린 3이 동시에 2개 이상 생기는 수
2. **4-4 금지**: 열린 4가 동시에 2개 이상 생기는 수 (한 칸 떨어진 4도 포함)
3. **6목 이상 금지**: 6개 이상 연속으로 만드는 수 (장목)

백돌에는 제약이 없으며, 모든 수를 둘 수 있습니다.

### 금수 예시

- **3-3**: 한 수로 열린 3이 2개 생기는 경우
- **4-4**: 한 수로 열린 4가 2개 생기는 경우
- **6목**: 6개 이상 연속으로 만드는 경우

## 🔧 개발

### 빌드

```bash
# 프론트엔드 빌드
npm run build

# 빌드 결과물은 dist/ 디렉토리에 생성됩니다
```

### 린트

```bash
npm run lint
```

### 환경 변수

> **보안 주의**: `.env` 파일은 Git에 올라가지 않습니다. `.env.example`에는 **개발 환경용 기본값만** 포함되어 있으며, 프로덕션 환경의 실제 값은 포함되지 않습니다.

#### 프론트엔드

**개발 환경 (로컬):**
```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

`.env.example`에는 다음 기본값이 포함되어 있습니다:
```env
VITE_SERVER_URL=http://localhost:3001
```

**프로덕션 빌드:**
프로덕션 환경에서는 `.env.production` 파일을 직접 생성하세요 (`.env.example` 사용하지 않음):
```env
# 실제 프로덕션 서버 주소로 변경
VITE_SERVER_URL=https://api.your-domain.com
```

#### 백엔드

**개발 환경 (로컬):**
```bash
# server/.env.example을 복사하여 server/.env 파일 생성
cp server/.env.example server/.env
```

`server/.env.example`에는 다음 개발 환경 기본값이 포함되어 있습니다:
```env
PORT=4001
NODE_ENV=deployment
CORS_ORIGIN=http://localhost:4001

# 데이터베이스 초기화 설정 (선택사항)
# RESET_DB_ON_START=false
```

**프로덕션 환경 (EC2 등):**
프로덕션 환경에서는 `.env.example`을 복사한 후 **반드시 프로덕션 값으로 수정**하세요:

```bash
cd server
cp .env.example .env
nano .env  # 또는 vi .env
```

다음과 같이 수정:
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# 데이터베이스 초기화 설정 (선택사항)
# RESET_DB_ON_START=false
```

> **중요 사항**:
> - `.env.example`은 **템플릿**이며, 개발 환경용 기본값만 포함합니다
> - 프로덕션 환경에서는 `.env.example`을 복사한 후 **반드시 실제 프로덕션 값으로 수정**해야 합니다
> - 실제 도메인, API 키 등 민감한 정보는 `.env.example`에 포함하지 않습니다
> - 각 환경(로컬, EC2 등)에서 `.env` 파일을 직접 생성하고 관리해야 합니다

### 개발 모드 vs 프로덕션 모드

- **개발 모드** (`npm run dev`): `import.meta.env.DEV = true`
  - 모든 로그가 콘솔에 출력됩니다
  - 소켓 ID 등 개발 정보가 표시됩니다

- **프로덕션 모드** (`npm run build`): `import.meta.env.PROD = true`
  - 개발자 로그가 자동으로 숨겨집니다
  - 민감한 정보가 노출되지 않습니다

## 📦 배포

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

### 빠른 배포 요약

#### Docker를 사용한 배포 (권장)

```bash
# 환경 변수 설정
export PORT=3001
export CORS_ORIGIN=https://yourdomain.com
export VITE_SERVER_URL=https://api.yourdomain.com

# 전체 스택 실행
docker-compose up -d
```

자세한 내용은 [DOCKER.md](./DOCKER.md)를 참고하세요.

#### 수동 배포 (단일 서버)

프로덕션 모드에서는 **단일 서버로 프론트엔드와 백엔드를 모두 서빙**합니다:

```bash
# 1. 프론트엔드 빌드
npm install
npm run build

# 2. 백엔드 의존성 설치 및 실행
cd server
npm install --production
NODE_ENV=production pm2 start ecosystem.config.js --env production
```

> **중요**: 
> - 프로덕션 모드(`NODE_ENV=production`)에서는 서버가 자동으로 `dist/` 폴더의 정적 파일을 서빙합니다.
> - 프론트엔드와 백엔드가 같은 서버에서 서빙되므로 별도의 프론트엔드 서버가 필요하지 않습니다.
> - `VITE_SERVER_URL` 환경 변수 설정이 필요 없습니다 (상대 경로 사용).

#### EC2 배포

AWS EC2에 배포하는 경우:
- **Docker 사용**: [server/DOCKER_DEPLOY.md](./server/DOCKER_DEPLOY.md) 참고
- **PM2/systemd 사용**: [server/EC2_DEPLOY.md](./server/EC2_DEPLOY.md) 참고

#### S3 배포

AWS S3에 프론트엔드를 배포하는 경우:
- [DEPLOY_S3.md](./DEPLOY_S3.md) 참고

## 🗄️ 데이터베이스

### 데이터베이스 구조

- **SQLite** 데이터베이스 사용 (`server/data/omok.db`)
- **rooms**: 방 정보 (ID, 호스트, 제목, 상태 등)
- **players**: 플레이어 정보 (방 ID, 소켓 ID, 플레이어 타입 등)
- **game_history**: 경기 기록 (게스트 ID, 승자, 착수 기록 등)

### 데이터 초기화

- **기본 동작**: 서버 재시작 시 모든 데이터가 자동으로 초기화됩니다
- **데이터 유지**: 환경 변수 `RESET_DB_ON_START=false` 설정 시 데이터 유지

### Git 제외

데이터베이스 파일은 `.gitignore`에 포함되어 Git에 올라가지 않습니다:
- `server/data/*.db`
- `server/data/*.db-journal`
- `server/data/*.db-wal`
- `server/data/*.db-shm`

### 백업

EC2 배포 시 자동 백업 스크립트 예시는 [server/EC2_DEPLOY.md](./server/EC2_DEPLOY.md)를 참고하세요.

## 🐛 문제 해결

### 서버 연결 안 됨

1. 백엔드 서버가 실행 중인지 확인
2. 포트 3001이 사용 가능한지 확인
3. 방화벽 설정 확인
4. 브라우저 콘솔에서 오류 확인
5. 프로덕션 모드에서는 `VITE_SERVER_URL` 설정이 필요 없습니다 (같은 서버에서 서빙)

### 정적 파일이 로드되지 않을 때 (404 오류)

프론트엔드 파일(`index-*.js` 등)을 찾을 수 없다는 오류가 발생하는 경우:

1. **프론트엔드 빌드 확인**: `dist/` 폴더가 존재하는지 확인
   ```bash
   ls -la dist/
   ```

2. **프로덕션 모드 확인**: `NODE_ENV=production`이 설정되어 있는지 확인
   ```bash
   echo $NODE_ENV
   ```

3. **빌드 재실행**: 프론트엔드를 다시 빌드
   ```bash
   npm run build
   ```

4. **서버 재시작**: 변경사항 적용을 위해 서버 재시작
   ```bash
   pm2 restart omok-server
   ```

### 게임이 동기화되지 않음

1. Socket.io 연결 상태 확인
2. 네트워크 연결 확인
3. 서버 로그 확인
4. 브라우저 콘솔에서 WebSocket 연결 확인

### 타이머가 작동하지 않음

1. 게임이 시작되었는지 확인 (보드에 돌이 하나라도 있어야 함)
2. 멀티플레이어 모드에서는 게임이 시작된 후에만 타이머가 표시됩니다
3. 싱글플레이어 모드에서는 첫 돌을 놓은 후 타이머가 시작됩니다
4. 시간 초과 시 차례 전환이 자동으로 이루어지는지 확인

### 금수 오류

1. 렌주룰 로직이 올바르게 작동하는지 확인
2. 브라우저 콘솔에서 오류 메시지 확인

### 경기 기록이 저장되지 않음

1. 게임이 정상적으로 종료되었는지 확인
2. 착수 기록이 있는지 확인 (빈 게임은 저장되지 않음)
3. 서버 데이터베이스 파일 권한 확인

### 타이머 시간 초과 후 차례가 전환되지 않음

**증상**: 초읽기 20초가 지나도 공격 차례가 상대방으로 넘어가지 않음

**원인**: 
- 싱글플레이어 모드에서 `setTimeout` 사용으로 인한 타이밍 이슈
- 멀티플레이어 모드에서 서버에 시간 초과 이벤트가 전송되지 않음

**해결 방법**:
- ✅ 싱글플레이어 모드: `setTimeout` 제거하고 `useGameStore.setState`로 직접 차례 전환
- ✅ 멀티플레이어 모드: 서버에 `timeout` 이벤트 전송 및 서버 측 차례 전환 처리 추가
- ✅ 차례 전환 시 새로운 차례 플레이어의 턴 타이머 자동 리셋

**참고**: `src/components/omok/Timer.jsx`와 `server/server.js`의 `timeout` 이벤트 핸들러 확인

### 규칙 설명창이 바둑알 뒤에 표시됨

**증상**: 규칙 버튼을 클릭하면 규칙 설명창이 바둑알 뒤에 가려져 보임

**원인**: 
- Rule 컴포넌트가 Navbar 내부에서 렌더링되어 stacking context 문제 발생
- z-index가 충분히 높지 않음

**해결 방법**:
- ✅ React Portal을 사용하여 `document.body`에 직접 렌더링
- ✅ z-index를 `z-[9999]`로 설정하여 최상위에 표시
- ✅ 배경 오버레이에 반투명 배경 추가

**참고**: `src/components/omok/Rule.jsx`에서 `createPortal` 사용

### 개발자 도구에 소켓 ID 등 개발 정보 노출

**증상**: 프로덕션 환경에서도 개발자 도구에 소켓 ID, 디버그 로그 등이 표시됨

**원인**: 
- 모든 환경에서 `console.log`가 출력됨
- 프로덕션 모드와 개발 모드 구분 없음

**해결 방법**:
- ✅ `import.meta.env.DEV`를 사용하여 개발 모드에서만 로그 출력
- ✅ 프로덕션 빌드 시 자동으로 로그가 숨겨짐
- ✅ 소켓 ID 등 민감한 정보는 개발 모드에서만 표시

**수정된 파일**:
- `src/services/socketService.js`
- `src/stores/useGameStore.js`
- `src/components/omok/MultiplayerLobby.jsx`
- `src/stores/useMultiplayerStore.js`

### .env 파일이 Git에 올라가는 보안 문제

**증상**: `.env` 파일이 Git 저장소에 포함되어 민감한 정보가 노출됨

**원인**: 
- `.env` 파일이 Git에 추적되고 있었음
- `.gitignore`에 명시되어 있었지만 이미 추적 중이었음

**해결 방법**:
1. Git 추적에서 제거:
   ```bash
   git rm --cached .env .env.production server/.env server/.env.production
   ```

2. `.gitignore` 업데이트:
   ```
   .env
   .env.production
   .env.*.local
   server/.env
   server/.env.production
   server/.env.*.local
   ```

3. `.env.example` 파일 생성 (템플릿):
   - 개발 환경용 기본값만 포함
   - 프로덕션 환경의 실제 값은 포함하지 않음
   - 각 환경에서 `.env.example`을 복사하여 `.env` 생성

**중요**: 
- `.env.example`은 Git에 올라가지만 실제 값은 포함하지 않음
- 각 환경(로컬, EC2)에서 `.env.example`을 복사한 후 실제 값으로 수정해야 함

### EC2에서 git pull 시 충돌 발생

**증상**: `git pull origin main` 실행 시 `.env` 파일 관련 충돌 발생

**원인**: 
- 로컬에서 `.env` 파일을 삭제했지만 원격에는 수정된 버전이 있음
- modify/delete 충돌 발생

**해결 방법**:
```bash
# 1. rebase 중단
git rebase --abort

# 2. merge 방식으로 pull
git pull origin main

# 3. 충돌 발생 시 .env 파일 삭제 확정
git rm .env server/.env

# 4. 커밋
git commit -m "Remove .env files from tracking"

# 5. .env.example에서 .env 파일 재생성
cp server/.env.example server/.env
# 프로덕션 값으로 수정
nano server/.env
```

### .env 파일이 자동으로 로드되지 않음

**증상**: `server/.env` 파일에 `PORT=4001`로 설정했지만 서버가 3001 포트로 실행됨

**원인**: 
- Node.js는 기본적으로 `.env` 파일을 자동으로 로드하지 않음
- `dotenv` 패키지가 설치되지 않았거나 로드되지 않음

**해결 방법**:
1. `dotenv` 패키지 설치:
   ```bash
   cd server
   npm install dotenv
   ```

2. `server.js` 상단에 추가:
   ```javascript
   import 'dotenv/config';
   ```

3. 이제 `.env` 파일이 자동으로 로드되어 `process.env.PORT`가 올바르게 읽힘

**확인**:
- `npm run dev` 실행 시 `server/.env`의 `PORT=4001`이 적용됨
- 프로덕션 환경에서도 `.env` 파일이 자동으로 로드됨

## 📚 추가 문서

- [멀티플레이어 가이드](./README_MULTIPLAYER.md) - 멀티플레이어 기능 상세 설명
- [배포 가이드](./DEPLOY.md) - 프로덕션 배포 방법
- [Docker 배포 가이드](./DOCKER.md) - Docker를 사용한 배포 방법
- [S3 배포 가이드](./DEPLOY_S3.md) - AWS S3 배포 방법
- [EC2 배포 가이드](./server/EC2_DEPLOY.md) - AWS EC2 배포 방법
- [서버 연결 가이드](./서버_연결_가이드.md) - 서버 연결 설정 방법

## 🔒 보안 고려사항

- 게스트 인증은 localStorage 기반으로 구현되어 있습니다
- 프로덕션 환경에서 개발자 로그 자동 숨김 처리
- 소켓 ID 등 민감한 정보는 프로덕션 모드에서 노출되지 않습니다
- 프로덕션 환경에서는 HTTPS 사용을 권장합니다
- CORS 설정을 적절히 구성하여 허용된 도메인만 접근하도록 설정하세요
- 환경 변수를 통한 민감한 정보 관리
- 데이터베이스 파일은 Git에서 제외되어 있습니다

## 🤝 기여

이슈 제기나 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

## 🙏 감사의 말

- 오목 게임 규칙 참고: 렌주룰 (連珠ルール)
- Socket.io를 활용한 실시간 통신 구현
- React와 Vite를 활용한 현대적인 프론트엔드 개발

---

**즐거운 게임 되세요! 🎮**
