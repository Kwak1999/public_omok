# 🎮 오목 게임 프로젝트 개발 일지

React + Socket.IO를 활용한 실시간 멀티플레이어 오목 게임 개발 과정에서 배운 점들을 정리한 문서입니다.

---

## 📌 프로젝트 개요

### 목표
- 실시간 멀티플레이어 오목 게임 웹 애플리케이션 개발
- 렌주룰(3-3, 4-4, 6목 금지) 적용
- 공개방 시스템 및 경기 기록 기능 구현

### 기술 스택
**프론트엔드**
- React 19.1.1 + Vite
- Zustand (상태 관리)
- Socket.IO Client
- Tailwind CSS

**백엔드**
- Node.js + Express
- Socket.IO
- SQLite (Better-SQLite3)

**배포**
- AWS EC2
- PM2 (프로세스 관리)
- Nginx (리버스 프록시)
- Let's Encrypt (SSL)

---

## 🚀 개발 과정

### 1단계: 기본 게임 구현
- ✅ 15x15 오목판 구현
- ✅ 착수 로직 및 승리 체크
- ✅ 싱글플레이어 모드

### 2단계: 멀티플레이어 구현
- ✅ Socket.IO 기반 실시간 통신
- ✅ 비공개 방 생성/참가
- ✅ 공개방 시스템
- ✅ 타이머 시스템 (메인 40초 + 초읽기 20초)

### 3단계: 렌주룰 구현
- ✅ 3-3 금지 (열린 3이 2개)
- ✅ 4-4 금지 (열린 4가 2개, 한 칸 떨어진 4 포함)
- ✅ 6목 이상 금지 (장목)

### 4단계: 부가 기능
- ✅ 경기 기록 저장/조회
- ✅ 복기 기능
- ✅ 다크 모드

### 5단계: 배포 및 최적화
- ✅ EC2 배포
- ✅ SSL 인증서 적용
- ✅ 서버 코드 리팩토링 (1292줄 → 49줄)

---

## 😰 가장 어려웠던 문제들

### 1. **UI 정렬 문제 (보드 그래픽)**

#### 문제 상황
```
❌ 768px 이상에서 오목판의 가로줄이 목재 배경과 정렬되지 않음
❌ 그리드 라인과 보드 테두리 간격이 일정하지 않음
❌ 모바일에서 구글 검색으로 접속 시 그래픽 깨짐 (카카오톡은 정상)
```

#### 해결 과정
1. **첫 시도**: 동적 패딩 계산 (`window.innerWidth` 기반)
   - 결과: 더 깨짐 ❌

2. **두 번째 시도**: 퍼센트 기반 그리드 라인 + `transform: translateX/Y(-0.5px)`
   - 결과: 여전히 문제 ❌

3. **세 번째 시도 (성공)**: Replay.jsx 패턴 차용
   ```jsx
   // 레이아웃 박스 (고정 크기)
   <div style={{ width: outerSize, height: outerSize }}>
     {/* 시각 박스 (transform: scale만 적용) */}
     <div style={{ transform: `scale(${scale})` }}>
       {/* 보드 내용 */}
     </div>
   </div>
   ```
   - 결과: 모든 환경에서 완벽하게 작동 ✅

#### 배운 점
> **"레이아웃 박스"와 "시각 박스"를 분리하라**
> - 레이아웃 박스: 실제 공간 차지 (`width`, `height`)
> - 시각 박스: 보이는 크기만 조정 (`transform: scale`)
> - 이렇게 분리하면 반응형 레이아웃에서 오버플로우 문제가 발생하지 않음

---

### 2. **React Hooks 순서 오류**

#### 문제 상황
```javascript
// Timer.jsx
const Timer = () => {
  // ... 기존 hooks

  if (!isMultiplayer || !roomId) {
    return null; // ← 문제!
  }

  // 여기서 useState/useEffect 호출
  const [isMobile, setIsMobile] = useState(false); // ❌
}
```

