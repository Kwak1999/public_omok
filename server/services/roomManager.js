/**
 * 게임 방 메모리 관리 서비스
 * Socket.IO 연결 시 사용하는 인메모리 방 상태 관리
 */

// 게임 방 저장소
const rooms = new Map(); // roomId -> { players: [], board: [], currentPlayer: 'black', winner: null, moves: [] }

/**
 * 방 관리자 싱글톤 인스턴스
 */
export const roomManager = {
  /**
   * 모든 방 목록 가져오기
   * @returns {Map} 방 목록
   */
  getAllRooms() {
    return rooms;
  },

  /**
   * 특정 방 가져오기
   * @param {string} roomId - 방 ID
   * @returns {Object|undefined} 방 정보
   */
  getRoom(roomId) {
    return rooms.get(roomId);
  },

  /**
   * 방 설정하기
   * @param {string} roomId - 방 ID
   * @param {Object} roomData - 방 데이터
   */
  setRoom(roomId, roomData) {
    rooms.set(roomId, roomData);
  },

  /**
   * 방이 존재하는지 확인
   * @param {string} roomId - 방 ID
   * @returns {boolean} 존재 여부
   */
  hasRoom(roomId) {
    return rooms.has(roomId);
  },

  /**
   * 방 삭제하기
   * @param {string} roomId - 방 ID
   * @returns {boolean} 삭제 성공 여부
   */
  deleteRoom(roomId) {
    return rooms.delete(roomId);
  },

  /**
   * 모든 방 삭제하기
   */
  clearAllRooms() {
    rooms.clear();
  },
};
