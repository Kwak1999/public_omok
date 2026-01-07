import { useCallback } from 'react';
import useGameStore from '../../stores/useGameStore';
import { PLAYER } from '../../utils/constants';

/**
 * 오목 게임 로직을 관리하는 커스텀 훅
 */
const useOmokGame = () => {
  const {
    board,
    currentPlayer,
    selectedPosition,
    setSelectedPosition,
    clearSelectedPosition,
    placeStone,
    resetGame,
  } = useGameStore();

  /**
   * 특정 위치에 돌을 놓을 수 있는지 확인
   */
  const canPlaceStone = useCallback((row, col) => {
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
      return false;
    }
    return board[row][col] === PLAYER.EMPTY;
  }, [board]);

  /**
   * 선택된 위치에 착수 가능한지 확인
   */
  const canPlaceSelectedStone = useCallback(() => {
    if (!selectedPosition) return false;
    return canPlaceStone(selectedPosition.row, selectedPosition.col);
  }, [selectedPosition, canPlaceStone]);

  /**
   * 착수 실행 (유효성 검사 포함)
   */
  const handlePlaceStone = useCallback(() => {
    if (canPlaceSelectedStone()) {
      placeStone();
    }
  }, [canPlaceSelectedStone, placeStone]);

  /**
   * 셀 클릭 핸들러
   */
  const handleCellClick = useCallback((row, col) => {
    if (canPlaceStone(row, col)) {
      setSelectedPosition(row, col);
    }
  }, [canPlaceStone, setSelectedPosition]);

  return {
    // 상태
    board,
    currentPlayer,
    selectedPosition,
    
    // 액션
    handleCellClick,
    handlePlaceStone,
    handleCancel: clearSelectedPosition,
    resetGame,
    
    // 유틸리티
    canPlaceStone,
    canPlaceSelectedStone,
  };
};

export default useOmokGame;
