import React from 'react';
import { BOARD_GAP, BOARD_SIZE, STAR_POINTS } from '@shared/constants/omok';
import OmokControls from './OmokControls.jsx';
import Cell from './Cell.jsx';
import { useOmokGame } from '../hooks/useOmokGame.js';

const OmokBoard = () => {
  const { board, currentPlayer, occupiedCount, placeStone, resetGame } = useOmokGame();
  const boardLength = BOARD_GAP * (BOARD_SIZE - 1);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="p-3 rounded-md shadow-lg bg-amber-200 border-4 border-amber-700">
        <div className="relative" style={{ width: boardLength, height: boardLength }}>
          {Array.from({ length: BOARD_SIZE }).map((_, index) => (
            <div
              key={`v-${index}`}
              className="absolute bg-amber-800"
              style={{ left: index * BOARD_GAP, top: 0, width: 1, height: boardLength }}
            />
          ))}
          {Array.from({ length: BOARD_SIZE }).map((_, index) => (
            <div
              key={`h-${index}`}
              className="absolute bg-amber-800"
              style={{ left: 0, top: index * BOARD_GAP, width: boardLength, height: 1 }}
            />
          ))}

          {STAR_POINTS.map(({ r, c }, idx) => (
            <span
              key={idx}
              className="absolute rounded-full bg-amber-800"
              style={{ width: 8, height: 8, left: c * BOARD_GAP - 4, top: r * BOARD_GAP - 4, pointerEvents: 'none' }}
            />
          ))}

          {board.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <Cell key={`${rowIndex}-${colIndex}`} row={rowIndex} col={colIndex} value={value} onPlace={placeStone} />
            )),
          )}
        </div>
      </div>

      <OmokControls currentPlayer={currentPlayer} occupiedCount={occupiedCount} onReset={resetGame} />
    </div>
  );
};

export default OmokBoard;