**에러 메시지**:
```
React has detected a change in the order of Hooks called by Timer.
Rendered more hooks than during the previous render.
```

#### 해결 방법
```javascript
const Timer = () => {
  // ✅ 모든 hooks를 조건문보다 먼저 선언
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // mobile 체크 로직
  }, []);

  // 조건부 렌더링은 hooks 이후에
  if (!isMultiplayer || !roomId) {
    return null;
  }

  // ...
}
```

#### 배운 점
> **React Hooks의 규칙**
> 1. **최상위에서만 호출**: 반복문, 조건문, 중첩 함수 내부에서 호출 금지
> 2. **호출 순서 유지**: 컴포넌트가 렌더링될 때마다 같은 순서로 호출되어야 함
> 3. **이유**: React는 Hook 호출 순서로 상태를 추적함

---

### 3. **플레이어 강제 퇴장 버그**

#### 문제 상황
```
사용자가 착수를 두면 → 서버에서 'error' 이벤트 발생
→ 클라이언트에서 'error' 핸들러가 없음
→ 연결 해제로 오인 → 강제 퇴장 ❌
```

#### 원인 분석
```javascript
// server/socket/handlers/gameHandlers.js
socket.on('placeStone', (data) => {
  // 렌주룰 위반 시
  if (!renjuCheck.isValid) {
    socket.emit('error', { message: renjuCheck.reason }); // 에러 발송
    return;
  }
});
```

```javascript
// client/src/pages/PublicRoom.jsx
// 'error' 핸들러가 없음! ❌
socket.on('roomUpdated', ...);
socket.on('gameStarted', ...);
// socket.on('error', ...) ← 없음!
```

#### 해결 방법
```javascript
// PublicRoom.jsx에 에러 핸들러 추가
socket.on('error', (error) => {
  if (import.meta.env.DEV) {
    console.error('Socket 에러:', error);
  }
  if (error?.message) {
    alert(error.message); // 단순 알림만 표시
  }
  // 연결은 유지!
});
```

#### 배운 점
> **Socket.IO 에러 처리 패턴**
> - 서버에서 `'error'` 이벤트 사용 시, 클라이언트에 반드시 핸들러 필요
> - 에러 = 연결 해제가 아님. 단순 알림용으로 사용 가능
> - 개발/프로덕션 모드를 구분하여 로깅 (`import.meta.env.DEV`)

---

### 4. **배포 아키텍처 선택**

#### 최종 선택: EC2 단일 서버

**아키텍처:**
```
사용자 → strategia-mok.store (Nginx) → Node.js 서버 (3001)
                                       ↓
                               dist/ 폴더 + API
```

**장점:**
- 간단한 설정과 관리
- 환경 변수 관리 용이
- 하나의 서버에서 프론트엔드 + 백엔드 통합

**구현:**
```javascript
// server.js (NODE_ENV=production)
if (NODE_ENV === 'production') {
  app.use(express.static('dist')); // 정적 파일 서빙
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html'); // SPA fallback
  });
}
```

#### 배운 점
> **배포 아키텍처 선택 기준**
> 1. **트래픽 규모**: 초기에는 단일 서버로 충분
> 2. **유지보수 비용**: 복잡할수록 관리 어려움
> 3. **확장 가능성**: 나중에 CDN 추가 가능
> 4. **비용 효율성**: 단일 서버가 초기 비용 최소화

---

### 5. **환경 변수 설정 오류**

#### 문제 상황
```
❌ VITE_SERVER_URL이 undefined
❌ 환경 변수에 여러 URL이 쉼표로 구분되어 있음
   "http://localhost:3001,https://strategia-mok.store"
```

#### 원인
```javascript
// Vite는 하나의 URL만 필요
const serverUrl = import.meta.env.VITE_SERVER_URL;
// 예상: "https://strategia-mok.store"
// 실제: "http://localhost:3001,https://strategia-mok.store" ❌
```

#### 해결
1. **환경 변수 수정**
   ```
   VITE_SERVER_URL=https://strategia-mok.store
   ```

