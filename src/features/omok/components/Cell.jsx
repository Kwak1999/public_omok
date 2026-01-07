import React from 'react';
import { BOARD_GAP } from '@shared/constants/omok';

// 돌 색상별 스타일 정의
// value 값(black / white)에 따라 클래스 적용
const stoneStyles = {
    black: 'bg-neutral-900 shadow-inner shadow-black/50',
    white: 'bg-gray-100 shadow-inner shadow-black/40',
};

// 오목판의 한 칸(Cell)을 담당하는 컴포넌트
// row, col: 현재 셀의 좌표
// value: 해당 셀에 놓인 돌 색상 (없으면 null)
// onPlace: 돌을 놓는 이벤트 핸들러
const Cell = ({ row, col, value, onPlace }) => {
    // 셀의 실제 픽셀 위치 계산
    // BOARD_GAP 기준으로 좌표 배치
    const positionStyle = {
        left: col * BOARD_GAP,
        top: row * BOARD_GAP,
    };

    return (
        <button
            type="button"
            // 접근성: 스크린 리더용 설명
            aria-label={`Place stone at row ${row + 1}, column ${col + 1}`}
            // 중앙 정렬을 위한 transform 적용
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
            style={positionStyle}
            // 클릭 시 해당 좌표에 돌을 놓도록 상위 로직 호출
            onClick={() => onPlace(row, col)}
        >
            {/* value가 존재할 경우에만 돌 렌더링 */}
            {value && (
                <span
                    className={`block w-full h-full rounded-full ${stoneStyles[value]}`}
                />
            )}
        </button>
    );
};

export default Cell;
