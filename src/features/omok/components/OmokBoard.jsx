import React from 'react';
import { BOARD_GAP, BOARD_SIZE, STAR_POINTS } from '@shared/constants/omok';
import OmokControls from './OmokControls.jsx';
import Cell from './Cell.jsx';
import { useOmokGame } from '../hooks/useOmokGame.js';

// 오목 게임의 메인 보드 컴포넌트
// - 격자선 렌더링
// - 별점(화점) 표시
// - Cell 컴포넌트 배치
// - 게임 상태 제어 UI 연결
const OmokBoard = () => {
    // 커스텀 훅에서 게임 상태와 로직을 가져옴
    const {
        board,
        currentPlayer,
        occupiedCount,
        placeStone,
        resetGame,
    } = useOmokGame();

    // 전체 보드의 실제 픽셀 길이 계산
    const boardLength = BOARD_GAP * (BOARD_SIZE - 1);

    return (
        <div className="flex flex-col items-center gap-6">
            {/* 오목판 배경 */}
            <div className="p-3 rounded-md shadow-lg bg-amber-200 border-4 border-amber-700">
                <div
                    className="relative"
                    style={{ width: boardLength, height: boardLength }}
                >
                    {/* 세로 격자선 */}
                    {Array.from({ length: BOARD_SIZE }).map((_, index) => (
                        <div
                            key={`v-${index}`}
                            className="absolute bg-amber-800"
                            style={{
                                left: index * BOARD_GAP,
                                top: 0,
                                width: 1,
                                height: boardLength,
                            }}
                        />
                    ))}

                    {/* 가로 격자선 */}
                    {Array.from({ length: BOARD_SIZE }).map((_, index) => (
                        <div
                            key={`h-${index}`}
                            className="absolute bg-amber-800"
                            style={{
                                left: 0,
                                top: index * BOARD_GAP,
                                width: boardLength,
                                height: 1,
                            }}
                        />
                    ))}

                    {/* 화점(별점) 렌더링 */}
                    {STAR_POINTS.map(({ r, c }, idx) => (
                        <span
                            key={idx}
                            className="absolute rounded-full bg-amber-800"
                            style={{
                                width: 8,
                                height: 8,
                                left: c * BOARD_GAP - 4,
                                top: r * BOARD_GAP - 4,
                                // 클릭 이벤트 방지
                                pointerEvents: 'none',
                            }}
                        />
                    ))}

                    {/* 오목판의 모든 Cell 렌더링 */}
                    {board.map((row, rowIndex) =>
                        row.map((value, colIndex) => (
                            <Cell
                                key={`${rowIndex}-${colIndex}`}
                                row={rowIndex}
                                col={colIndex}
                                value={value}
                                onPlace={placeStone}
                            />
                        )),
                    )}
                </div>
            </div>

            {/* 턴 정보, 돌 개수, 리셋 버튼 */}
            <OmokControls
                currentPlayer={currentPlayer}
                occupiedCount={occupiedCount}
                onReset={resetGame}
            />
        </div>
    );
};

export default OmokBoard;
