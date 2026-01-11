import { BOARD_SIZE, PLAYER } from '../../utils/constants';

/**
 * 특정 방향으로 연속된 돌의 개수를 세는 함수
 * @param {Array} board - 게임 보드
 * @param {number} row - 시작 행
 * @param {number} col - 시작 열
 * @param {number} deltaRow - 행 방향 변화량
 * @param {number} deltaCol - 열 방향 변화량
 * @param {string} player - 체크할 플레이어
 * @returns {number} 연속된 돌의 개수
 */
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

/**
 * 특정 방향에서 돌을 놓았을 때 형성되는 3(또는 4)의 개수를 세는 함수
 * 한 칸 떨어진 위치도 포함하여 체크
 * 예: O _ O O (가운데에 놓으면 3), O O _ O (가운데에 놓으면 3)
 * @param {Array} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {number} deltaRow - 행 방향 변화량
 * @param {number} deltaCol - 열 방향 변화량
 * @param {string} player - 체크할 플레이어
 * @returns {Object} { count: number, isOpen: boolean } - 돌의 개수와 열린 상태
 */
const countPattern = (board, row, col, deltaRow, deltaCol, player) => {
  // 현재 위치에 돌을 놓는다고 가정하고 체크
  // 패턴: O _ O, O O _, _ O O 등 모든 경우를 체크
  
  let maxCount = 0;
  let isOpen = false;
  
  // 패턴 1: 연속된 돌 (O O O)
  const forward = countConsecutive(board, row, col, deltaRow, deltaCol, player);
  const backward = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
  const consecutiveTotal = forward + backward + 1;
  
  if (consecutiveTotal > maxCount) {
    maxCount = consecutiveTotal;
    // 양쪽 끝이 비어있는지 확인
    const forwardEndRow = row + (forward + 1) * deltaRow;
    const forwardEndCol = col + (forward + 1) * deltaCol;
    const backwardEndRow = row - (backward + 1) * deltaRow;
    const backwardEndCol = col - (backward + 1) * deltaCol;
    
    const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                        forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                        board[forwardEndRow][forwardEndCol] === PLAYER.EMPTY;
    
    const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                         backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                         board[backwardEndRow][backwardEndCol] === PLAYER.EMPTY;
    
    isOpen = forwardOpen && backwardOpen;
  }
  
  // 패턴 2: 한 칸 떨어진 위치 포함 (O _ O O, O O _ O 등)
  // 앞쪽에 한 칸 떨어진 돌이 있는 경우
  const gap1Row = row + deltaRow;
  const gap1Col = col + deltaCol;
  if (gap1Row >= 0 && gap1Row < BOARD_SIZE &&
      gap1Col >= 0 && gap1Col < BOARD_SIZE &&
      board[gap1Row][gap1Col] === PLAYER.EMPTY) {
    // 한 칸 떨어진 위치 이후에 돌이 있는지 체크
    const afterGapRow = gap1Row + deltaRow;
    const afterGapCol = gap1Col + deltaCol;
    if (afterGapRow >= 0 && afterGapRow < BOARD_SIZE &&
        afterGapCol >= 0 && afterGapCol < BOARD_SIZE &&
        board[afterGapRow][afterGapCol] === player) {
      // 한 칸 떨어진 위치 이후의 연속된 돌 개수
      const afterGapCount = countConsecutive(board, afterGapRow, afterGapCol, deltaRow, deltaCol, player);
      // 뒤쪽의 연속된 돌 개수
      const backCount = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
      const totalWithGap = 1 + backCount + 1 + afterGapCount; // 현재 + 뒤쪽 + 한칸떨어진 + 앞쪽
      
      if (totalWithGap > maxCount) {
        maxCount = totalWithGap;
        // 양쪽 끝 확인
        const forwardEndRow = afterGapRow + (afterGapCount + 1) * deltaRow;
        const forwardEndCol = afterGapCol + (afterGapCount + 1) * deltaCol;
        const backwardEndRow = row - (backCount + 1) * deltaRow;
        const backwardEndCol = col - (backCount + 1) * deltaCol;
        
        const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                            forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                            board[forwardEndRow][forwardEndCol] === PLAYER.EMPTY;
        
        const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                             backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                             board[backwardEndRow][backwardEndCol] === PLAYER.EMPTY;
        
        isOpen = forwardOpen && backwardOpen;
      }
    }
  }
  
  // 뒤쪽에 한 칸 떨어진 돌이 있는 경우
  const gap2Row = row - deltaRow;
  const gap2Col = col - deltaCol;
  if (gap2Row >= 0 && gap2Row < BOARD_SIZE &&
      gap2Col >= 0 && gap2Col < BOARD_SIZE &&
      board[gap2Row][gap2Col] === PLAYER.EMPTY) {
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
                            board[forwardEndRow][forwardEndCol] === PLAYER.EMPTY;
        
        const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                             backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                             board[backwardEndRow][backwardEndCol] === PLAYER.EMPTY;
        
        isOpen = forwardOpen && backwardOpen;
      }
    }
  }
  
  return { count: maxCount, isOpen };
};

