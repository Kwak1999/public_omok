# 멀티플레이어 오목 게임 사용 가이드

## 전체 구조

```
프로젝트/
├── server/              # 백엔드 서버 (Node.js + Socket.io)
│   ├── server.js        # 서버 메인 파일
│   └── package.json     # 서버 의존성
└── src/                 # 프론트엔드 (React)
    ├── services/
    │   └── socketService.js    # Socket 통신 서비스
    ├── stores/
    │   ├── useGameStore.js           # 게임 상태 관리
    │   └── useMultiplayerStore.js     # 멀티플레이어 상태 관리
    └── components/
        └── omok/
            ├── Board.jsx              # 게임 보드
            ├── Cell.jsx               # 개별 셀
            └── MultiplayerLobby.jsx    # 멀티플레이어 로비
```

## 시작하기

### 1. 백엔드 서버 실행

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치 (처음 한 번만)
npm install

# 서버 실행
npm start
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
# 프로젝트 루트에서
npm run dev
```

프론트엔드가 `http://localhost:5173` (또는 다른 포트)에서 실행됩니다.

## 사용 방법

### 멀티플레이어 게임 시작

1. 게임 화면에서 **"멀티플레이어 시작"** 버튼 클릭
2. **"방 만들기"** 클릭
3. 생성된 방 ID를 복사하여 상대방에게 공유
4. 상대방이 **"방 참가"**를 클릭하고 방 ID 입력
5. 두 플레이어가 모두 준비되면 게임 시작!

### 게임 플레이

- 멀티플레이어 모드에서는 **자신의 차례일 때만** 착수 가능
- 상대방의 착수는 실시간으로 동기화됨
- 승자가 결정되면 게임 종료

## 주요 기능

### 1. 실시간 동기화
- 한 플레이어가 착수하면 다른 플레이어의 화면에도 즉시 반영
- 서버에서 게임 상태를 관리하여 일관성 유지

### 2. 차례 제어
- 자신의 차례가 아닐 때는 클릭 불가
- 현재 플레이어 표시

### 3. 방 관리
- 고유한 방 ID로 방 생성
- 최대 2명까지 참가 가능
- 플레이어 나가기 감지

## 개발자 가이드

### Socket 이벤트 흐름

```
1. 클라이언트 연결
   → socket.connect()

2. 방 생성
   클라이언트: emit('createRoom')
   서버: emit('roomCreated', { roomId, player })

3. 방 참가
   클라이언트: emit('joinRoom', { roomId })
   서버: emit('playerJoined', { players, board, currentPlayer })

4. 착수
   클라이언트: emit('placeStone', { roomId, row, col })
   서버: 승리 체크 후 emit('stonePlaced', { board, currentPlayer, winner })

5. 게임 리셋
   클라이언트: emit('resetGame', { roomId })
   서버: emit('gameReset', { board, currentPlayer })
```

### 상태 관리

- `useGameStore`: 게임 보드, 현재 플레이어, 승자 등 게임 상태
- `useMultiplayerStore`: 멀티플레이어 관련 상태 (방 ID, 내 플레이어 등)

### 서버 상태 동기화

멀티플레이어 모드에서는 서버가 게임 상태의 단일 소스입니다:
- 클라이언트는 착수 요청만 전송
- 서버가 승리 체크 및 상태 업데이트
- 모든 클라이언트가 서버의 상태를 받아 동기화

## 문제 해결

### 서버 연결 안 됨
- 서버가 실행 중인지 확인
- `http://localhost:3001`이 올바른지 확인
- 방화벽 설정 확인

### 착수가 반영 안 됨
- 자신의 차례인지 확인
- 서버 연결 상태 확인
- 브라우저 콘솔에서 오류 확인

### 상대방이 보이지 않음
- 같은 방 ID를 사용하는지 확인
- 서버 로그 확인
