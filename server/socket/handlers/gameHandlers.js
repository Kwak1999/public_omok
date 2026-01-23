/**
 * Socket.IO 게임 관련 이벤트 핸들러
 * 착수, 기권, 게임 리셋, 시간 초과 등
 */
import { createEmptyBoard } from '../../game/board.js';
import { checkWinner } from '../../game/winner.js';
import { checkRenjuRule } from '../../game/renju.js';
import {
  getRoom,
  endGame,
  swapPlayerTypes,
  startGame,
  getPublicRooms,
} from '../../database.js';
import { roomManager } from '../../services/roomManager.js';

/**
 * 착수 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handlePlaceStone = (io) => (socket) => {
  socket.on('placeStone', (data) => {
    const { roomId, row, col } = data;
    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없습니다.' });
      return;
    }

    // 현재 플레이어 확인
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) {
      socket.emit('error', { message: '플레이어를 찾을 수 없습니다.' });
      return;
    }

    // 자신의 차례인지 확인
    if (room.currentPlayer !== player.player) {
      socket.emit('error', { message: '자신의 차례가 아닙니다.' });
      return;
    }

    // 이미 돌이 있는 위치인지 확인
    if (room.board[row][col] !== null) {
      socket.emit('error', { message: '이미 돌이 있는 위치입니다.' });
      return;
    }

    // 승자가 있으면 착수 불가
    if (room.winner) {
      socket.emit('error', { message: '게임이 종료되었습니다.' });
      return;
    }

    // 렌주룰 체크 (흑돌만)
    const renjuCheck = checkRenjuRule(room.board, row, col, player.player);
    if (!renjuCheck.isValid) {
      socket.emit('error', { message: renjuCheck.reason });
      return;
    }

    // 보드 업데이트
    room.board[row][col] = player.player;

    // 착수 기록 추가
    if (!room.moves) {
      room.moves = [];
    }
    const move = {
      row,
      col,
      player: player.player,
      turn: room.moves.length + 1,
    };
    room.moves.push(move);

    // 승리 체크
    const isWinner = checkWinner(room.board, row, col, player.player);

    if (isWinner) {
      room.winner = player.player;
      
      // 공개방인 경우 게임 종료 처리
      try {
        const dbRoom = getRoom(roomId);
        if (dbRoom) {
          const updatedRoom = endGame(roomId);
          io.to(roomId).emit('roomUpdated', {
            success: true,
            room: {
              id: updatedRoom.id,
              hostId: updatedRoom.host_id,
              status: updatedRoom.status,
              players: updatedRoom.players,
            },
          });
        }
      } catch (error) {
        // 비공개 방인 경우 무시
      }
      
      io.to(roomId).emit('stonePlaced', {
        row,
        col,
        player: player.player,
        board: room.board,
        winner: room.winner,
        currentPlayer: room.currentPlayer,
        moves: room.moves,
      });
    } else {
      // 다음 플레이어로 전환
      room.currentPlayer = room.currentPlayer === 'black' ? 'white' : 'black';
      
      io.to(roomId).emit('stonePlaced', {
        row,
        col,
        player: player.player,
        board: room.board,
        currentPlayer: room.currentPlayer,
        winner: null,
        moves: room.moves,
      });
    }

    console.log(`착수: ${roomId} - [${row}][${col}] by ${player.player}`);
  });
};

/**
 * 시간 초과 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleTimeout = (io) => (socket) => {
  socket.on('timeout', (data) => {
    const { roomId } = data;
    const room = roomManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없습니다.' });
      return;
    }

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) {
      socket.emit('error', { message: '플레이어를 찾을 수 없습니다.' });
      return;
    }

    if (room.currentPlayer !== player.player) {
      socket.emit('error', { message: '자신의 차례가 아닙니다.' });
      return;
    }

    if (room.winner) {
      socket.emit('error', { message: '게임이 종료되었습니다.' });
      return;
    }

    // 시간 초과로 인한 차례 전환
    room.currentPlayer = room.currentPlayer === 'black' ? 'white' : 'black';
    
    io.to(roomId).emit('stonePlaced', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      winner: null,
      moves: room.moves || [],
    });

    console.log(`시간 초과: ${roomId} - ${player.player} 시간 초과, 차례 전환: ${room.currentPlayer}`);
  });
};

/**
 * 기권 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleSurrender = (io) => (socket) => {
  socket.on('surrender', (data, callback) => {
    const { roomId } = data;
    
    // 공개방인지 확인
    let dbRoom = null;
    try {
      dbRoom = getRoom(roomId);
    } catch (error) {
      // 공개방이 아닌 경우 무시
    }
    
    // 공개방인 경우
    if (dbRoom) {
      const gameRoom = roomManager.getRoom(roomId);
      if (!gameRoom) {
        if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
        return;
      }
      
      if (gameRoom.winner) {
        if (callback) callback({ success: false, error: '게임이 이미 종료되었습니다.' });
        return;
      }
      
      const surrenderingPlayer = gameRoom.players.find(p => p.socketId === socket.id);
      if (!surrenderingPlayer) {
        if (callback) callback({ success: false, error: '플레이어를 찾을 수 없습니다.' });
        return;
      }
      
      const opponentPlayer = surrenderingPlayer.player === 'black' ? 'white' : 'black';
      gameRoom.winner = opponentPlayer;
      
      const updatedRoom = endGame(roomId);
      
      io.to(roomId).emit('roomUpdated', {
        success: true,
        room: {
          id: updatedRoom.id,
          hostId: updatedRoom.host_id,
          status: updatedRoom.status,
          players: updatedRoom.players,
        },
      });
      
      io.to(roomId).emit('stonePlaced', {
        board: gameRoom.board,
        winner: gameRoom.winner,
        currentPlayer: gameRoom.currentPlayer,
        moves: gameRoom.moves || [],
      });
      
      if (callback) callback({ success: true });
      console.log(`기권 (공개방): ${roomId} - ${socket.id} 기권, ${opponentPlayer} 승리`);
      return;
    }
    
    // 비공개 방인 경우
    const room = roomManager.getRoom(roomId);
    if (!room) {
      if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
      return;
    }
    
    if (room.winner) {
      if (callback) callback({ success: false, error: '게임이 이미 종료되었습니다.' });
      return;
    }
    
    const surrenderingPlayer = room.players.find(p => p.socketId === socket.id);
    if (!surrenderingPlayer) {
      if (callback) callback({ success: false, error: '플레이어를 찾을 수 없습니다.' });
      return;
    }
    
    const opponentPlayer = surrenderingPlayer.player === 'black' ? 'white' : 'black';
    room.winner = opponentPlayer;
    
    io.to(roomId).emit('stonePlaced', {
      board: room.board,
      winner: room.winner,
      currentPlayer: room.currentPlayer,
      moves: room.moves || [],
    });
    
    if (callback) callback({ success: true });
    console.log(`기권 (비공개 방): ${roomId} - ${socket.id} 기권, ${opponentPlayer} 승리`);
  });
};

/**
 * 게임 리셋 핸들러
 * @param {Server} io - Socket.IO 서버 인스턴스
 */
