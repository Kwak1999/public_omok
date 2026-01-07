import { useMemo, useState } from 'react';
import { BOARD_SIZE } from '@shared/constants/omok';

// 빈 오목판 생성 함수
// BOARD_SIZE x BOARD_SIZE 크기의 2차원 배열
const createBoard = () =>
    Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => null),
    );

// 오목 게임의 상태와 로직을 담당하는 커스텀 훅
export const useOmokGame = () => {
    // 오목판 상태
    const [board, setBoard] = useState(createBoard);

    // 현재 플레이어 (black / white)
    const [currentPlayer, setCurrentPlayer] = useState('black');

    // 전체 돌 개수 계산 (메모이제이션)
    const occupiedCount = useMemo(
        () => board.flat().filter(Boolean).length,
        [board],
    );

    // 돌을 놓는 함수
    const placeStone = (row, col) => {
        let didPlaceStone = false;

        setBoard((previous) => {
            // 이미 돌이 있는 칸이면 무시
            if (previous[row][col]) return previous;

            didPlaceStone = true;

            // 불변성 유지를 위한 깊은 복사
            const next = previous.map((line) => [...line]);
            next[row][col] = currentPlayer;
            return next;
        });

        // 정상적으로 돌이 놓였을 경우 턴 변경
        if (didPlaceStone) {
            setCurrentPlayer((prev) =>
                prev === 'black' ? 'white' : 'black',
            );
        }
    };

    // 게임 초기화
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
