import { useMemo, useState } from 'react';
import { BOARD_SIZE } from '@shared/constants/omok';

const createBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));

export const useOmokGame = () => {
  const [board, setBoard] = useState(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState('black');

  const occupiedCount = useMemo(
    () => board.flat().filter(Boolean).length,
    [board],
  );

  const placeStone = (row, col) => {
    let didPlaceStone = false;

    setBoard((previous) => {
      if (previous[row][col]) return previous;
      didPlaceStone = true;
      const next = previous.map((line) => [...line]);
      next[row][col] = currentPlayer;
      return next;
    });

    if (didPlaceStone) {
      setCurrentPlayer((prev) => (prev === 'black' ? 'white' : 'black'));
    }
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer('black');
  };

  return {
    board,
    currentPlayer,
    occupiedCount,
    placeStone,
    resetGame,
  };
};
