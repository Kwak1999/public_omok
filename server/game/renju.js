/**
 * 렌주룰 체크 로직
 * 흑돌에만 적용되는 금수 규칙: 3-3, 4-4, 6목 이상 금지
 */

const BOARD_SIZE = 15;
const EMPTY = null;

/**
 * 특정 방향으로 연속된 돌 개수 세기
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 시작 행
 * @param {number} col - 시작 열
 * @param {number} deltaRow - 행 방향 증가량
 * @param {number} deltaCol - 열 방향 증가량
 * @param {string} player - 플레이어
 * @returns {number} 연속된 돌 개수
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
 * 패턴 카운트 (한 칸 떨어진 위치까지 포함)
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {number} deltaRow - 행 방향
 * @param {number} deltaCol - 열 방향
 * @param {string} player - 플레이어
 * @returns {{count: number, isOpen: boolean}} 패턴 정보
 */
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

/**
 * 열린 라인 체크 (양쪽이 막히지 않은 라인)
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {number} deltaRow - 행 방향
 * @param {number} deltaCol - 열 방향
 * @param {string} player - 플레이어
 * @param {number} targetCount - 목표 개수
 * @returns {boolean} 열린 라인 여부
 */
const isOpenLine = (board, row, col, deltaRow, deltaCol, player, targetCount) => {
  const pattern = countPattern(board, row, col, deltaRow, deltaCol, player);
  return pattern.count === targetCount && pattern.isOpen;
};

/**
 * 6목 이상 체크 (장목)
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {string} player - 플레이어
 * @returns {boolean} 6목 이상 여부
 */
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

/**
 * 렌주룰 체크 (흑돌만 적용)
 * @param {Array<Array<string|null>>} board - 게임 보드
 * @param {number} row - 착수할 행
 * @param {number} col - 착수할 열
 * @param {string} player - 플레이어 ('black' | 'white')
 * @returns {{isValid: boolean, reason: string|null}} 유효성 체크 결과
 */
export const checkRenjuRule = (board, row, col, player) => {
  // 백돌에는 렌주룰 적용 안 함
  if (player !== 'black') {
    return { isValid: true, reason: null };
  }

  // 이미 돌이 있는 위치는 체크 불필요
  if (board[row][col] !== EMPTY) {
    return { isValid: false, reason: '이미 돌이 있는 위치입니다.' };
  }

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
