/**
 * 모든 HTTP API 라우트 통합
 */
import roomsRouter from './rooms.js';
import gameHistoryRouter from './gameHistory.js';

/**
 * Express 앱에 모든 라우트 등록
 * @param {Express} app - Express 앱 인스턴스
 */
export const setupRoutes = (app) => {
  // 공개방 API
  app.use('/api/rooms', roomsRouter);
  
  // 경기 기록 API
  app.use('/api/game-history', gameHistoryRouter);
};
