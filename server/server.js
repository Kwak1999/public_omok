import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  initDatabase,
  createRoom,
  getRoom,
  getPublicRooms,
  joinRoom,
  togglePlayerReady,
  startGame,
  removePlayer,
  deleteRoom,
  resetAllPlayersReady,
  endGame,
  swapPlayerTypes,
  saveGameHistory,
  getGameHistory,
  getGameById,
  deleteGameHistory,
  deleteGameById,
} from './database.js';

// 데이터베이스 초기화
// 서버 재시작 시 항상 데이터 초기화 (환경 변수 RESET_DB_ON_START=false로 비활성화 가능)
const resetOnStart = process.env.RESET_DB_ON_START !== 'false';
initDatabase({ resetOnStart });

const app = express();
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 설정 (프로덕션 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'development';

// 프로덕션 환경에서 프론트엔드 빌드 파일 서빙
if (NODE_ENV === 'production') {
  // dist 폴더 경로 (server 폴더의 상위 디렉토리의 dist)
  const distPath = join(__dirname, '..', 'dist');
  
  // 정적 파일 서빙 (assets, vite.svg 등)
  app.use(express.static(distPath, {
    maxAge: '1y', // 캐시 설정
    etag: true,
  }));
  
  // SPA 라우팅을 위한 fallback: API가 아닌 모든 GET 요청은 index.html로
  app.get('*', (req, res, next) => {
    // API 경로는 제외
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    // 그 외 모든 요청은 index.html로
    res.sendFile(join(distPath, 'index.html'));
  });
}

const httpServer = createServer(app);

// CORS 설정을 동적으로 적용 (환경 변수에서 읽기)
const getCorsOrigin = () => {
  return process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : '*';
};

const io = new Server(httpServer, {
  cors: {
    origin: getCorsOrigin(),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 게임 방 관리
const rooms = new Map(); // roomId -> { players: [], board: [], currentPlayer: 'black', winner: null, moves: [] }

// 게임 보드 초기화
const createEmptyBoard = () => {
  const BOARD_SIZE = 15;
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null)
  );
};

// 승리 체크 함수 (클라이언트와 동일한 로직)
const checkWinner = (board, row, col, player) => {
  const BOARD_SIZE = 15;
  const directions = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
  ];

  const countConsecutive = (board, row, col, deltaRow, deltaCol, player) => {
    let count = 0;
    let currentRow = row;
    let currentCol = col;

    while (
      currentRow >= 0 && currentRow < BOARD_SIZE &&
      currentCol >= 0 && currentCol < BOARD_SIZE &&
      board[currentRow][currentCol] === player
    ) {
      count++;
      currentRow += deltaRow;
      currentCol += deltaCol;
    }

    return count;
  };

  for (const [deltaRow, deltaCol] of directions) {
    const forward = countConsecutive(board, row, col, deltaRow, deltaCol, player);
    const backward = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
    const total = forward + backward - 1;
    
    if (total >= 5) {
      return true;
    }
  }

  return false;
};

// 렌주룰 체크 함수
const checkRenjuRule = (board, row, col, player) => {
  const BOARD_SIZE = 15;
  const EMPTY = null;
  
  // 백돌에는 렌주룰 적용 안 함
  if (player !== 'black') {
    return { isValid: true, reason: null };
  }

  // 이미 돌이 있는 위치는 체크 불필요
  if (board[row][col] !== EMPTY) {
    return { isValid: false, reason: '이미 돌이 있는 위치입니다.' };
  }

  const countConsecutive = (board, row, col, deltaRow, deltaCol, player) => {
    let count = 0;
    let currentRow = row + deltaRow;
    let currentCol = col + deltaCol;

    while (
      currentRow >= 0 && currentRow < BOARD_SIZE &&
      currentCol >= 0 && currentCol < BOARD_SIZE &&
      board[currentRow][currentCol] === player
    ) {
      count++;
      currentRow += deltaRow;
      currentCol += deltaCol;
    }

    return count;
  };

  // 한 칸 떨어진 위치까지 포함하여 패턴 체크
  const countPattern = (board, row, col, deltaRow, deltaCol, player) => {
    let maxCount = 0;
    let isOpen = false;
    
    // 패턴 1: 연속된 돌
    const forward = countConsecutive(board, row, col, deltaRow, deltaCol, player);
    const backward = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
    const consecutiveTotal = forward + backward + 1;
    
    if (consecutiveTotal > maxCount) {
      maxCount = consecutiveTotal;
      const forwardEndRow = row + (forward + 1) * deltaRow;
      const forwardEndCol = col + (forward + 1) * deltaCol;
      const backwardEndRow = row - (backward + 1) * deltaRow;
      const backwardEndCol = col - (backward + 1) * deltaCol;
      
      const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                          forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                          board[forwardEndRow][forwardEndCol] === EMPTY;
      
      const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                           backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                           board[backwardEndRow][backwardEndCol] === EMPTY;
      
      isOpen = forwardOpen && backwardOpen;
    }
    
    // 패턴 2: 앞쪽에 한 칸 떨어진 돌
    const gap1Row = row + deltaRow;
    const gap1Col = col + deltaCol;
    if (gap1Row >= 0 && gap1Row < BOARD_SIZE &&
        gap1Col >= 0 && gap1Col < BOARD_SIZE &&
        board[gap1Row][gap1Col] === EMPTY) {
      const afterGapRow = gap1Row + deltaRow;
      const afterGapCol = gap1Col + deltaCol;
      if (afterGapRow >= 0 && afterGapRow < BOARD_SIZE &&
          afterGapCol >= 0 && afterGapCol < BOARD_SIZE &&
          board[afterGapRow][afterGapCol] === player) {
        const afterGapCount = countConsecutive(board, afterGapRow, afterGapCol, deltaRow, deltaCol, player);
        const backCount = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
        const totalWithGap = 1 + backCount + 1 + afterGapCount;
        
        if (totalWithGap > maxCount) {
          maxCount = totalWithGap;
          const forwardEndRow = afterGapRow + (afterGapCount + 1) * deltaRow;
          const forwardEndCol = afterGapCol + (afterGapCount + 1) * deltaCol;
          const backwardEndRow = row - (backCount + 1) * deltaRow;
          const backwardEndCol = col - (backCount + 1) * deltaCol;
          
          const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                              forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                              board[forwardEndRow][forwardEndCol] === EMPTY;
          
          const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                               backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                               board[backwardEndRow][backwardEndCol] === EMPTY;
          
          isOpen = forwardOpen && backwardOpen;
        }
      }
    }
    
    // 패턴 3: 뒤쪽에 한 칸 떨어진 돌
    const gap2Row = row - deltaRow;
    const gap2Col = col - deltaCol;
    if (gap2Row >= 0 && gap2Row < BOARD_SIZE &&
        gap2Col >= 0 && gap2Col < BOARD_SIZE &&
        board[gap2Row][gap2Col] === EMPTY) {
      const beforeGapRow = gap2Row - deltaRow;
      const beforeGapCol = gap2Col - deltaCol;
      if (beforeGapRow >= 0 && beforeGapRow < BOARD_SIZE &&
          beforeGapCol >= 0 && beforeGapCol < BOARD_SIZE &&
          board[beforeGapRow][beforeGapCol] === player) {
        const beforeGapCount = countConsecutive(board, beforeGapRow, beforeGapCol, -deltaRow, -deltaCol, player);
        const frontCount = countConsecutive(board, row, col, deltaRow, deltaCol, player);
        const totalWithGap = beforeGapCount + 1 + 1 + frontCount;
        
        if (totalWithGap > maxCount) {
          maxCount = totalWithGap;
          const forwardEndRow = row + (frontCount + 1) * deltaRow;
          const forwardEndCol = col + (frontCount + 1) * deltaCol;
          const backwardEndRow = beforeGapRow - (beforeGapCount + 1) * deltaRow;
          const backwardEndCol = beforeGapCol - (beforeGapCount + 1) * deltaCol;
          
          const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                              forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                              board[forwardEndRow][forwardEndCol] === EMPTY;
          
          const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                               backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                               board[backwardEndRow][backwardEndCol] === EMPTY;
          
          isOpen = forwardOpen && backwardOpen;
        }
      }
    }
    
    return { count: maxCount, isOpen };
  };

  const isOpenLine = (board, row, col, deltaRow, deltaCol, player, targetCount) => {
    const pattern = countPattern(board, row, col, deltaRow, deltaCol, player);
    return pattern.count === targetCount && pattern.isOpen;
  };

  const isOverline = (board, row, col, player) => {
    const directions = [
      [0, 1],   [1, 0],   [1, 1],   [1, -1],
    ];

    for (const [deltaRow, deltaCol] of directions) {
      const pattern = countPattern(board, row, col, deltaRow, deltaCol, player);
      if (pattern.count >= 6) {
        return true;
      }
    }

    return false;
  };

  // 6목 이상 금지
  if (isOverline(board, row, col, player)) {
    return { isValid: false, reason: '6목 이상은 금지됩니다.' };
  }

  // 임시로 돌을 놓아서 체크
  const testBoard = board.map(rowArr => [...rowArr]);
  testBoard[row][col] = player;

  const directions = [
    [0, 1],   [1, 0],   [1, 1],   [1, -1],
  ];

  let openThreeCount = 0;
  let openFourCount = 0;

  for (const [deltaRow, deltaCol] of directions) {
    if (isOpenLine(testBoard, row, col, deltaRow, deltaCol, player, 3)) {
      openThreeCount++;
    }
    if (isOpenLine(testBoard, row, col, deltaRow, deltaCol, player, 4)) {
      openFourCount++;
    }
  }

  // 3-3 금지
  if (openThreeCount >= 2) {
    return { isValid: false, reason: '3-3은 금지됩니다.' };
  }

  // 4-4 금지
  if (openFourCount >= 2) {
    return { isValid: false, reason: '4-4는 금지됩니다.' };
  }

  return { isValid: true, reason: null };
};

// HTTP API: 공개방 리스트 조회
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = getPublicRooms();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTTP API: 경기 기록 저장
app.post('/api/game-history', (req, res) => {
  try {
    const { guestId, roomId, winner, moves, players } = req.body;
    
    if (!guestId || !moves || moves.length === 0) {
      return res.status(400).json({ success: false, error: '필수 데이터가 없습니다.' });
    }
    
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const gameData = {
      id: gameId,
      guestId,
      roomId: roomId || null,
      winner: winner || null,
      moves: moves || [],
      players: players || [],
    };
    
    saveGameHistory(gameData);
    res.json({ 
      success: true, 
      gameId, 
      game: {
        id: gameId,
        guestId,
        roomId: roomId || null,
        winner: winner || null,
        moves: moves || [],
        players: players || [],
        timestamp: Date.now(),
      }
    });
  } catch (error) {
    console.error('경기 기록 저장 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTTP API: 경기 기록 조회 (게스트 ID별)
app.get('/api/game-history/:guestId', (req, res) => {
  try {
    const { guestId } = req.params;
    const history = getGameHistory(guestId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTTP API: 특정 경기 기록 조회
app.get('/api/game-history/:guestId/:gameId', (req, res) => {
  try {
    const { guestId, gameId } = req.params;
    const game = getGameById(gameId, guestId);
    
    if (!game) {
      return res.status(404).json({ success: false, error: '경기 기록을 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTTP API: 경기 기록 삭제 (게스트 ID별)
app.delete('/api/game-history/:guestId', (req, res) => {
  try {
    const { guestId } = req.params;
    deleteGameHistory(guestId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HTTP API: 특정 경기 기록 삭제
app.delete('/api/game-history/:guestId/:gameId', (req, res) => {
  try {
    const { guestId, gameId } = req.params;
    deleteGameById(gameId, guestId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log(`사용자 연결: ${socket.id}`);

  // 공개방 리스트 요청
  socket.on('getPublicRooms', (callback) => {
    try {
      const rooms = getPublicRooms();
      if (callback) callback({ success: true, rooms });
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // 공개방 생성
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
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
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

  // 방 생성 (비공개, 호환성 유지)
  socket.on('createRoom', (data) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const playerId = socket.id;
    
    rooms.set(roomId, {
      players: [{ id: playerId, socketId: socket.id, player: 'black' }],
      board: createEmptyBoard(),
      currentPlayer: 'black',
      winner: null,
    });

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, player: 'black' });
    console.log(`방 생성: ${roomId} by ${playerId}`);
  });

  // 공개방 참가
  socket.on('joinPublicRoom', (data, callback) => {
    const { roomId } = data;
    
    try {
      // 먼저 이전 방에서 나가기 처리 (같은 socket이 다른 방에 참가하려 할 때)
      // 단, 현재 참가하려는 방은 제외
      const currentRooms = Array.from(rooms.keys());
      for (const currentRoomId of currentRooms) {
        // 현재 참가하려는 방이면 건너뛰기
        if (currentRoomId === roomId) {
          continue;
        }
        
        const currentRoom = rooms.get(currentRoomId);
        if (currentRoom && currentRoom.players.some(p => p.socketId === socket.id)) {
          // 이전 방에서 나가기 처리
          socket.leave(currentRoomId);
          const prevRoom = getRoom(currentRoomId);
          if (prevRoom) {
            // DB에서 플레이어 제거
            const updatedPrevRoom = removePlayer(currentRoomId, socket.id);
            if (updatedPrevRoom) {
              // 나가는 플레이어를 제외하고 다른 플레이어들에게만 업데이트 전송
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
              // 방이 삭제됨 - 나가는 플레이어를 제외하고 전송
              socket.to(currentRoomId).emit('roomDeleted', { roomId: currentRoomId });
              rooms.delete(currentRoomId);
            }
            io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });
          }
          break;
        }
      }
      
      // 현재 방에 이미 참가한 플레이어인지 확인 (재참가 방지)
      const currentRoom = getRoom(roomId);
      if (currentRoom && currentRoom.players.some(p => p.socketId === socket.id)) {
        // 이미 참가한 플레이어면 그대로 반환
        socket.join(roomId);
        
        // 게임 방 메모리 업데이트
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
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

      // 게임 방 메모리에 추가 (게임 진행용)
      // 재입장 시에도 최신 상태로 업데이트
      if (rooms.has(roomId)) {
        // 기존 방이 있으면 플레이어 정보만 업데이트
        // 게임이 진행 중이 아니면 보드도 초기화
        const gameRoom = rooms.get(roomId);
        const isGameInProgress = gameRoom.winner === null && 
                                 gameRoom.board.some(row => row.some(cell => cell !== null));
        
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType, // DB에서 가져온 최신 플레이어 타입 사용
        }));
        
        // 게임이 진행 중이 아니면 보드 초기화 (재입장 시)
        if (!isGameInProgress && room.status === 'waiting') {
          gameRoom.board = createEmptyBoard();
          gameRoom.currentPlayer = 'black';
          gameRoom.winner = null;
          gameRoom.moves = [];
        }
      } else {
        // 새 방 생성
        rooms.set(roomId, {
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

      // 방의 모든 플레이어에게 업데이트 전송
      io.to(roomId).emit('roomUpdated', {
        success: true,
        room: {
          id: room.id,
          hostId: room.host_id,
          status: room.status,
          players: room.players,
        },
      });

      // 공개방 리스트 업데이트
      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true, room });
      console.log(`플레이어 공개방 참가: ${roomId} - ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });

  // 공개방 나가기
  socket.on('leavePublicRoom', (data, callback) => {
    const { roomId } = data;

    try {
      const room = getRoom(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
        return;
      }

      // 방에 속한 플레이어인지 확인
      const isMember = room.players.some(p => p.socketId === socket.id);
      if (!isMember) {
        // 이미 나간 플레이어이면 성공으로 처리 (중복 호출 방지)
        if (callback) callback({ success: true });
        return;
      }

      // 나가는 플레이어의 socketId 저장
      const leavingSocketId = socket.id;
      
      // 먼저 socket.leave를 호출하여 이후 이벤트가 이 플레이어에게 전송되지 않도록 함
      socket.leave(roomId);

      const updatedRoom = removePlayer(roomId, socket.id);

      if (updatedRoom) {
        // 메모리 방 상태 업데이트
        if (rooms.has(roomId)) {
          rooms.set(roomId, {
            players: updatedRoom.players.map(p => ({
              socketId: p.socketId,
              player: p.playerType,
            })),
            board: createEmptyBoard(),
            currentPlayer: 'black',
            winner: null,
          });
        }

        // 나가는 플레이어를 제외하고 방의 다른 플레이어들에게만 업데이트 전송
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
        // 방이 삭제됨 - 나가는 플레이어를 제외하고 전송
        socket.to(roomId).emit('roomDeleted', { roomId });
        rooms.delete(roomId);
      }

      // 공개방 리스트 업데이트
      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true });
      console.log(`플레이어 공개방 나감: ${roomId} - ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });

  // Ready 상태 토글 (공개방만)
  socket.on('toggleReady', (data, callback) => {
    const { roomId } = data;
    
    try {
      const room = togglePlayerReady(roomId, socket.id);
      
      // 방의 모든 플레이어에게 업데이트 전송
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

  // 게임 시작 (방장만 가능, 참가자가 Ready 상태여야 함)
  socket.on('startGame', (data, callback) => {
    const { roomId } = data;
    
    try {
      const dbRoom = getRoom(roomId);
      
      // 방장인지 확인
      if (dbRoom.host_socket_id !== socket.id) {
        if (callback) callback({ success: false, error: '방장만 게임을 시작할 수 있습니다.' });
        return;
      }

      // 참가자(유저)가 Ready 상태인지 확인
      const guestPlayer = dbRoom.players.find(p => p.socketId !== dbRoom.host_socket_id);
      if (!guestPlayer || !guestPlayer.isReady) {
        if (callback) callback({ success: false, error: '참가자가 Ready 상태가 되어야 합니다.' });
        return;
      }

      const room = startGame(roomId);
      
      // 게임 방 메모리 초기화 또는 생성
      if (rooms.has(roomId)) {
        const gameRoom = rooms.get(roomId);
        gameRoom.board = createEmptyBoard();
        gameRoom.currentPlayer = 'black';
        gameRoom.winner = null;
        gameRoom.moves = [];
        // DB에서 최신 플레이어 정보 가져와서 설정 (재입장 시 플레이어 타입이 바뀔 수 있음)
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType, // DB에서 가져온 플레이어 타입 사용
        }));
      } else {
        // 게임 방이 없으면 새로 생성
        rooms.set(roomId, {
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

      // 방의 모든 플레이어에게 게임 시작 알림
      io.to(roomId).emit('gameStarted', {
        success: true,
        room: {
          id: room.id,
          hostId: room.host_id,
          status: room.status,
          players: room.players,
        },
        board: rooms.get(roomId)?.board || createEmptyBoard(),
        currentPlayer: 'black',
        moves: [], // 게임 시작 시 moves 초기화
      });

      // 공개방 리스트 업데이트
      io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });

      if (callback) callback({ success: true, room });
      console.log(`게임 시작: ${roomId} by ${socket.id}`);
    } catch (error) {
      if (callback) callback({ success: false, error: error.message });
      socket.emit('error', { message: error.message });
    }
  });

  // 기존 방 참가 (비공개, 호환성 유지)
  socket.on('joinRoom', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);

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

    // 기존 플레이어에게 새 플레이어 참가 알림
    io.to(roomId).emit('playerJoined', {
      roomId,
      players: room.players,
      board: room.board,
      currentPlayer: room.currentPlayer,
    });

    console.log(`플레이어 참가: ${roomId} - ${playerId}`);
  });

  // 착수
  socket.on('placeStone', (data) => {
    const { roomId, row, col } = data;
    const room = rooms.get(roomId);

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
      
      // 공개방인 경우 게임 종료 처리 (ready 상태 초기화)
      try {
        const dbRoom = getRoom(roomId);
        if (dbRoom) {
          const updatedRoom = endGame(roomId);
          // 방의 모든 플레이어에게 업데이트 전송
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

  // 기권
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
      const gameRoom = rooms.get(roomId);
      if (!gameRoom) {
        if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
        return;
      }
      
      // 이미 승자가 있으면 기권 불가
      if (gameRoom.winner) {
        if (callback) callback({ success: false, error: '게임이 이미 종료되었습니다.' });
        return;
      }
      
      // 기권한 플레이어 찾기
      const surrenderingPlayer = gameRoom.players.find(p => p.socketId === socket.id);
      if (!surrenderingPlayer) {
        if (callback) callback({ success: false, error: '플레이어를 찾을 수 없습니다.' });
        return;
      }
      
      // 상대방이 승리
      const opponentPlayer = surrenderingPlayer.player === 'black' ? 'white' : 'black';
      gameRoom.winner = opponentPlayer;
      
      // 공개방 게임 종료 처리
      const updatedRoom = endGame(roomId);
      
      // 방의 모든 플레이어에게 업데이트 전송
      io.to(roomId).emit('roomUpdated', {
        success: true,
        room: {
          id: updatedRoom.id,
          hostId: updatedRoom.host_id,
          status: updatedRoom.status,
          players: updatedRoom.players,
        },
      });
      
      // 게임 종료 알림
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
    const room = rooms.get(roomId);
    if (!room) {
      if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
      return;
    }
    
    // 이미 승자가 있으면 기권 불가
    if (room.winner) {
      if (callback) callback({ success: false, error: '게임이 이미 종료되었습니다.' });
      return;
    }
    
    // 기권한 플레이어 찾기
    const surrenderingPlayer = room.players.find(p => p.socketId === socket.id);
    if (!surrenderingPlayer) {
      if (callback) callback({ success: false, error: '플레이어를 찾을 수 없습니다.' });
      return;
    }
    
    // 상대방이 승리
    const opponentPlayer = surrenderingPlayer.player === 'black' ? 'white' : 'black';
    room.winner = opponentPlayer;
    
    // 게임 종료 알림
    io.to(roomId).emit('stonePlaced', {
      board: room.board,
      winner: room.winner,
      currentPlayer: room.currentPlayer,
      moves: room.moves || [],
    });
    
    if (callback) callback({ success: true });
    console.log(`기권 (비공개 방): ${roomId} - ${socket.id} 기권, ${opponentPlayer} 승리`);
  });

  // 게임 리셋
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
      // 방장인지 확인
      if (dbRoom.host_socket_id !== socket.id) {
        if (callback) callback({ success: false, error: '방장만 새 게임을 시작할 수 있습니다.' });
        return;
      }
      
      // 참가자(유저)가 Ready 상태인지 확인
      const guestPlayer = dbRoom.players.find(p => p.socketId !== dbRoom.host_socket_id);
      if (!guestPlayer || !guestPlayer.isReady) {
        if (callback) callback({ success: false, error: '참가자가 Ready 상태가 되어야 합니다.' });
        return;
      }
      
      // 게임 방 메모리 초기화
      if (rooms.has(roomId)) {
        const gameRoom = rooms.get(roomId);
        
        // 데이터베이스에서 플레이어 타입 교체 (흑 ↔ 백)
        swapPlayerTypes(roomId);
        
        // 메모리상의 플레이어 포지션도 교체
        gameRoom.players.forEach(player => {
          player.player = player.player === 'black' ? 'white' : 'black';
        });
        
        // 보드 초기화
        gameRoom.board = createEmptyBoard();
        gameRoom.currentPlayer = 'black';
        gameRoom.winner = null;
        gameRoom.moves = [];
        
        // Ready 상태는 초기화하지 않고 바로 게임 시작
        // (이미 Ready 상태이므로 바로 시작 가능)
        const room = startGame(roomId);
        
        // 게임 방 메모리 업데이트
        gameRoom.players = room.players.map(p => ({
          socketId: p.socketId,
          player: p.playerType,
        }));
        
        const updatedRoom = getRoom(roomId);
        
        // 방의 모든 플레이어에게 업데이트 전송
        io.to(roomId).emit('roomUpdated', {
          success: true,
          room: {
            id: updatedRoom.id,
            hostId: updatedRoom.host_id,
            status: updatedRoom.status,
            players: updatedRoom.players,
          },
        });
        
        // 게임 시작 알림
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
          players: gameRoom.players, // 교체된 플레이어 정보 전송
          moves: [], // 게임 리셋 시 moves 초기화
        });
        
        if (callback) callback({ success: true, room: updatedRoom });
        console.log(`게임 리셋 및 시작 (공개방): ${roomId} - 플레이어 포지션 교체됨`);
        return;
      }
    }
    
    // 비공개 방인 경우 (기존 로직)
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없습니다.' });
      if (callback) callback({ success: false, error: '방을 찾을 수 없습니다.' });
      return;
    }

    // 플레이어 포지션 교체 (흑 ↔ 백)
    room.players.forEach(player => {
      player.player = player.player === 'black' ? 'white' : 'black';
    });

    // 보드 초기화
    room.board = createEmptyBoard();
    
    // 현재 플레이어를 새로운 흑돌 플레이어로 설정
    room.currentPlayer = 'black';
    room.winner = null;
    room.moves = [];

    io.to(roomId).emit('gameReset', {
      board: room.board,
      currentPlayer: room.currentPlayer,
      winner: null,
      players: room.players, // 교체된 플레이어 정보 전송
      moves: [], // 게임 리셋 시 moves 초기화
    });

    if (callback) callback({ success: true });
    console.log(`게임 리셋 (비공개 방): ${roomId} - 플레이어 포지션 교체됨`);
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`사용자 연결 해제: ${socket.id}`);
    
    // 공개방에서 플레이어 제거
    const dbRooms = getPublicRooms();
    for (const dbRoom of dbRooms) {
      const room = getRoom(dbRoom.id);
      if (room && room.players.some(p => p.socketId === socket.id)) {
        const updatedRoom = removePlayer(dbRoom.id, socket.id);
        
        if (updatedRoom) {
          // 남은 플레이어에게 알림
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
          // 방이 삭제됨
          io.to(dbRoom.id).emit('roomDeleted', { roomId: dbRoom.id });
          rooms.delete(dbRoom.id);
        }
        
        // 공개방 리스트 업데이트
        io.emit('publicRoomsUpdated', { rooms: getPublicRooms() });
        break;
      }
    }
    
    // 메모리 방에서 플레이어 제거 (비공개 방)
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        // 방에 플레이어가 없으면 방 삭제
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`방 삭제: ${roomId}`);
        } else {
          // 남은 플레이어에게 알림
          io.to(roomId).emit('playerLeft', {
            players: room.players,
          });
        }
        break;
      }
    }
  });
});

// 환경 변수 설정
const PORT = process.env.PORT || 3001;
const corsOrigin = getCorsOrigin();

// 프로덕션 환경 경고
if (NODE_ENV === 'production' && corsOrigin === '*') {
  console.warn('⚠️  경고: 프로덕션 환경에서 CORS가 모든 도메인(*)을 허용하고 있습니다.');
  console.warn('   CORS_ORIGIN 환경 변수를 설정하여 특정 도메인만 허용하세요.');
}

// 서버 시작
httpServer.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📦 환경: ${NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`);
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
