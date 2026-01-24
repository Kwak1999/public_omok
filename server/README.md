# 🎮 오목 게임 백엔드 서버

Node.js + Express + Socket.IO 기반 실시간 멀티플레이어 오목 게임 서버입니다.

## 📁 프로젝트 구조 (모듈화)

```
server/
├── server.js (49줄)              # 메인 진입점
├── database.js                    # 데이터베이스 로직
│
├── config/                        # 설정
│   └── environment.js            # 환경 변수 관리
│
├── middleware/                    # 미들웨어
│   └── staticFiles.js            # 정적 파일 서빙
│
├── routes/                        # HTTP API 라우트
│   ├── index.js                  # 라우트 통합
│   ├── rooms.js                  # 공개방 API
│   └── gameHistory.js            # 경기 기록 API
│
├── socket/                        # Socket.IO
│   ├── index.js                  # Socket.IO 초기화
│   └── handlers/                 # 이벤트 핸들러
│       ├── index.js              # 핸들러 통합
│       ├── roomHandlers.js       # 방 생성/참가/나가기
│       ├── gameHandlers.js       # 착수/기권/리셋
│       ├── lobbyHandlers.js      # 로비/Ready/Start
│       └── connectionHandlers.js # 연결/해제
│
├── game/                          # 게임 로직
│   ├── board.js                  # 보드 생성 (BOARD_SIZE, createEmptyBoard)
│   ├── winner.js                 # 승리 체크 (checkWinner)
│   └── renju.js                  # 렌주룰 (checkRenjuRule: 3-3, 4-4, 6목)
│
├── services/                      # 서비스
│   └── roomManager.js            # 인메모리 방 관리 (rooms Map)
│
├── data/                          # 데이터베이스 (Git 제외)
│   └── omok.db                   # SQLite 데이터베이스
│
├── ecosystem.config.js           # PM2 설정
├── nginx-omok.conf               # Nginx 설정 파일
└── EC2_DEPLOY.md                 # EC2 배포 가이드
```

### 📌 모듈화의 장점

- **유지보수성**: 각 파일이 100~400줄로 관리하기 쉬움
- **가독성**: 명확한 역할 분담으로 코드 이해 용이
- **확장성**: 새 기능 추가 시 해당 폴더에 파일만 추가
- **테스트**: 독립적인 모듈로 단위 테스트 용이

## 🚀 설치 및 실행

### 개발 환경

```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
nano .env  # 개발 환경 설정

# 개발 서버 실행 (nodemon - 자동 재시작)
npm run dev
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

### 프로덕션 환경 (PM2)

```bash
# 의존성 설치
npm install --production

# 환경 변수 설정
cp .env.example .env
nano .env  # NODE_ENV=production, PORT=3001 등 설정

# PM2로 서버 실행
pm2 start ecosystem.config.js --env production

# PM2 자동 시작 등록
pm2 save
pm2 startup
```

## ⚙️ 환경 변수

### `.env` 파일 설정

```env
# 서버 포트
PORT=3001

# 실행 환경 (development | production)
NODE_ENV=production

# CORS Origin (쉼표로 구분하여 여러 도메인 설정 가능)
CORS_ORIGIN=https://api.strategia-mok.store,https://strategia-mok.store

# 데이터베이스 초기화 여부 (true | false)
RESET_DB_ON_START=false
```

### 환경별 권장 설정

**개발 환경 (로컬)**
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RESET_DB_ON_START=true
```

**프로덕션 환경 (EC2)**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://api.strategia-mok.store,https://strategia-mok.store
RESET_DB_ON_START=false
```

## 🗄️ 데이터베이스

### SQLite 데이터베이스 구조

**위치**: `data/omok.db`

#### 1. `rooms` 테이블
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL,      -- 'waiting' | 'playing' | 'ended'
  created_at INTEGER NOT NULL
);
```

#### 2. `players` 테이블
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  socket_id TEXT NOT NULL,
  player_type TEXT NOT NULL, -- 'black' | 'white'
  is_ready INTEGER NOT NULL, -- 0 | 1
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

#### 3. `game_history` 테이블
```sql
CREATE TABLE game_history (
  id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL,
  room_id TEXT,
  winner TEXT,
  moves TEXT NOT NULL,       -- JSON 배열
  players TEXT,              -- JSON 배열
  timestamp INTEGER NOT NULL
);
```

### 데이터베이스 관리 함수

**`database.js`에서 제공하는 주요 함수:**

