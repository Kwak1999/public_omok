/**
 * Socket.IO 방 관련 이벤트 핸들러
 * 방 생성, 참가, 나가기 등
 */
import { createEmptyBoard } from '../../game/board.js';
import {
  createRoom,
  getRoom,
  joinRoom,
  removePlayer,
  getPublicRooms,
} from '../../database.js';
import { roomManager } from '../../services/roomManager.js';

/**
 * 공개방 생성 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleCreatePublicRoom = (io) => (socket) => {
  socket.on('createPublicRoom', (data, callback) => {
    try {
      // data가 문자열인 경우 (기존 호환성) 또는 객체인 경우 처리
      const title = typeof data === 'string' ? null : (data?.title || null);
      const actualCallback = typeof data === 'function' ? data : callback;
      
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = createRoom(roomId, socket.id, title);
      
      if (!room) {
        if (actualCallback) actualCallback({ success: false, error: '방 생성에 실패했습니다.' });
        return;
      }
      
      socket.join(roomId);
      
      // 게임 방 메모리에 추가 (게임 진행용)
      if (!roomManager.hasRoom(roomId)) {
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
      
      if (actualCallback) actualCallback({ success: true, room });
      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });
      console.log(`공개방 생성: ${roomId} by ${socket.id}${title ? ` (제목: ${title})` : ''}`);
    } catch (error) {
      console.error('공개방 생성 오류:', error);
      const actualCallback = typeof data === 'function' ? data : callback;
      if (actualCallback) actualCallback({ success: false, error: error.message });
    }
  });
};

/**
 * 비공개 방 생성 핸들러 (호환성 유지)
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleCreateRoom = (io) => (socket) => {
  socket.on('createRoom', (data) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const playerId = socket.id;
    
    roomManager.setRoom(roomId, {
      players: [{ id: playerId, socketId: socket.id, player: 'black' }],
      board: createEmptyBoard(),
      currentPlayer: 'black',
      winner: null,
    });

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, player: 'black' });
    console.log(`방 생성: ${roomId} by ${playerId}`);
  });
};

/**
 * 공개방 참가 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleJoinPublicRoom = (io) => (socket) => {
  socket.on('joinPublicRoom', (data, callback) => {
    const { roomId } = data;
    
    try {
      const rooms = roomManager.getAllRooms();
      
      // 먼저 이전 방에서 나가기 처리
      const currentRooms = Array.from(rooms.keys());
      for (const currentRoomId of currentRooms) {
        if (currentRoomId === roomId) continue;
        
        const currentRoom = rooms.get(currentRoomId);
        if (currentRoom && currentRoom.players.some(p => p.socketId === socket.id)) {
          socket.leave(currentRoomId);
          const prevRoom = getRoom(currentRoomId);
          if (prevRoom) {
            const updatedPrevRoom = removePlayer(currentRoomId, socket.id);
            if (updatedPrevRoom) {
              socket.to(currentRoomId).emit('roomUpdated', {
                success: true,
                room: {
                  id: updatedPrevRoom.id,
                  hostId: updatedPrevRoom.host_id,
                  status: updatedPrevRoom.status,
                  players: updatedPrevRoom.players,
                },
              });
            } else {
              socket.to(currentRoomId).emit('roomDeleted', { roomId: currentRoomId });
              roomManager.deleteRoom(currentRoomId);
            }
            io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });
          }
          break;
        }
      }
      
      // 현재 방에 이미 참가한 플레이어인지 확인
      const currentRoom = getRoom(roomId);
      if (currentRoom && currentRoom.players.some(p => p.socketId === socket.id)) {
        socket.join(roomId);
        
        if (!roomManager.hasRoom(roomId)) {
          roomManager.setRoom(roomId, {
            players: currentRoom.players.map(p => ({
              socketId: p.socketId,
              player: p.playerType,
            })),
            board: createEmptyBoard(),
            currentPlayer: 'black',
            winner: null,
            moves: [],
          });
        }
        
        if (callback) callback({ success: true, room: currentRoom });
        return;
      }
      
      const room = joinRoom(roomId, socket.id);
      
      if (!room) {
        if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
        return;
      }

      socket.join(roomId);

      // 게임 방 메모리 업데이트
      if (roomManager.hasRoom(roomId)) {
        const gameRoom = roomManager.getRoom(roomId);
        const isGameInProgress = gameRoom.winner === null && 
                                 gameRoom.board.some(row => row.some(cell => cell !== null));
        
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType,
        }));
        
        if (!isGameInProgress && room.status === 'waiting') {
          gameRoom.board = createEmptyBoard();
          gameRoom.currentPlayer = 'black';
          gameRoom.winner = null;
          gameRoom.moves = [];
        }
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

      io.to(roomId).emit('roomUpdated', {
        success: true,
        room: {
          id: room.id,
          hostId: room.host_id,
          status: room.status,
          players: room.players,
        },
      });

      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true, room });
      console.log(`플레이어 공개방 참가: ${roomId} - ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });
};

/**
 * 비공개 방 참가 핸들러 (호환성 유지)
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleJoinRoom = (io) => (socket) => {
  socket.on('joinRoom', (data) => {
    const { roomId } = data;
    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없습니다.' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: '방이 가득 찼습니다.' });
      return;
    }

    const playerId = socket.id;
    room.players.push({ id: playerId, socketId: socket.id, player: 'white' });
    socket.join(roomId);

    io.to(roomId).emit('playerJoined', {
      roomId,
      players: room.players,
      board: room.board,
      currentPlayer: room.currentPlayer,
    });

    console.log(`플레이어 참가: ${roomId} - ${playerId}`);
  });
};

/**
 * 공개방 나가기 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleLeavePublicRoom = (io) => (socket) => {
  socket.on('leavePublicRoom', (data, callback) => {
    const { roomId } = data;

    try {
      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
        return;
      }

      const isMember = room.players.some(p => p.socketId === socket.id);
      if (!isMember) {
        if (callback) callback({ success: true });
        return;
      }

      socket.leave(roomId);

      const updatedRoom = removePlayer(roomId, socket.id);

      if (updatedRoom) {
        if (roomManager.hasRoom(roomId)) {
          roomManager.setRoom(roomId, {
            players: updatedRoom.players.map(p => ({
              socketId: p.socketId,
              player: p.playerType,
            })),
            board: createEmptyBoard(),
            currentPlayer: 'black',
            winner: null,
          });
        }

        socket.to(roomId).emit('roomUpdated', {
          success: true,
          room: {
            id: updatedRoom.id,
            hostId: updatedRoom.host_id,
            status: updatedRoom.status,
            players: updatedRoom.players,
          },
        });
      } else {
        socket.to(roomId).emit('roomDeleted', { roomId });
        roomManager.deleteRoom(roomId);
      }

      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true });
      console.log(`플레이어 공개방 나감: ${roomId} - ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });
};
