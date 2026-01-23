import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { initDatabase } from './database.js';
import { setupRoutes } from './routes/index.js';
import { setupSocketIO } from './socket/index.js';
import { setupStaticFiles } from './middleware/staticFiles.js';
import { PORT, NODE_ENV, RESET_DB_ON_START } from './config/environment.js';

// 데이터베이스 초기화
initDatabase({ resetOnStart: RESET_DB_ON_START });

// Express 앱 생성
const app = express();
app.use(cors());
app.use(express.json());

// HTTP API 라우트 설정
setupRoutes(app);

// 정적 파일 서빙 설정 (프로덕션 환경)
setupStaticFiles(app);

// HTTP 서버 생성
const httpServer = createServer(app);

// Socket.IO 설정
setupSocketIO(httpServer);

// 서버 시작
httpServer.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📦 환경: ${NODE_ENV}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 오류: 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`   다른 프로세스가 포트 ${PORT}를 사용하고 있습니다.`);
    console.error(`   해결 방법:`);
    console.error(`   1. 포트를 사용하는 프로세스 종료:`);
    console.error(`      Windows: netstat -ano | findstr :${PORT}`);
    console.error(`      그 다음: taskkill /PID [PID번호] /F`);
    console.error(`   2. 또는 다른 포트 사용: PORT=3002 npm start`);
    process.exit(1);
  } else {
    console.error('서버 시작 오류:', err);
    process.exit(1);
  }
});
