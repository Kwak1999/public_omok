import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 데이터베이스 디렉토리 생성
const dbDir = join(__dirname, 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// 데이터베이스 연결
const db = new Database(join(dbDir, 'omok.db'));

// 데이터베이스 초기화
export function initDatabase() {
  // 방 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      host_socket_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      created_at INTEGER NOT NULL,
      started_at INTEGER
    )
  `);

  // 플레이어 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      socket_id TEXT NOT NULL,
      player_type TEXT NOT NULL,
      is_ready INTEGER NOT NULL DEFAULT 0,
      joined_at INTEGER NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
    CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
  `);

  console.log('✅ 데이터베이스 초기화 완료');
}

// 방 생성
export function createRoom(roomId, hostSocketId) {
  const now = Date.now();
  
  db.transaction(() => {
    // 방 생성
    db.prepare(`
      INSERT INTO rooms (id, host_id, host_socket_id, status, created_at)
      VALUES (?, ?, ?, 'waiting', ?)
    `).run(roomId, hostSocketId, hostSocketId, now);

    // 호스트를 플레이어로 추가
    db.prepare(`
      INSERT INTO players (room_id, socket_id, player_type, is_ready, joined_at)
      VALUES (?, ?, 'black', 0, ?)
    `).run(roomId, hostSocketId, now);
  })();

  return getRoom(roomId);
}

// 방 조회
export function getRoom(roomId) {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) return null;

  const players = db.prepare(`
    SELECT * FROM players WHERE room_id = ? ORDER BY joined_at
  `).all(roomId);

  return {
    ...room,
    players: players.map(p => ({
      socketId: p.socket_id,
      playerType: p.player_type,
      isReady: p.is_ready === 1,
      joinedAt: p.joined_at,
    })),
  };
}

// 공개방 리스트 조회 (대기 중인 방만)
export function getPublicRooms() {
  const rooms = db.prepare(`
    SELECT r.*, COUNT(p.id) as player_count
    FROM rooms r
    LEFT JOIN players p ON r.id = p.room_id
    WHERE r.status = 'waiting'
    GROUP BY r.id
    HAVING player_count <= 2
    ORDER BY r.created_at DESC
  `).all();

  return rooms.map(room => ({
    id: room.id,
    hostId: room.host_id,
    status: room.status,
    playerCount: room.player_count,
    createdAt: room.created_at,
  }));
}

// 플레이어 참가
export function joinRoom(roomId, socketId) {
  const room = getRoom(roomId);
  if (!room) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  if (room.status !== 'waiting') {
    throw new Error('게임이 이미 시작되었습니다.');
  }

  // 이미 참가한 플레이어인지 확인
  const existingPlayer = room.players.find(p => p.socketId === socketId);
  if (existingPlayer) {
    return room;
  }

  // 2명 초과 시 참가 불가
  if (room.players.length >= 2) {
    throw new Error('방이 가득 찼습니다.');
  }

  // 플레이어 추가
  db.prepare(`
    INSERT INTO players (room_id, socket_id, player_type, is_ready, joined_at)
    VALUES (?, ?, 'white', 0, ?)
  `).run(roomId, socketId, Date.now());

  return getRoom(roomId);
}

// 플레이어 Ready 상태 변경
export function togglePlayerReady(roomId, socketId) {
  const player = db.prepare(`
    SELECT * FROM players WHERE room_id = ? AND socket_id = ?
  `).get(roomId, socketId);

  if (!player) {
    throw new Error('플레이어를 찾을 수 없습니다.');
  }

  const newReadyState = player.is_ready === 1 ? 0 : 1;
  
  db.prepare(`
    UPDATE players SET is_ready = ? WHERE room_id = ? AND socket_id = ?
  `).run(newReadyState, roomId, socketId);

  return getRoom(roomId);
}

// 게임 시작
export function startGame(roomId) {
  const room = getRoom(roomId);
  
  if (!room) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  if (room.players.length !== 2) {
    throw new Error('플레이어가 부족합니다.');
  }

  // 참가자(유저)가 Ready 상태인지 확인 (방장이 아닌 플레이어)
  const guestPlayer = room.players.find(p => p.socketId !== room.host_socket_id);
  if (!guestPlayer || !guestPlayer.isReady) {
    throw new Error('참가자가 Ready 상태가 되어야 합니다.');
  }

  // 방 상태를 'playing'으로 변경
  db.prepare(`
    UPDATE rooms SET status = 'playing', started_at = ? WHERE id = ?
  `).run(Date.now(), roomId);

  return getRoom(roomId);
}

// 플레이어 제거
export function removePlayer(roomId, socketId) {
  db.prepare(`
    DELETE FROM players WHERE room_id = ? AND socket_id = ?
  `).run(roomId, socketId);

  const room = getRoom(roomId);
  
  // 플레이어가 없으면 방 삭제
  if (!room || room.players.length === 0) {
    db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
    return null;
  }

  return room;
}

// 방 삭제
export function deleteRoom(roomId) {
  db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
}

// 모든 플레이어의 Ready 상태 초기화
export function resetAllPlayersReady(roomId) {
  db.prepare(`
    UPDATE players SET is_ready = 0 WHERE room_id = ?
  `).run(roomId);
  
  return getRoom(roomId);
}

// 플레이어 타입 교체 (흑 ↔ 백)
export function swapPlayerTypes(roomId) {
  const room = getRoom(roomId);
  if (!room || room.players.length !== 2) {
    throw new Error('방을 찾을 수 없거나 플레이어가 부족합니다.');
  }
  
  // 각 플레이어의 타입을 교체
  room.players.forEach(player => {
    const newType = player.playerType === 'black' ? 'white' : 'black';
    db.prepare(`
      UPDATE players SET player_type = ? WHERE room_id = ? AND socket_id = ?
    `).run(newType, roomId, player.socketId);
  });
  
  return getRoom(roomId);
}

// 게임 종료 (상태를 waiting으로 변경하고 ready 초기화)
export function endGame(roomId) {
  const room = getRoom(roomId);
  
  if (!room) {
    throw new Error('방을 찾을 수 없습니다.');
  }
  
  // 방 상태를 'waiting'으로 변경
  db.prepare(`
    UPDATE rooms SET status = 'waiting' WHERE id = ?
  `).run(roomId);
  
  // 모든 플레이어의 Ready 상태 초기화
  resetAllPlayersReady(roomId);
  
  return getRoom(roomId);
}

// 데이터베이스 연결 종료
export function closeDatabase() {
  db.close();
}

export default db;
