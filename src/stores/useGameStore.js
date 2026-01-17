import { create } from 'zustand';
import { BOARD_SIZE, PLAYER } from '../utils/constants';
import { checkWinner } from '../utils/checkWinner';
import { checkRenjuRule } from '../hooks/omok/useRenjuRule';
import useMultiplayerStore from './useMultiplayerStore';

const useGameStore = create((set, get) => ({
  // 게임 보드 상태 (15x15 배열)
  board: Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(PLAYER.EMPTY)
  ),
  
  // 현재 플레이어 (흑돌이 먼저)
  currentPlayer: PLAYER.BLACK,
  
  // 승자 (null, 'black', 'white')
  winner: null,
  
  // 착수 기록 (복기용)
  moves: [], // [{row, col, player, turn}]
  
  // 선택된 위치 (착수 전 미리보기)
  selectedPosition: null, // { row, col } 또는 null
  
  // 선택 위치 설정
  setSelectedPosition: (row, col) => set({ selectedPosition: { row, col } }),
  
  // 선택 해제
  clearSelectedPosition: () => set({ selectedPosition: null }),
  
  // 착수 (선택된 위치에 돌 놓기)
  placeStone: () => {
    const state = get();
    const multiplayerState = useMultiplayerStore.getState();
    
    // 멀티플레이어 모드면 서버로 전송
    if (multiplayerState.isMultiplayer) {
      if (!state.selectedPosition) return;
      
      const { row, col } = state.selectedPosition;
      
      // 자신의 차례인지 확인
      if (multiplayerState.myPlayer !== state.currentPlayer) {
        // 개발 모드에서만 로그 출력
        if (import.meta.env.DEV) {
          console.log('자신의 차례가 아닙니다.');
        }
        return;
      }
      
      // 서버로 착수 요청
      multiplayerState.placeStone(row, col);
      set({ selectedPosition: null });
      return;
    }
    
    // 싱글플레이어 모드 (기존 로직)
    set((state) => {
      // 이미 승자가 있으면 착수 불가
      if (state.winner) return state;
      
      if (!state.selectedPosition) return state;
      
      const { row, col } = state.selectedPosition;
      
      // 이미 돌이 있는 위치면 착수 불가
      if (state.board[row][col] !== PLAYER.EMPTY) {
        return state;
      }
      
      // 렌주룰 체크 (흑돌만)
      const renjuCheck = checkRenjuRule(state.board, row, col, state.currentPlayer);
      if (!renjuCheck.isValid) {
        alert(renjuCheck.reason);
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
      
      // 착수 기록 추가
      const newMove = {
        row,
        col,
        player: state.currentPlayer,
        turn: state.moves.length + 1,
      };
      const updatedMoves = [...state.moves, newMove];
      
      // 승자가 결정되면 게임 종료
      if (isWinner) {
        return {
          board: newBoard,
          winner: state.currentPlayer,
          selectedPosition: null,
          moves: updatedMoves,
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
        moves: updatedMoves,
      };
    });
  },
  
  // 게임 리셋
  resetGame: (callback) => {
    const multiplayerState = useMultiplayerStore.getState();
    
    // 멀티플레이어 모드면 서버로 전송
    if (multiplayerState.isMultiplayer) {
      multiplayerState.resetGame((response) => {
        if (!response.success && callback) {
          callback(response);
        } else if (callback) {
          callback(response);
        }
      });
      return;
    }
    
    // 싱글플레이어 모드
    set({
      board: Array(BOARD_SIZE).fill(null).map(() => 
        Array(BOARD_SIZE).fill(PLAYER.EMPTY)
      ),
      currentPlayer: PLAYER.BLACK,
      selectedPosition: null,
      winner: null,
      moves: [],
    });
    if (callback) callback({ success: true });
  },
  
  // 멀티플레이어 상태 동기화 (서버에서 받은 데이터로 업데이트)
  syncMultiplayerState: (board, currentPlayer, winner, moves = []) => {
    // moves가 명시적으로 제공되면 항상 사용 (서버에서 받은 데이터)
    // 게임 시작 시 (보드가 비어있고 winner가 null)이면 빈 배열로 초기화
    const isGameStart = board.every(row => row.every(cell => cell === PLAYER.EMPTY)) && 
                        winner === null && 
                        currentPlayer === PLAYER.BLACK;
    
    // moves 파라미터가 제공되었으면 (undefined가 아니면) 사용
    // 게임 시작 시에는 빈 배열로 초기화
    const newMoves = isGameStart ? [] : (moves !== undefined ? moves : get().moves);
    
    set({
      board,
      currentPlayer,
      winner,
      selectedPosition: null,
      moves: newMoves,
    });
  },
  
  // 복기용 보드 상태 설정
  setReplayState: (board, currentMoveIndex, moves) => {
    set({
      board,
      selectedPosition: null,
      moves: moves || [],
      currentMoveIndex: currentMoveIndex || 0,
    });
  },
}));

export default useGameStore;
