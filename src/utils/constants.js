// 오목판 상수
export const BOARD_SIZE = 15;
export const CELL_GAP = 32;
export const BOARD_LENGTH = CELL_GAP * (BOARD_SIZE - 1);

// 성혈 위치 (오목판의 5개 특별한 점)
export const STAR_POSITIONS = [
  { row: 3,  col: 3  },
  { row: 3,  col: 11 },
  { row: 7,  col: 7  },
  { row: 11, col: 3  },
  { row: 11, col: 11 },
];

// 플레이어 타입
export const PLAYER = {
  BLACK: 'black',
  WHITE: 'white',
  EMPTY: null,
};
