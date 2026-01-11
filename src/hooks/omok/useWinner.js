import { useMemo } from 'react';
import useGameStore from '../../stores/useGameStore';
import { checkWinner } from '../../utils/checkWinner';

/**
 * 승리 상태를 관리하는 커스텀 훅
 */
const useWinner = () => {
  const { board, winner, currentPlayer } = useGameStore();

  /**
   * 특정 위치에서 승리했는지 확인
   */
  const checkPositionWinner = (row, col, player) => {
    return checkWinner(board, row, col, player);
  };

  /**
   * 게임이 종료되었는지 확인
   */
  const isGameOver = useMemo(() => {
    return winner !== null;
  }, [winner]);

  /**
   * 현재 플레이어가 승리했는지 확인
   */
  const isCurrentPlayerWinner = useMemo(() => {
    return winner === currentPlayer;
  }, [winner, currentPlayer]);

  return {
    winner,
    isGameOver,
    isCurrentPlayerWinner,
    checkPositionWinner,
  };
};

export default useWinner;