/**
 * 특정 방향에서 열린 3(또는 4)을 찾는 함수 (한 칸 떨어진 위치 포함)
 * @param {Array} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {number} deltaRow - 행 방향 변화량
 * @param {number} deltaCol - 열 방향 변화량
 * @param {string} player - 체크할 플레이어
 * @param {number} targetCount - 찾을 연속 개수 (3 또는 4)
 * @returns {boolean} 열린 3(또는 4)이면 true
 */
const isOpenLine = (board, row, col, deltaRow, deltaCol, player, targetCount) => {
  // 패턴 1: 연속된 돌 체크
  const pattern = countPattern(board, row, col, deltaRow, deltaCol, player);
  if (pattern.count === targetCount && pattern.isOpen) {
    return true;
  }
  
  // 패턴 2: 한 칸 떨어진 4개도 체크 (4-4 금수용)
  if (targetCount === 4) {
    // 현재 위치에 돌을 놓는다고 가정
    // 한 칸 떨어진 4개 패턴 체크: O _ O O O, O O _ O O, O O O _ O 등
    
    // 앞쪽에 한 칸 떨어진 돌이 있는 경우
    const gap1Row = row + deltaRow;
    const gap1Col = col + deltaCol;
    if (gap1Row >= 0 && gap1Row < BOARD_SIZE &&
        gap1Col >= 0 && gap1Col < BOARD_SIZE &&
        board[gap1Row][gap1Col] === PLAYER.EMPTY) {
      const afterGapRow = gap1Row + deltaRow;
      const afterGapCol = gap1Col + deltaCol;
      if (afterGapRow >= 0 && afterGapRow < BOARD_SIZE &&
          afterGapCol >= 0 && afterGapCol < BOARD_SIZE &&
          board[afterGapRow][afterGapCol] === player) {
        const afterGapCount = countConsecutive(board, afterGapRow, afterGapCol, deltaRow, deltaCol, player);
        const backCount = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
        const totalWithGap = 1 + backCount + 1 + afterGapCount; // 현재 + 뒤쪽 + 한칸떨어진 + 앞쪽
        
        if (totalWithGap === 4) {
          // 양쪽 끝이 비어있는지 확인
          const forwardEndRow = afterGapRow + (afterGapCount + 1) * deltaRow;
          const forwardEndCol = afterGapCol + (afterGapCount + 1) * deltaCol;
          const backwardEndRow = row - (backCount + 1) * deltaRow;
          const backwardEndCol = col - (backCount + 1) * deltaCol;
          
          const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                              forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                              board[forwardEndRow][forwardEndCol] === PLAYER.EMPTY;
          
          const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                               backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                               board[backwardEndRow][backwardEndCol] === PLAYER.EMPTY;
          
          if (forwardOpen && backwardOpen) {
            return true;
          }
        }
      }
    }
    
    // 뒤쪽에 한 칸 떨어진 돌이 있는 경우
    const gap2Row = row - deltaRow;
    const gap2Col = col - deltaCol;
    if (gap2Row >= 0 && gap2Row < BOARD_SIZE &&
        gap2Col >= 0 && gap2Col < BOARD_SIZE &&
        board[gap2Row][gap2Col] === PLAYER.EMPTY) {
      const beforeGapRow = gap2Row - deltaRow;
      const beforeGapCol = gap2Col - deltaCol;
      if (beforeGapRow >= 0 && beforeGapRow < BOARD_SIZE &&
          beforeGapCol >= 0 && beforeGapCol < BOARD_SIZE &&
          board[beforeGapRow][beforeGapCol] === player) {
        const beforeGapCount = countConsecutive(board, beforeGapRow, beforeGapCol, -deltaRow, -deltaCol, player);
        const frontCount = countConsecutive(board, row, col, deltaRow, deltaCol, player);
        const totalWithGap = beforeGapCount + 1 + 1 + frontCount;
        
        if (totalWithGap === 4) {
          const forwardEndRow = row + (frontCount + 1) * deltaRow;
          const forwardEndCol = col + (frontCount + 1) * deltaCol;
          const backwardEndRow = beforeGapRow - (beforeGapCount + 1) * deltaRow;
          const backwardEndCol = beforeGapCol - (beforeGapCount + 1) * deltaCol;
          
          const forwardOpen = forwardEndRow >= 0 && forwardEndRow < BOARD_SIZE &&
                              forwardEndCol >= 0 && forwardEndCol < BOARD_SIZE &&
                              board[forwardEndRow][forwardEndCol] === PLAYER.EMPTY;
          
          const backwardOpen = backwardEndRow >= 0 && backwardEndRow < BOARD_SIZE &&
                               backwardEndCol >= 0 && backwardEndCol < BOARD_SIZE &&
                               board[backwardEndRow][backwardEndCol] === PLAYER.EMPTY;
          
          if (forwardOpen && backwardOpen) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

/**
 * 특정 위치에서 6목 이상이 되는지 확인
 * @param {Array} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {string} player - 체크할 플레이어
 * @returns {boolean} 6목 이상이면 true
 */
const isOverline = (board, row, col, player) => {
  const directions = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
  ];

  for (const [deltaRow, deltaCol] of directions) {
    const forward = countConsecutive(board, row, col, deltaRow, deltaCol, player);
    const backward = countConsecutive(board, row, col, -deltaRow, -deltaCol, player);
    const total = forward + backward + 1;
    
    if (total >= 6) {
      return true;
    }
  }

  return false;
};

/**
 * 렌주룰 체크 함수
 * @param {Array} board - 게임 보드
 * @param {number} row - 착수할 행
 * @param {number} col - 착수할 열
 * @param {string} player - 착수할 플레이어
 * @returns {Object} { isValid: boolean, reason: string }
 */
export const checkRenjuRule = (board, row, col, player) => {
  // 백돌에는 렌주룰 적용 안 함
  if (player !== PLAYER.BLACK) {
    return { isValid: true, reason: null };
  }

  // 이미 돌이 있는 위치는 체크 불필요
  if (board[row][col] !== PLAYER.EMPTY) {
    return { isValid: false, reason: '이미 돌이 있는 위치입니다.' };
  }

  // 6목 이상 금지 (장목 금지)
  if (isOverline(board, row, col, player)) {
    return { isValid: false, reason: '6목 이상은 금지됩니다.' };
  }

  // 임시로 돌을 놓아서 체크
  const testBoard = board.map(rowArr => [...rowArr]);
  testBoard[row][col] = player;

  const directions = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
  ];

  let openThreeCount = 0;
  let openFourCount = 0;

  for (const [deltaRow, deltaCol] of directions) {
    // 열린 3 체크
    if (isOpenLine(testBoard, row, col, deltaRow, deltaCol, player, 3)) {
      openThreeCount++;
    }
    
    // 열린 4 체크
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
