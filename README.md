# 🎮 오목 게임 (Omok Game)

React와 Socket.io를 활용한 실시간 멀티플레이어 오목 게임입니다. 싱글플레이어와 멀티플레이어 모드를 지원하며, 렌주룰을 적용한 정식 오목 규칙을 구현했습니다.

![오목 게임](https://img.shields.io/badge/React-19.1.1-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-green) ![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen)

## 🌐 배포 사이트

**🔗 [https://strategia-mok.store](https://strategia-mok.store)**

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
- **Dotenv 16.4.7** - 환경 변수 관리

### 배포
- **AWS EC2** - 서버 호스팅
- **PM2** - 프로세스 관리
- **Nginx** - 리버스 프록시 및 정적 파일 서빙
- **Let's Encrypt** - SSL/TLS 인증서

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
│   ├── hooks/                    # 커스텀 훅
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
│
├── server/                       # 백엔드 서버 (모듈화된 구조)
│   ├── server.js                # 서버 메인 파일 (49줄)
│   ├── database.js              # 데이터베이스 로직
│   │
│   ├── config/                   # 설정
│   │   └── environment.js       # 환경 변수 관리
│   │
│   ├── middleware/               # 미들웨어
│   │   └── staticFiles.js       # 정적 파일 서빙
│   │
│   ├── routes/                   # HTTP API 라우트
│   │   ├── index.js             # 라우트 통합
│   │   ├── rooms.js             # 공개방 API
│   │   └── gameHistory.js       # 경기 기록 API
│   │
│   ├── socket/                   # Socket.IO
│   │   ├── index.js             # Socket.IO 초기화
│   │   └── handlers/            # 이벤트 핸들러
│   │       ├── index.js         # 핸들러 통합
│   │       ├── roomHandlers.js  # 방 생성/참가/나가기
│   │       ├── gameHandlers.js  # 착수/기권/리셋
│   │       ├── lobbyHandlers.js # 로비/Ready/Start
│   │       └── connectionHandlers.js  # 연결/해제
│   │
│   ├── game/                     # 게임 로직
│   │   ├── board.js             # 보드 생성
│   │   ├── winner.js            # 승리 체크
│   │   └── renju.js             # 렌주룰
│   │
│   ├── services/                 # 서비스
│   │   └── roomManager.js       # 메모리 방 관리
│   │
│   ├── data/                     # 데이터베이스 (Git 제외)
│   │   └── omok.db              # SQLite 데이터베이스
│   │
│   ├── ecosystem.config.js      # PM2 설정
│   ├── nginx-omok.conf          # Nginx 설정 파일
│   ├── EC2_DEPLOY.md            # EC2 배포 가이드
│   └── README.md                # 서버 문서
│
├── dist/                         # 빌드 결과물 (프론트엔드)
├── public/                       # 정적 파일
│   ├── og-image.png             # Open Graph 이미지
│   ├── robots.txt               # 검색 엔진 크롤러 설정
│   └── sitemap.xml              # 사이트맵
│
├── index.html                    # HTML 엔트리 포인트
├── package.json                  # 프론트엔드 의존성
├── vite.config.js               # Vite 설정
├── tailwind.config.js           # Tailwind 설정
├── .gitignore                   # Git 제외 파일 목록
├── README_MULTIPLAYER.md        # 멀티플레이어 가이드
└── README.md                     # 프로젝트 문서
```

## 🚀 시작하기

### 필수 요구사항

- **Node.js** v16 이상
- **npm** v8 이상

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

#### 4. 환경 변수 설정

**프론트엔드 (.env)**
```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

`.env` 내용:
```env
VITE_SERVER_URL=http://localhost:3001
```

**백엔드 (server/.env)**
```bash
cd server
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

`server/.env` 내용:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RESET_DB_ON_START=true
```

#### 5. 개발 서버 실행

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

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

#### 6. 브라우저에서 접속

브라우저에서 `http://localhost:5173`을 열어 게임을 시작하세요.

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

### 서버 코드 구조

백엔드 서버는 **모듈화된 구조**로 리팩토링되었습니다:

- **server.js** (49줄): 메인 진입점
- **config/**: 환경 변수 관리
- **middleware/**: 정적 파일 서빙 등
- **routes/**: HTTP API 라우트
- **socket/**: Socket.IO 이벤트 핸들러
- **game/**: 게임 로직 (보드, 승리 체크, 렌주룰)
- **services/**: 비즈니스 로직 (방 관리)

이 구조는 **유지보수**, **테스트**, **확장성**을 크게 향상시킵니다.

### 개발 모드 vs 프로덕션 모드

- **개발 모드** (`npm run dev`): `import.meta.env.DEV = true`
  - 모든 로그가 콘솔에 출력됩니다
  - 소켓 ID 등 개발 정보가 표시됩니다

- **프로덕션 모드** (`npm run build`): `import.meta.env.PROD = true`
  - 개발자 로그가 자동으로 숨겨집니다
  - 민감한 정보가 노출되지 않습니다

## 📦 배포

### EC2 배포 (PM2 사용)

프로덕션 환경에서는 **AWS EC2**에 배포하고 **PM2**로 프로세스를 관리합니다.

**상세 가이드**: [server/EC2_DEPLOY.md](./server/EC2_DEPLOY.md)

#### 빠른 배포 요약

```bash
# 1. 프론트엔드 빌드
npm install
npm run build

# 2. 백엔드 환경 변수 설정
cd server
cp .env.example .env
nano .env  # NODE_ENV=production, PORT=3001 등 설정

# 3. 백엔드 의존성 설치 및 PM2로 실행
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save
```

#### Nginx 설정

Nginx를 리버스 프록시로 사용하여 HTTPS와 정적 파일 서빙을 처리합니다:

```bash
# Nginx 설정 파일 복사
sudo cp server/nginx-omok.conf /etc/nginx/sites-available/api.strategia-mok.store
sudo ln -s /etc/nginx/sites-available/api.strategia-mok.store /etc/nginx/sites-enabled/

# Nginx 재시작
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL 인증서

Let's Encrypt를 사용하여 무료 SSL 인증서를 발급받습니다:

```bash
sudo certbot --nginx -d api.strategia-mok.store -d strategia-mok.store
```

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

## 🐛 문제 해결

### 서버 연결 안 됨

1. 백엔드 서버가 실행 중인지 확인
2. 포트 3001이 사용 가능한지 확인
3. 방화벽 설정 확인
4. 브라우저 콘솔에서 오류 확인

### PM2 프로세스 확인

```bash
pm2 list                    # 프로세스 목록
pm2 logs omok-server        # 로그 확인
pm2 restart omok-server     # 재시작
```

### Nginx 설정 확인

```bash
sudo nginx -t               # 설정 파일 문법 검사
sudo systemctl status nginx # Nginx 상태 확인
sudo tail -f /var/log/nginx/error.log  # 에러 로그
```

### 게임이 동기화되지 않음

1. Socket.io 연결 상태 확인
2. 네트워크 연결 확인
3. 서버 로그 확인
4. 브라우저 콘솔에서 WebSocket 연결 확인

## 📚 추가 문서

- [멀티플레이어 가이드](./README_MULTIPLAYER.md) - 멀티플레이어 기능 상세 설명
- [EC2 배포 가이드](./server/EC2_DEPLOY.md) - AWS EC2 배포 방법
- [서버 문서](./server/README.md) - 백엔드 서버 상세 설명

## 🔒 보안 고려사항

- 게스트 인증은 localStorage 기반으로 구현되어 있습니다
- 프로덕션 환경에서 개발자 로그 자동 숨김 처리
- 소켓 ID 등 민감한 정보는 프로덕션 모드에서 노출되지 않습니다
- HTTPS 사용 (Let's Encrypt)
- CORS 설정을 통한 허용 도메인 제한
- 환경 변수를 통한 민감한 정보 관리
- 데이터베이스 파일은 Git에서 제외

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