export const handleResetGame = (io) => (socket) => {
  socket.on('resetGame', (data, callback) => {
    const { roomId } = data;
    
    // 공개방인지 확인
    let dbRoom = null;
    try {
      dbRoom = getRoom(roomId);
    } catch (error) {
      // 공개방이 아닌 경우 무시
    }
    
    // 공개방인 경우
    if (dbRoom) {
      if (dbRoom.host_socket_id !== socket.id) {
        if (callback) callback({ success: false, error: '방장만 새 게임을 시작할 수 있습니다.' });
        return;
      }
      
      const guestPlayer = dbRoom.players.find(p => p.socketId !== dbRoom.host_socket_id);
      if (!guestPlayer || !guestPlayer.isReady) {
        if (callback) callback({ success: false, error: '참가자가 Ready 상태가 되어야 합니다.' });
        return;
      }
      
      if (roomManager.hasRoom(roomId)) {
        const gameRoom = roomManager.getRoom(roomId);
        
        swapPlayerTypes(roomId);
        
        gameRoom.players.forEach(player => {
          player.player = player.player === 'black' ? 'white' : 'black';
        });
        
        gameRoom.board = createEmptyBoard();
        gameRoom.currentPlayer = 'black';
        gameRoom.winner = null;
        gameRoom.moves = [];
        
        const room = startGame(roomId);
        
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType,
        }));
        
        const updatedRoom = getRoom(roomId);
        
        io.to(roomId).emit('roomUpdated', {
          success: true,
          room: {
            id: updatedRoom.id,
            hostId: updatedRoom.host_id,
            status: updatedRoom.status,
            players: updatedRoom.players,
          },
        });
        
        io.to(roomId).emit('gameStarted', {
          success: true,
          room: {
            id: updatedRoom.id,
            hostId: updatedRoom.host_id,
            status: updatedRoom.status,
            players: updatedRoom.players,
          },
          board: gameRoom.board,
          currentPlayer: 'black',
        });
        
        io.to(roomId).emit('gameReset', {
          board: gameRoom.board,
          currentPlayer: gameRoom.currentPlayer,
          winner: null,
          players: gameRoom.players,
          moves: [],
        });
        
        if (callback) callback({ success: true, room: updatedRoom });
        console.log(`게임 리셋 및 시작 (공개방): ${roomId} - 플레이어 포지션 교체됨`);
        return;
      }
    }
    
    // 비공개 방인 경우
    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없습니다.' });
      if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
      return;
    }

    room.players.forEach(player => {
      player.player = player.player === 'black' ? 'white' : 'black';
    });

    room.board = createEmptyBoard();
    room.currentPlayer = 'black';
    room.winner = null;
    room.moves = [];

    io.to(roomId).emit('gameReset', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      winner: null,
      players: room.players,
      moves: [],
    });

    if (callback) callback({ success: true });
    console.log(`게임 리셋 (비공개 방): ${roomId} - 플레이어 포지션 교체됨`);
  });
};