- `initDatabase()`: 데이터베이스 초기화
- `createRoom()`: 방 생성
- `getRoom()`: 방 조회
- `getPublicRooms()`: 공개방 목록 조회
- `joinRoom()`: 방 참가
- `removePlayer()`: 플레이어 제거
- `togglePlayerReady()`: Ready 상태 토글
- `startGame()`: 게임 시작
- `endGame()`: 게임 종료
- `saveGameHistory()`: 경기 기록 저장
- `getGameHistory()`: 경기 기록 조회

## 🎮 게임 로직

### 1. 보드 관리 (`game/board.js`)

```javascript
const BOARD_SIZE = 15;

// 15x15 빈 보드 생성
createEmptyBoard() → Array<Array<null>>
```

### 2. 승리 체크 (`game/winner.js`)

```javascript
// 5개 이상 연속 체크 (가로, 세로, 대각선)
checkWinner(board, row, col, player) → boolean
```

### 3. 렌주룰 체크 (`game/renju.js`)

흑돌에만 적용되는 금수 규칙:

```javascript
// 3-3, 4-4, 6목 체크
checkRenjuRule(board, row, col, player) → { isValid, reason }
```

**금수 종류:**
- **3-3**: 열린 3이 동시에 2개 이상
- **4-4**: 열린 4가 동시에 2개 이상 (한 칸 떨어진 4 포함)
- **6목**: 6개 이상 연속 (장목 금지)

## 🌐 HTTP API

### 공개방 API (`routes/rooms.js`)

```
GET /api/rooms
```
- **설명**: 공개방 리스트 조회
- **응답**: `{ success: true, rooms: [...] }`

### 경기 기록 API (`routes/gameHistory.js`)

```
POST /api/game-history
```
- **설명**: 경기 기록 저장
- **Body**: `{ guestId, roomId, winner, moves, players }`
- **응답**: `{ success: true, gameId, game: {...} }`

```
GET /api/game-history/:guestId
```
- **설명**: 게스트별 경기 기록 조회
- **응답**: `{ success: true, history: [...] }`

```
GET /api/game-history/:guestId/:gameId
```
- **설명**: 특정 경기 기록 조회
- **응답**: `{ success: true, game: {...} }`

```
DELETE /api/game-history/:guestId
DELETE /api/game-history/:guestId/:gameId
```
- **설명**: 경기 기록 삭제

## 📡 Socket.IO 이벤트

### 클라이언트 → 서버

#### 방 관리
- **`createPublicRoom`**: 공개방 생성
  - Payload: `{ title?: string }` (콜백)
  - Response: `{ success, room }`

- **`joinPublicRoom`**: 공개방 참가
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success, room }`

- **`leavePublicRoom`**: 공개방 나가기
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success }`

- **`createRoom`**: 비공개 방 생성 (호환성)
  - Payload: `{}`
  - Emit: `roomCreated`

- **`joinRoom`**: 비공개 방 참가 (호환성)
  - Payload: `{ roomId: string }`
  - Emit: `playerJoined`

#### 로비
- **`getPublicRooms`**: 공개방 리스트 조회 (콜백)
  - Response: `{ success, rooms }`

- **`toggleReady`**: Ready 상태 토글
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success, room }`
  - Emit: `roomUpdated` (방 전체)

- **`startGame`**: 게임 시작 (방장만)
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success, room }`
  - Emit: `gameStarted` (방 전체), `publicRoomsUpdated` (전체)

#### 게임 플레이
- **`placeStone`**: 착수
  - Payload: `{ roomId: string, row: number, col: number }`
  - Emit: `stonePlaced` (방 전체)

- **`timeout`**: 시간 초과
  - Payload: `{ roomId: string }`
  - Emit: `stonePlaced` (차례 전환)

