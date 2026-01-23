/**
 * Socket.IO 서버 설정 및 초기화
 */
import { Server } from 'socket.io';
import { setupSocketHandlers } from './handlers/index.js';
import { CORS_ORIGIN, NODE_ENV } from '../config/environment.js';

/**
 * Socket.IO 서버 설정 및 이벤트 핸들러 등록
 * @param {Server} httpServer - HTTP 서버 인스턴스
 * @returns {Server} Socket.IO 서버 인스턴스
 */
export const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // 연결 이벤트
  io.on('connection', (socket) => {
    setupSocketHandlers(io, socket);
  });

  // CORS 경고 (프로덕션 환경)
  if (NODE_ENV === 'production' && CORS_ORIGIN === '*') {
    console.warn('⚠️  경고: 프로덕션 환경에서 CORS가 모든 도메인(*)을 허용하고 있습니다.');
    console.warn('   CORS_ORIGIN 환경 변수를 설정하여 특정 도메인만 허용하세요.');
  }

  console.log(`🌐 Socket.IO CORS Origin: ${Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN.join(', ') : CORS_ORIGIN}`);

  return io;
};
