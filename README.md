# 🎮 오목 게임 (Omok Game)

React와 Socket.io를 활용한 실시간 멀티플레이어 오목 게임입니다. 싱글플레이어와 멀티플레이어 모드를 지원하며, 렌주룰(連珠ルール)을 적용한 정식 오목 규칙을 구현했습니다.

![오목 게임](https://img.shields.io/badge/React-19.1.1-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-green) ![Node.js](https://img.shields.io/badge/Node.js-16+-brightgreen)

## ✨ 주요 기능

### 🎯 게임 모드
- **싱글플레이어 모드**: 혼자서 연습할 수 있는 모드
- **멀티플레이어 모드**: 비공개 방 생성 및 참가
- **공개방 모드**: 공개 방 목록에서 방 입장 및 게임

### 🎲 게임 규칙
- **렌주룰 적용**: 흑돌에 대한 공정한 제약 규칙
  - 3-3 금지 (열린 3이 2개 이상)
  - 4-4 금지 (열린 4가 2개 이상, 한 칸 떨어진 4도 포함)
  - 6목 이상 금지 (장목 금지)
- **승리 조건**: 5목을 먼저 만드는 플레이어 승리
- **15x15 보드**: 표준 오목판 크기

### 🌐 실시간 멀티플레이어
- Socket.io 기반 실시간 동기화
- 방 생성 및 참가 시스템
- 공개방 목록 조회
- 플레이어 준비 상태 관리
- 실시간 게임 상태 동기화

### 🎨 사용자 인터페이스
- 다크 모드 지원
- 반응형 디자인
- 직관적인 UI/UX
- 실시간 연결 상태 표시

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
│   │       └── Rule.jsx          # 게임 규칙 설명
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── Home.jsx             # 홈 페이지
│   │   ├── RoomList.jsx         # 방 목록 페이지
│   │   └── PublicRoom.jsx       # 공개방 페이지
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
│       └── checkWinner.js       # 승리 체크 로직
├── server/                       # 백엔드 서버
│   ├── server.js                # 서버 메인 파일
│   ├── database.js              # 데이터베이스 로직
│   ├── ecosystem.config.js      # PM2 설정
│   └── data/                    # 데이터베이스 파일
│       └── omok.db              # SQLite 데이터베이스
├── dist/                         # 빌드 결과물 (프론트엔드)
├── package.json                  # 프론트엔드 의존성
├── vite.config.js               # Vite 설정
├── tailwind.config.js           # Tailwind 설정
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

## 🎮 사용 방법

### 싱글플레이어 모드

1. 홈 페이지에서 게임 보드가 표시됩니다
2. 흑돌부터 시작하여 번갈아가며 돌을 놓습니다
3. 5목을 먼저 만드는 플레이어가 승리합니다
4. 흑돌에는 렌주룰이 적용됩니다 (3-3, 4-4, 6목 금지)

### 멀티플레이어 모드 (비공개 방)

1. 게임 보드에서 **"멀티플레이어 시작"** 버튼 클릭
2. **"방 만들기"** 클릭하여 새 방 생성
3. 생성된 방 ID를 복사하여 상대방에게 공유
4. 상대방이 **"방 참가"**를 클릭하고 방 ID 입력
5. 두 플레이어가 모두 준비되면 게임 시작

### 공개방 모드

1. 홈 페이지에서 **"공개방 입장"** 버튼 클릭
2. 방 목록에서 원하는 방 선택 또는 새 방 생성
3. 방에 입장하여 준비 상태로 변경
4. 호스트가 게임 시작 버튼을 누르면 게임 시작

## 📋 게임 규칙

### 기본 규칙

- **보드 크기**: 15x15
- **승리 조건**: 가로, 세로, 대각선 중 하나의 방향으로 5개 연속
- **선수**: 흑돌이 먼저 시작

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

#### 프론트엔드

`.env` 파일 생성 (선택사항):
```env
VITE_SERVER_URL=http://localhost:3001
```

#### 백엔드

`server/.env` 파일 생성:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

## 📦 배포

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

### 빠른 배포 요약

**백엔드:**
```bash
cd server
npm install --production
pm2 start ecosystem.config.js --env production
```

**프론트엔드:**
```bash
npm install
VITE_SERVER_URL=https://api.yourdomain.com npm run build
# dist/ 디렉토리를 웹 서버에 배포
```

## 🐛 문제 해결

### 서버 연결 안 됨

1. 백엔드 서버가 실행 중인지 확인
2. 포트 3001이 사용 가능한지 확인
3. 방화벽 설정 확인
4. 브라우저 콘솔에서 오류 확인

### 게임이 동기화되지 않음

1. Socket.io 연결 상태 확인
2. 네트워크 연결 확인
3. 서버 로그 확인

### 금수 오류

1. 렌주룰 로직이 올바르게 작동하는지 확인
2. 브라우저 콘솔에서 오류 메시지 확인

## 📚 추가 문서

- [멀티플레이어 가이드](./README_MULTIPLAYER.md) - 멀티플레이어 기능 상세 설명
- [서버 연결 가이드](./서버_연결_가이드.md) - 서버 설정 및 연결 방법
- [배포 가이드](./DEPLOY.md) - 프로덕션 배포 방법

## 🤝 기여

이슈 제기나 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

## 🙏 감사의 말

- 오목 게임 규칙 참고: 렌주룰 (連珠ルール)
- Socket.io를 활용한 실시간 통신 구현

---

**즐거운 게임 되세요! 🎮**
