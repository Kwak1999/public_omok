import React from 'react';
import Cell from './Cell';
import { BOARD_SIZE, CELL_GAP, BOARD_LENGTH, STAR_POSITIONS } from '../../utils/constants';
import useGameStore from '../../stores/useGameStore';

const Board = () => {
    const { 
        selectedPosition, 
        placeStone, 
        currentPlayer,
        clearSelectedPosition 
    } = useGameStore();

    const handlePlaceStone = () => {
        if (selectedPosition) {
            placeStone();
        }
    };

    const handleCancel = () => {
        clearSelectedPosition();
    };

    return (
        // 중앙정렬, 배경색, 화면 전체 높이
        <div className="min-h-screen grid place-items-center bg-slate-100 dark:bg-neutral-700">
            <div className="flex flex-col items-center gap-4">
                {/* 현재 플레이어 표시 */}
                <div className="text-xl font-bold text-neutral-700 dark:text-gray-300">
                    현재 플레이어: 
                    <span className={`ml-2 ${currentPlayer === 'black' ? 'text-black' : 'text-gray-600'}`}>
                        {currentPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}
                    </span>
                </div>

                {/* 보드 목재 배경 + 테두리 */}
                <div className="p-3 rounded-md shadow-lg bg-amber-200 border-4 border-amber-700">
                    {/* 실제 보드 크기 */}
                    <div className="relative" style={{width: BOARD_LENGTH, height: BOARD_LENGTH}}>
                        {/* 세로줄 15개 */}
                        {Array.from({length: BOARD_SIZE}).map((_, i) => (
                            <div
                                key={`v-${i}`}
                                className="absolute bg-amber-800"
                                style={{
                                    left: i * CELL_GAP, 
                                    top: 0, 
                                    width: 1, 
                                    height: BOARD_LENGTH,
                                }}
                            />
                        ))}
                        
                        {/* 가로줄 15개 */}
                        {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                            <div
                                key={`h-${i}`}
                                className="absolute bg-amber-800"
                                style={{
                                    left: 0, 
                                    top: i * CELL_GAP, 
                                    width: BOARD_LENGTH, 
                                    height: 1,
                                }}
                            />
                        ))}

                        {/* 성혈 5개 */}
                        {STAR_POSITIONS.map(({row, col}, idx) => (
                            <span
                                key={idx}
                                className='absolute rounded-full bg-amber-800'
                                style={{
                                    width: 8, 
                                    height: 8,
                                    left: col * CELL_GAP - 4,  // 점의 중심이 교차점에 오도록 -반지름
                                    top: row * CELL_GAP - 4,
                                    pointerEvents: 'none',
                                }}
                            />
                        ))}

                        {/* Cell 컴포넌트들 (15x15) */}
                        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                            Array.from({ length: BOARD_SIZE }).map((_, col) => (
                                <Cell key={`cell-${row}-${col}`} row={row} col={col} />
                            ))
                        )}
                    </div>
                </div>

                {/* 착수 버튼 영역 */}
                <div className="flex gap-3">
                    <button 
                        onClick={handlePlaceStone}
                        disabled={!selectedPosition}
                        className={`px-6 py-2 rounded-md font-semibold transition ${
                            selectedPosition
                                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        착수
                    </button>
                    {selectedPosition && (
                        <button 
                            onClick={handleCancel}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-semibold"
                        >
                            취소
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Board;