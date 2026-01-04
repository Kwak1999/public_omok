import React from 'react';
import Button from '@ui/components/Button.jsx';

const playerColors = {
  black: 'text-neutral-900 dark:text-gray-100',
  white: 'text-gray-200 bg-neutral-900 px-1 rounded',
};

const OmokControls = ({ currentPlayer, occupiedCount, onReset }) => (
  <div className="flex flex-col items-center gap-3 text-neutral-800 dark:text-gray-200">
    <p className="text-lg font-semibold">
      Turn: <span className={playerColors[currentPlayer]}>{currentPlayer.toUpperCase()}</span>
    </p>
    <p className="text-sm text-neutral-600 dark:text-gray-400">Stones placed: {occupiedCount}</p>
    <Button onClick={onReset}>Reset Board</Button>
  </div>
);

export default OmokControls;