2. **로컬 `.env` 파일 생성**
   ```env
   # 프론트엔드 .env
   VITE_SERVER_URL=http://localhost:3001
   
   # 백엔드 server/.env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. **`.gitignore`에 추가**
   ```
   .env
   .env.production
   server/.env
   server/.env.production
   ```

4. **`.env.example` 생성** (템플릿용)
   ```env
   # .env.example
   VITE_SERVER_URL=http://localhost:3001
   ```

#### 배운 점
> **환경 변수 관리 원칙**
> 1. **분리**: 개발/프로덕션 환경 분리
> 2. **템플릿**: `.env.example`로 필요한 변수 명시
> 3. **Git 제외**: 실제 값은 Git에 올리지 않음
> 4. **문서화**: README에 환경 변수 설명 추가
> 5. **검증**: 서버 시작 시 필수 환경 변수 확인

---

### 6. **SSL 인증서 문제 ("주의 요함")**

#### 문제 상황
```
❌ strategia-mok.store → "주의 요함" (Not Secure)
```

#### 원인
```bash
# SSL 인증서 확인
sudo certbot certificates

# strategia-mok.store가 포함되지 않거나 만료됨 ❌
```

#### 해결
```bash
# SSL 인증서 발급
sudo certbot --nginx -d strategia-mok.store

# 또는 확장
sudo certbot --expand -d strategia-mok.store
```

#### Nginx 설정 개선
```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name strategia-mok.store;
    return 301 https://$host$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name strategia-mok.store;
    
    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/strategia-mok.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/strategia-mok.store/privkey.pem;
    
    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### 배운 점
> **SSL 인증서 관리**
> 1. **도메인 확인**: 모든 도메인이 인증서에 포함되어야 함
> 2. **Certbot 명령어**: `--expand`로 기존 인증서 확장 가능
> 3. **자동 갱신**: Certbot은 90일마다 자동 갱신 (`systemd timer`)
> 4. **HSTS 헤더**: 브라우저에 HTTPS 강제 (보안 향상)

---

## 🎓 새롭게 알게 된 점

### 1. **React Portal의 활용**

#### 문제
```
게임 규칙 모달이 바둑알 뒤에 가려짐 (z-index 문제)
```

#### 해결: React Portal
```jsx
// Rule.jsx
import { createPortal } from 'react-dom';

const Rule = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* 모달 내용 */}
    </div>,
    document.body // ← body에 직접 렌더링
  );
};
```

#### 왜 필요한가?
```
일반 렌더링:
<Navbar>
  <Rule /> ← 부모의 stacking context에 갇힘
</Navbar>

Portal 사용:
<Navbar />
<body>
  <Rule /> ← body 레벨에 독립적으로 렌더링
</body>
```

#### 배운 점
> **Portal 사용 시점**
> - 모달, 툴팁, 드롭다운 등 부모 컨테이너를 벗어나야 할 때
> - z-index 문제 해결
> - 스크롤/오버플로우 제약 회피

---

### 2. **Socket.IO의 이벤트 전파 패턴**

#### 패턴 1: 직접 응답 (callback)
```javascript
// 클라이언트
socket.emit('createPublicRoom', { title }, (response) => {
  console.log(response); // { success: true, room: {...} }
});

// 서버
socket.on('createPublicRoom', (data, callback) => {
  const room = createRoom(data);
  callback({ success: true, room }); // 요청자에게만 응답
});
```

#### 패턴 2: 방 전체에 전송
```javascript
// 서버
io.to(roomId).emit('stonePlaced', data); // 방의 모든 플레이어에게
```

#### 패턴 3: 전체 브로드캐스트
```javascript
// 서버
io.emit('publicRoomsUpdated', { rooms }); // 모든 연결된 클라이언트에게
```

#### 패턴 4: 나를 제외한 방 전체
```javascript
// 서버
socket.to(roomId).emit('roomUpdated', data); // 나를 제외한 방의 다른 플레이어들
```

