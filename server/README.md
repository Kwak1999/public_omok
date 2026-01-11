# 오목 멀티플레이어 서버

WebSocket을 사용한 실시간 멀티플레이어 오목 게임 서버입니다.

## 설치 및 실행

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 서버 실행
npm start

# 또는 개발 모드 (자동 재시작)
npm run dev
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)

## API

### Socket 이벤트

#### 클라이언트 → 서버

- `createRoom`: 방 생성 요청
- `joinRoom`: 방 참가 요청 (`{ roomId: string }`)
- `placeStone`: 착수 요청 (`{ roomId: string, row: number, col: number }`)
- `resetGame`: 게임 리셋 요청 (`{ roomId: string }`)

#### 서버 → 클라이언트

- `roomCreated`: 방 생성 완료 (`{ roomId: string, player: 'black' | 'white' }`)
- `playerJoined`: 플레이어 참가 완료 (`{ roomId, players, board, currentPlayer }`)
- `stonePlaced`: 착수 완료 (`{ row, col, player, board, currentPlayer, winner }`)
- `gameReset`: 게임 리셋 완료 (`{ board, currentPlayer, winner }`)
- `playerLeft`: 플레이어 나감 (`{ players }`)
- `error`: 오류 발생 (`{ message: string }`)
