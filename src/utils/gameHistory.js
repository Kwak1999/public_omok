/**
 * 경기 기록 관리 유틸리티
 * 게스트 ID별로 경기 기록을 저장하고 관리합니다.
 */

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * 경기 기록 저장 (서버에 저장)
 * @param {string} guestId - 게스트 ID
 * @param {Object} gameData - 경기 데이터
 * @param {Array} moves - 착수 기록 [{row, col, player, turn}]
 * @param {string} winner - 승자 ('black' | 'white' | null)
 * @param {Array} players - 플레이어 정보
 */
export async function saveGameHistory(guestId, gameData) {
  if (!guestId) return null;

  try {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch(`${SERVER_URL}/api/game-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestId,
        roomId: gameData.roomId || null,
        winner: gameData.winner || null,
        moves: gameData.moves || [],
        players: gameData.players || [],
      }),
    });

    const result = await response.json();
    
    if (result.success && result.game) {
      return result.game;
    } else {
      console.error('경기 기록 저장 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('경기 기록 저장 오류:', error);
    return null;
  }
}

/**
 * 경기 기록 조회 (서버에서 조회)
 * @param {string} guestId - 게스트 ID
 * @returns {Array} 경기 기록 배열
 */
export async function getGameHistory(guestId) {
  if (!guestId) return [];

  try {
    const response = await fetch(`${SERVER_URL}/api/game-history/${guestId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.history || [];
    } else {
      console.error('경기 기록 조회 실패:', result.error);
      return [];
    }
  } catch (error) {
    console.error('경기 기록 조회 오류:', error);
    return [];
  }
}

/**
 * 특정 경기 기록 조회 (서버에서 조회)
 * @param {string} guestId - 게스트 ID
 * @param {string} gameId - 경기 ID
 * @returns {Object|null} 경기 기록 또는 null
 */
export async function getGameById(guestId, gameId) {
  if (!guestId || !gameId) return null;

  try {
    const response = await fetch(`${SERVER_URL}/api/game-history/${guestId}/${gameId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.game || null;
    } else {
      console.error('경기 기록 조회 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('경기 기록 조회 오류:', error);
    return null;
  }
}

/**
 * 경기 기록 삭제 (서버에서 삭제)
 * @param {string} guestId - 게스트 ID
 */
export async function deleteGameHistory(guestId) {
  if (!guestId) return;

  try {
    const response = await fetch(`${SERVER_URL}/api/game-history/${guestId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    
    if (!result.success) {
      console.error('경기 기록 삭제 실패:', result.error);
    }
  } catch (error) {
    console.error('경기 기록 삭제 오류:', error);
  }
}

/**
 * 특정 경기 기록 삭제 (서버에서 삭제)
 * @param {string} guestId - 게스트 ID
 * @param {string} gameId - 경기 ID
 */
export async function deleteGameById(guestId, gameId) {
  if (!guestId || !gameId) return;

  try {
    const response = await fetch(`${SERVER_URL}/api/game-history/${guestId}/${gameId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    
    if (!result.success) {
      console.error('경기 기록 삭제 실패:', result.error);
    }
  } catch (error) {
    console.error('경기 기록 삭제 오류:', error);
  }
}

/**
 * 경기 기록 포맷팅 (날짜/시간)
 * @param {number} timestamp - 타임스탬프
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatGameDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
