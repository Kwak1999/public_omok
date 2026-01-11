import { BOARD_SIZE, PLAYER } from './constants';

/**
 * 특정 위치에서 특정 방향으로 연속된 돌의 개수를 세는 함수
 * @param {Array} board - 게임 보드
 * @param {number} row - 시작 행
 * @param {number} col - 시작 열
 * @param {number} deltaRow - 행 방향 변화량 (-1, 0, 1)
 * @param {number} deltaCol - 열 방향 변화량 (-1, 0, 1)
 * @param {string} player - 체크할 플레이어 ('black' 또는 'white')
 * @returns {number} 연속된 돌의 개수
 */
const countConsecutive = (board, row, col, deltaRow, deltaCol, player) => {
  let count = 0;
  let currentRow = row;
  let currentCol = col;

  // 지정된 방향으로 연속된 돌 개수 세기
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
 * 특정 위치에서 5개가 연속되었는지 확인하는 함수
 * @param {Array} board - 게임 보드
 * @param {number} row - 마지막에 놓인 돌의 행
 * @param {number} col - 마지막에 놓인 돌의 열
 * @param {string} player - 체크할 플레이어
 * @returns {boolean} 5개 연속이면 true
 */
export const checkWinner = (board, row, col, player) => {
  // 4방향 체크 (가로, 세로, 대각선 2개)
  const directions = [
    [0, 1],   // 가로 (→)
    [1, 0],   // 세로 (↓)
    [1, 1],   // 대각선 (↘)
    [1, -1],  // 대각선 (↙)
  ];

  for (const [deltaRow, deltaCol] of directions) {
    // 양방향으로 세기 (현재 위치 포함)
    const forward = countConsecutive(board, row, col, deltaRow, deltaCol, player);
    const backward = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
    
    // 현재 위치를 두 번 세었으므로 -1
    const total = forward + backward - 1;
    
    // 5개 이상 연속이면 승리
    if (total >= 5) {
      return true;
    }
  }

  return false;
};

/**
 * 게임 보드 전체에서 승자를 찾는 함수
 * @param {Array} board - 게임 보드
 * @returns {string|null} 승자 ('black', 'white') 또는 null
 */
export const findWinner = (board) => {
  // 모든 위치를 체크
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const player = board[row][col];
      
      // 빈 칸이 아니고, 5개 연속이면 승리
      if (player !== PLAYER.EMPTY && checkWinner(board, row, col, player)) {
        return player;
      }
    }
  }
  
  return null;
};
