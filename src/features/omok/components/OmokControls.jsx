import React from 'react';
import Button from '@ui/components/Button.jsx';

// 플레이어별 텍스트 스타일
const playerColors = {
    black: 'text-neutral-900 dark:text-gray-100',
    white: 'text-gray-200 bg-neutral-900 px-1 rounded',
};

// 게임 상태 제어 UI 컴포넌트
// - 현재 턴 표시
// - 놓인 돌 개수 표시
// - 게임 리셋 버튼 제공
const OmokControls = ({ currentPlayer, occupiedCount, onReset }) => (
    <div className="flex flex-col items-center gap-3 text-neutral-800 dark:text-gray-200">
        {/* 현재 턴 표시 */}
        <p className="text-lg font-semibold">
            Turn:{' '}
            <span className={playerColors[currentPlayer]}>
        {currentPlayer.toUpperCase()}
      </span>
        </p>

        {/* 현재까지 놓인 돌 개수 */}
        <p className="text-sm text-neutral-600 dark:text-gray-400">
            Stones placed: {occupiedCount}
        </p>

        {/* 보드 초기화 버튼 */}
        <Button onClick={onReset}>Reset Board</Button>
    </div>
);

export default OmokControls;
