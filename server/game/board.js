/**
 * 오목 게임 보드 관련 유틸리티
 */

const BOARD_SIZE = 15;

/**
 * 빈 보드 생성
 * @returns {Array<Array<null>>} 15x15 빈 보드
 */
export const createEmptyBoard = () => {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null)
  );
};

/**
 * 보드 크기 상수
 */
export { BOARD_SIZE };