#### 배운 점
> **이벤트 전파 선택 기준**
> - **callback**: 요청 결과 확인 (성공/실패)
> - **io.to(roomId).emit**: 게임 상태 동기화
> - **io.emit**: 로비 리스트 업데이트
> - **socket.to(roomId).emit**: 상대방에게만 알림

---

### 3. **Zustand의 상태 관리 패턴**

#### 장점
```javascript
// 1. 간결한 문법
const useGameStore = create((set) => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  placeStone: (row, col) => set((state) => ({
    board: updateBoard(state.board, row, col),
  })),
}));

// 2. Redux 대비 보일러플레이트 적음
// Redux: actions, reducers, types, connect 등
// Zustand: create() 하나로 끝

// 3. React DevTools 지원
// 4. TypeScript 친화적
```

#### 실제 사용 패턴
```javascript
// useGameStore.js
export const useGameStore = create((set, get) => ({
  // 상태
  board: createEmptyBoard(),
  winner: null,
  
  // 액션
  placeStone: (row, col) => {
    const { board, currentPlayer } = get();
    // 로직...
    set({ board: newBoard, currentPlayer: nextPlayer });
  },
  
  // 멀티플레이어 동기화
  syncMultiplayerState: (board, currentPlayer, winner, moves) => {
    set({ board, currentPlayer, winner, moves });
  },
}));
```

#### 배운 점
> **Zustand vs Context API vs Redux**
> - **Context API**: 간단하지만 리렌더링 이슈
> - **Redux**: 강력하지만 보일러플레이트 많음
> - **Zustand**: 균형점 (간결 + 성능)
> 
> **사용 시나리오**
> - 작은 프로젝트: Context API
> - 중간 프로젝트: Zustand ✅
> - 대규모 프로젝트: Redux Toolkit

---

### 4. **서버 코드 리팩토링의 중요성**

#### Before: 1292줄의 server.js
```javascript
// server.js (1292줄)
import express from 'express';
import { Server } from 'socket.io';
// ... 모든 로직이 한 파일에

// 게임 로직
function createEmptyBoard() { /* ... */ }
function checkWinner() { /* ... */ }
function checkRenjuRule() { /* ... */ }

// HTTP API
app.get('/api/rooms', (req, res) => { /* ... */ });
app.post('/api/game-history', (req, res) => { /* ... */ });

// Socket.IO
io.on('connection', (socket) => {
  socket.on('createPublicRoom', ...);
  socket.on('joinPublicRoom', ...);
  socket.on('placeStone', ...);
  // ... 30개 이상의 이벤트 핸들러
});
```

#### After: 49줄의 server.js + 모듈화
```javascript
// server.js (49줄)
import express from 'express';
import { createServer } from 'http';
import { setupRoutes } from './routes/index.js';
import { setupSocketIO } from './socket/index.js';
import { setupStaticFiles } from './middleware/staticFiles.js';
import { PORT, NODE_ENV } from './config/environment.js';

const app = express();
app.use(cors());
app.use(express.json());

setupRoutes(app);
setupStaticFiles(app);

const httpServer = createServer(app);
setupSocketIO(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
```

```
폴더 구조:
server/
├── server.js (49줄)
├── config/environment.js (환경 변수)
├── middleware/staticFiles.js (정적 파일)
├── routes/
│   ├── index.js
│   ├── rooms.js
│   └── gameHistory.js
├── socket/
│   ├── index.js
│   └── handlers/
│       ├── roomHandlers.js (300줄)
│       ├── gameHandlers.js (387줄)
│       ├── lobbyHandlers.js (130줄)
│       └── connectionHandlers.js (67줄)
├── game/
│   ├── board.js (20줄)
│   ├── winner.js (63줄)
│   └── renju.js (242줄)
└── services/roomManager.js (64줄)
```

#### 리팩토링 효과
1. **가독성**: 파일별로 100~400줄, 역할 명확
2. **유지보수**: 버그 수정 시 해당 파일만 열면 됨
3. **테스트**: 모듈별로 독립적인 테스트 가능
4. **협업**: 동시에 여러 파일 작업 가능 (Git conflict 최소화)
5. **확장성**: 새 기능 추가 시 새 파일만 추가

