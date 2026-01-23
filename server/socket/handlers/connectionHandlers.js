/**
 * Socket.IO 연결 관련 이벤트 핸들러
 * 연결, 연결 해제 등
 */
import {
  getPublicRooms,
  getRoom,
  removePlayer,
} from '../../database.js';
import { roomManager } from '../../services/roomManager.js';

/**
 * 연결 해제 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleDisconnect = (io) => (socket) => {
  socket.on('disconnect', () => {
    console.log(`사용자 연결 해제: ${socket.id}`);
    
    // 공개방에서 플레이어 제거
    const dbRooms = getPublicRooms();
    for (const dbRoom of dbRooms) {
      const room = getRoom(dbRoom.id);
      if (room && room.players.some(p => p.socketId === socket.id)) {
        const updatedRoom = removePlayer(dbRoom.id, socket.id);
        
        if (updatedRoom) {
          io.to(dbRoom.id).emit('roomUpdated', {
            success: true,
            room: {
              id: updatedRoom.id,
              hostId: updatedRoom.host_id,
              status: updatedRoom.status,
              players: updatedRoom.players,
            },
          });
        } else {
          io.to(dbRoom.id).emit('roomDeleted', { roomId: dbRoom.id });
          roomManager.deleteRoom(dbRoom.id);
        }
        
        io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });
        break;
      }
    }
    
    // 메모리 방에서 플레이어 제거 (비공개 방)
    const rooms = roomManager.getAllRooms();
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          roomManager.deleteRoom(roomId);
          console.log(`방 삭제: ${roomId}`);
        } else {
          io.to(roomId).emit('playerLeft', {
            players: room.players,
          });
        }
        break;
      }
    }
  });
};