- **`surrender`**: 기권
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success }`
  - Emit: `stonePlaced` (승자 결정), `roomUpdated`

- **`resetGame`**: 게임 리셋
  - Payload: `{ roomId: string }` (콜백)
  - Response: `{ success, room }`
  - Emit: `gameReset`, `gameStarted`, `roomUpdated`

### 서버 → 클라이언트

#### 방 관련
- **`roomCreated`**: 방 생성 완료
  - Payload: `{ roomId: string, player: 'black' | 'white' }`

- **`roomUpdated`**: 방 상태 업데이트
  - Payload: `{ success, room: { id, hostId, status, players } }`

- **`roomDeleted`**: 방 삭제됨
  - Payload: `{ roomId: string }`

- **`publicRoomsUpdated`**: 공개방 리스트 업데이트 (전체 브로드캐스트)
  - Payload: `{ rooms: [...] }`

#### 게임 관련
- **`playerJoined`**: 플레이어 참가
  - Payload: `{ roomId, players, board, currentPlayer }`

- **`stonePlaced`**: 착수 완료
  - Payload: `{ row, col, player, board, currentPlayer, winner, moves }`

- **`gameStarted`**: 게임 시작
  - Payload: `{ success, room, board, currentPlayer, moves }`

- **`gameReset`**: 게임 리셋 완료
  - Payload: `{ board, currentPlayer, winner, players, moves }`

- **`playerLeft`**: 플레이어 나감
  - Payload: `{ players }`

#### 오류
- **`error`**: 오류 발생
  - Payload: `{ message: string }`

## 🔧 개발

### 코드 스타일

프로젝트는 **모듈화된 구조**를 따릅니다:

1. **단일 책임 원칙**: 각 파일은 하나의 역할만 담당
2. **의존성 주입**: `io` 객체를 핸들러에 전달
3. **명확한 네이밍**: 파일명과 함수명이 역할을 명시
4. **주석 작성**: JSDoc 스타일로 함수 설명 추가

### 새 기능 추가하기

**예: 채팅 기능 추가**

1. **핸들러 생성**: `server/socket/handlers/chatHandlers.js`
```javascript
export const handleSendMessage = (io) => (socket) => {
  socket.on('sendMessage', (data) => {
    io.to(data.roomId).emit('newMessage', data);
  });
};
```

2. **핸들러 통합**: `server/socket/handlers/index.js`
```javascript
import { handleSendMessage } from './chatHandlers.js';

export const setupSocketHandlers = (io, socket) => {
  // ... 기존 핸들러
  handleSendMessage(io)(socket);
};
```

3. **완료!** 서버가 자동으로 새 이벤트를 처리합니다.

### 테스트

```bash
# 서버 실행
npm run dev

# PM2 로그 확인 (프로덕션)
pm2 logs omok-server

# PM2 상태 확인
pm2 list
```

## 📦 배포

### PM2 설정 (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [{
    name: 'omok-server',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
```

### 배포 명령어

```bash
# 서버 시작
pm2 start ecosystem.config.js --env production

# 서버 재시작
pm2 restart omok-server

# 서버 중지
pm2 stop omok-server

# 서버 삭제
pm2 delete omok-server

# 로그 확인
pm2 logs omok-server

# 모니터링
pm2 monit
```

### Nginx 설정

프로덕션 환경에서는 Nginx를 리버스 프록시로 사용합니다.

**설정 파일**: `nginx-omok.conf`

```nginx
server {
    listen 80;
    server_name api.strategia-mok.store strategia-mok.store;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.strategia-mok.store strategia-mok.store;

    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/api.strategia-mok.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.strategia-mok.store/privkey.pem;

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO 프록시
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 정적 파일 서빙 (프론트엔드)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

## 🐛 문제 해결

### 서버가 실행되지 않음

```bash
# 포트 사용 확인
sudo netstat -tlnp | grep 3001
# 또는
sudo ss -tlnp | grep 3001

# 프로세스 종료
sudo kill -9 <PID>

# 또는 kill-port.js 사용
node kill-port.js 3001
```

### Socket.IO 연결 실패

1. CORS 설정 확인 (`CORS_ORIGIN` 환경 변수)
2. 방화벽 설정 확인 (3001 포트 허용)
3. Nginx 설정 확인 (Socket.IO 프록시)

### 데이터베이스 오류

```bash
# 데이터베이스 초기화
# .env 파일에서 RESET_DB_ON_START=true 설정 후 서버 재시작
pm2 restart omok-server
```

## 📚 추가 문서

- [EC2 배포 가이드](./EC2_DEPLOY.md) - AWS EC2 배포 상세 방법
- [프로젝트 README](../README.md) - 전체 프로젝트 문서

## 🔒 보안

- **환경 변수**: `.env` 파일은 Git에 올리지 않음
- **CORS**: 허용된 도메인만 접근 가능
- **입력 검증**: 모든 클라이언트 입력 검증
- **렌주룰**: 서버 측에서 검증하여 치팅 방지

---

**서버 구조가 깔끔하게 모듈화되어 유지보수하기 쉬워졌습니다!** 🚀
