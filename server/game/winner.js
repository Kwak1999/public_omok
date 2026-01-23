/**
 * 오목 승리 체크 로직
 */

const BOARD_SIZE = 15;

/**
 * 특정 방향으로 연속된 돌 개수 세기
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 시작 행
 * @param {number} col - 시작 열
 * @param {number} deltaRow - 행 방향 증가량
 * @param {number} deltaCol - 열 방향 증가량
 * @param {string} player - 플레이어 ('black' | 'white')
 * @returns {number} 연속된 돌 개수
 */
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

/**
 * 승리 조건 체크 (5개 이상 연속)
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 마지막 착수 행
 * @param {number} col - 마지막 착수 열
 * @param {string} player - 플레이어 ('black' | 'white')
 * @returns {boolean} 승리 여부
 */
export const checkWinner = (board, row, col, player) => {
  const directions = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
  ];

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
