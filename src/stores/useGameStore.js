import { create } from 'zustand';
import { BOARD_SIZE, PLAYER } from '../utils/constants';
import { checkWinner } from '../utils/checkWinner';

const useGameStore = create((set) => ({
  // 게임 보드 상태 (15x15 배열)
  board: Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(PLAYER.EMPTY)
  ),
  
  // 현재 플레이어 (흑돌이 먼저)
  currentPlayer: PLAYER.BLACK,
  
  // 승자 (null, 'black', 'white')
  winner: null,
  
  // 선택된 위치 (착수 전 미리보기)
  selectedPosition: null, // { row, col } 또는 null
  
  // 선택 위치 설정
  setSelectedPosition: (row, col) => set({ selectedPosition: { row, col } }),
  
  // 선택 해제
  clearSelectedPosition: () => set({ selectedPosition: null }),
  
  // 착수 (선택된 위치에 돌 놓기)
  placeStone: () => set((state) => {
    // 이미 승자가 있으면 착수 불가
    if (state.winner) return state;
    
    if (!state.selectedPosition) return state;
    
    const { row, col } = state.selectedPosition;
    
    // 이미 돌이 있는 위치면 착수 불가
    if (state.board[row][col] !== PLAYER.EMPTY) {
      return state;
    }
    
    // 보드 복사 및 업데이트
    const newBoard = state.board.map((rowArr, r) =>
      rowArr.map((cell, c) => {
        if (r === row && c === col) {
          return state.currentPlayer;
        }
        return cell;
      })
    );
    
    // 승리 체크
    const isWinner = checkWinner(newBoard, row, col, state.currentPlayer);
    
    // 승자가 결정되면 게임 종료
    if (isWinner) {
      return {
        board: newBoard,
        winner: state.currentPlayer,
        selectedPosition: null,
      };
    }
    
    // 다음 플레이어로 전환
    const nextPlayer = state.currentPlayer === PLAYER.BLACK 
      ? PLAYER.WHITE 
      : PLAYER.BLACK;
    
    return {
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPosition: null, // 착수 후 선택 해제
    };
  }),
  
  // 게임 리셋
  resetGame: () => set({
    board: Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(PLAYER.EMPTY)
    ),
    currentPlayer: PLAYER.BLACK,
    selectedPosition: null,
    winner: null,
  }),
}));

export default useGameStore;
