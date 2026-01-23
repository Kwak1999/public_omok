/**
 * 모든 Socket.IO 핸들러 통합
 */
import {
  handleCreatePublicRoom,
  handleCreateRoom,
  handleJoinPublicRoom,
  handleJoinRoom,
  handleLeavePublicRoom,
} from './roomHandlers.js';
import {
  handlePlaceStone,
  handleTimeout,
  handleSurrender,
  handleResetGame,
} from './gameHandlers.js';
import {
  handleGetPublicRooms,
  handleToggleReady,
  handleStartGame,
} from './lobbyHandlers.js';
import {
  handleDisconnect,
} from './connectionHandlers.js';

/**
 * Socket에 모든 이벤트 핸들러 등록
 * @param {Server} io - Socket.IO 서버 인스턴스
 * @param {Socket} socket - 소켓 인스턴스
 */
export const setupSocketHandlers = (io, socket) => {
  console.log(`사용자 연결: ${socket.id}`);

  // 공개방 로비 핸들러
  handleGetPublicRooms(io)(socket);
  
  // 방 관련 핸들러
  handleCreatePublicRoom(io)(socket);
  handleCreateRoom(io)(socket);
  handleJoinPublicRoom(io)(socket);
  handleJoinRoom(io)(socket);
  handleLeavePublicRoom(io)(socket);
  
  // 게임 관련 핸들러
  handlePlaceStone(io)(socket);
  handleTimeout(io)(socket);
  handleSurrender(io)(socket);
  handleResetGame(io)(socket);
  
  // Ready/Start 핸들러
  handleToggleReady(io)(socket);
  handleStartGame(io)(socket);
  
  // 연결 해제 핸들러
  handleDisconnect(io)(socket);
};