#### 배운 점
> **모듈화 원칙**
> 1. **단일 책임 원칙**: 하나의 파일은 하나의 역할만
> 2. **의존성 주입**: 함수에 의존성을 파라미터로 전달
> 3. **명확한 네이밍**: 파일명만 봐도 역할을 알 수 있게
> 4. **계층 구조**: config → services → handlers → routes
> 
> **리팩토링 시기**
> - 파일이 500줄 이상
> - 한 파일에서 스크롤이 너무 많이 필요
> - 코드 찾기가 어려워질 때

---

### 5. **PM2를 활용한 프로세스 관리**

#### 왜 PM2인가?
```bash
# node로 직접 실행
node server.js
# 문제:
# - 터미널 종료 시 서버 종료
# - 오류 발생 시 재시작 안 됨
# - 로그 관리 어려움
# - 여러 프로세스 관리 불가

# PM2로 실행
pm2 start server.js
# 장점:
# - 백그라운드 실행
# - 자동 재시작
# - 로그 관리
# - 클러스터 모드 지원
# - 모니터링
```

#### PM2 주요 명령어
```bash
# 시작
pm2 start ecosystem.config.js --env production
pm2 start server.js --name omok-server

# 관리
pm2 list                # 프로세스 목록
pm2 logs omok-server    # 로그 확인
pm2 restart omok-server # 재시작
pm2 stop omok-server    # 중지
pm2 delete omok-server  # 삭제

# 모니터링
pm2 monit              # 실시간 모니터링
pm2 status             # 상태 확인

# 자동 시작
pm2 save               # 현재 상태 저장
pm2 startup            # 부팅 시 자동 시작 등록
```

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'omok-server',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
```

#### 배운 점
> **PM2 활용 팁**
> 1. **로그 관리**: `pm2 logs --lines 100` (최근 100줄)
> 2. **자동 재시작**: 메모리 초과 시 자동 재시작 설정
> 3. **클러스터 모드**: `instances: 'max'` (멀티코어 활용)
> 4. **모니터링**: PM2 Plus 연동 가능 (무료 티어)

---

### 6. **Nginx 리버스 프록시의 역할**

#### Nginx를 사용하는 이유
```
사용자 → Nginx (443) → Node.js 서버 (3001)
```

**장점:**
1. **SSL 종료**: Nginx가 HTTPS 처리, Node.js는 HTTP만
2. **정적 파일 캐싱**: 효율적인 정적 파일 서빙
3. **로드 밸런싱**: 여러 Node.js 인스턴스로 분산 가능
4. **보안**: Node.js 직접 노출 방지
5. **압축**: Gzip 압축 자동 처리

#### 주요 설정
```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name strategia-mok.store;
    return 301 https://$host$request_uri;
}

