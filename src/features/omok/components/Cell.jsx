import React from 'react';
import { BOARD_GAP } from '@shared/constants/omok';

const stoneStyles = {
  black: 'bg-neutral-900 shadow-inner shadow-black/50',
  white: 'bg-gray-100 shadow-inner shadow-black/40',
};

const Cell = ({ row, col, value, onPlace }) => {
  const positionStyle = {
    left: col * BOARD_GAP,
    top: row * BOARD_GAP,
  };

  return (
    <button
      type="button"
      aria-label={`Place stone at row ${row + 1}, column ${col + 1}`}
      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
      style={positionStyle}
      onClick={() => onPlace(row, col)}
    >
      {value && <span className={`block w-full h-full rounded-full ${stoneStyles[value]}`} />}
    </button>
  );
};

export default Cell;
