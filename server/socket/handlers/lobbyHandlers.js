/**
 * Socket.IO 로비 관련 이벤트 핸들러
 * 공개방 리스트, Ready 상태, 게임 시작 등
 */
import { createEmptyBoard } from '../../game/board.js';
import {
  getPublicRooms,
  getRoom,
  togglePlayerReady,
  startGame,
} from '../../database.js';
import { roomManager } from '../../services/roomManager.js';

/**
 * 공개방 리스트 요청 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleGetPublicRooms = (io) => (socket) => {
  socket.on('getPublicRooms', (callback) => {
    try {
      const rooms = getPublicRooms();
      if (callback) callback({ success: true, rooms });
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
    }
  });
};

/**
 * Ready 상태 토글 핸들러 (공개방만)
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleToggleReady = (io) => (socket) => {
  socket.on('toggleReady', (data, callback) => {
    const { roomId } = data;
    
    try {
      const room = togglePlayerReady(roomId, socket.id);
      
      io.to(roomId).emit('roomUpdated', {
        success: true,
        room: {
          id: room.id,
          hostId: room.host_id,
          status: room.status,
          players: room.players,
        },
      });

      if (callback) callback({ success: true, room });
      console.log(`Ready 상태 변경: ${roomId} - ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });
};

/**
 * 게임 시작 핸들러 (방장만 가능)
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleStartGame = (io) => (socket) => {
  socket.on('startGame', (data, callback) => {
    const { roomId } = data;
    
    try {
      const dbRoom = getRoom(roomId);
      
      if (dbRoom.host_socket_id !== socket.id) {
        if (callback) callback({ success: false, error: '방장만 게임을 시작할 수 있습니다.' });
        return;
      }

      const guestPlayer = dbRoom.players.find(p => p.socketId !== dbRoom.host_socket_id);
      if (!guestPlayer || !guestPlayer.isReady) {
        if (callback) callback({ success: false, error: '참가자가 Ready 상태가 되어야 합니다.' });
        return;
      }

      const room = startGame(roomId);
      
      // 게임 방 메모리 초기화 또는 생성
      if (roomManager.hasRoom(roomId)) {
        const gameRoom = roomManager.getRoom(roomId);
        gameRoom.board = createEmptyBoard();
        gameRoom.currentPlayer = 'black';
        gameRoom.winner = null;
        gameRoom.moves = [];
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType,
        }));
      } else {
        roomManager.setRoom(roomId, {
          players: room.players.map(p => ({
            socketId: p.socketId,
            player: p.playerType,
          })),
          board: createEmptyBoard(),
          currentPlayer: 'black',
          winner: null,
          moves: [],
        });
      }

      io.to(roomId).emit('gameStarted', {
        success: true,
        room: {
          id: room.id,
          hostId: room.host_id,
          status: room.status,
          players: room.players,
        },
        board: roomManager.getRoom(roomId)?.board || createEmptyBoard(),
        currentPlayer: 'black',
        moves: [],
      });

      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true, room });
      console.log(`게임 시작: ${roomId} by ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });
};