# HTTPS 서버
server {
    listen 443 ssl http2;
    server_name strategia-mok.store;
    
    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/strategia-mok.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/strategia-mok.store/privkey.pem;
    
    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }
    
    # Socket.IO 프록시 (WebSocket 지원)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
    
    # 프론트엔드 (정적 파일)
    location / {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

#### 배운 점
> **Nginx 필수 설정**
> 1. **WebSocket 지원**: `Upgrade`, `Connection` 헤더 필수
> 2. **보안 헤더**: HSTS, CSP, X-Frame-Options 추가
> 3. **캐싱**: 정적 파일 캐시 설정
> 4. **압축**: Gzip 활성화로 전송 속도 향상
> 
> **디버깅 팁**
> - `sudo nginx -t`: 설정 파일 문법 검사
> - `sudo tail -f /var/log/nginx/error.log`: 에러 로그
> - `curl -I https://example.com`: 헤더 확인

---

## 💡 핵심 교훈

### 1. **문제 해결 접근법**
```
1단계: 문제 정확히 파악
  - 어떤 상황에서 발생하는가?
  - 재현 가능한가?
  - 에러 메시지는 무엇인가?

2단계: 가설 수립
  - 원인이 무엇일까?
  - 여러 가설 세우기

3단계: 검증
  - 하나씩 테스트
  - 로그/디버거 활용

4단계: 해결 및 문서화
  - 해결책 적용
  - 왜 문제가 발생했는지 기록
  - 비슷한 문제 예방법 정리
```

### 2. **코드 품질의 중요성**
- **리팩토링은 기술 부채 상환**: 나중에 하려면 더 어려움
- **모듈화는 투자**: 초기 시간 소요되지만 장기적 이득
- **문서화는 미래의 나를 위한 것**: 6개월 후에도 이해 가능하게

### 3. **배포의 현실**
- **로컬에서 되면 배포도 된다?** ❌ 환경 차이 많음
- **환경 변수 관리**: 가장 흔한 배포 오류의 원인
- **모니터링**: 배포 후 로그 확인 필수
- **점진적 개선**: 완벽한 아키텍처는 처음부터 불가능

### 4. **기술 선택의 기준**
```
🤔 기술 선택 시 고려사항:
1. 프로젝트 규모에 맞는가?
2. 학습 곡선은 적절한가?
3. 유지보수 가능한가?
4. 커뮤니티 지원이 있는가?
5. 비용은 적절한가?
```

---

## 📊 프로젝트 통계

### 개발 기간
- **총 개발 기간**: 약 2~3주
- **리팩토링**: 1~2일
- **배포 및 최적화**: 3~4일

### 코드 통계
- **프론트엔드**: ~3,000줄
- **백엔드**: ~2,000줄 (리팩토링 후)
- **파일 수**: 50+ 파일

### 주요 버그 수정
- UI/UX 문제: 5건
- 기능 버그: 3건
- 배포 문제: 7건

---

## 🚀 앞으로 개선할 점

### 단기 개선 사항
- [ ] 로그인 시스템 (게스트 → 회원)
- [ ] 관전 기능
- [ ] 채팅 기능
- [ ] 통계 대시보드

### 중기 개선 사항
- [ ] PostgreSQL 전환 (SQLite → PostgreSQL)
- [ ] Redis 도입 (방 관리, 캐싱)
- [ ] PM2 클러스터 모드 (멀티코어 활용)
- [ ] 모니터링 시스템 (Prometheus + Grafana)

### 장기 개선 사항
- [ ] 마이크로서비스 아키텍처
- [ ] Kubernetes 배포
- [ ] CI/CD 파이프라인 고도화
- [ ] 부하 테스트 및 최적화

---

## 📚 참고 자료

### 공식 문서
- [React 공식 문서](https://react.dev/)
- [Socket.IO 공식 문서](https://socket.io/docs/v4/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)

### 유용한 리소스
- [React Hooks 완벽 가이드](https://react.dev/reference/react)
- [Socket.IO 실시간 통신 가이드](https://socket.io/docs/v4/tutorial/)
- [AWS EC2 배포 가이드](https://docs.aws.amazon.com/ec2/)
- [Let's Encrypt 인증서 발급](https://letsencrypt.org/getting-started/)

---

## 🎯 마치며

이 프로젝트를 통해 배운 가장 중요한 것은 **"완벽한 코드는 없다"**는 점입니다. 

처음에는 작동하는 코드를 만드는 것이 목표였지만, 사용자 피드백과 실제 운영 경험을 통해 점진적으로 개선해나가는 과정이 더 중요하다는 것을 깨달았습니다.

**핵심 가치:**
1. **작동하는 코드 > 완벽한 설계**
2. **점진적 개선 > 한 번에 완성**
3. **문서화 > 기억력**
4. **실패로부터 배우기 > 실패 회피**

앞으로도 사용자 피드백을 받으며 지속적으로 개선해나갈 예정입니다! 🚀

---

**작성일**: 2026년 1월 25일  
**프로젝트**: 온라인 오목 게임 (Strategia Mok)  
**배포 URL**: https://strategia-mok.store
