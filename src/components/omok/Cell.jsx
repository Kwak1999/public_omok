import React from 'react';
import { CELL_GAP } from '../../utils/constants';
import useGameStore from '../../stores/useGameStore';

const Cell = ({ row, col }) => {
  const { 
    board, 
    selectedPosition, 
    setSelectedPosition,
    winner
  } = useGameStore();
  
  const cellValue = board[row][col];
  const isSelected = selectedPosition?.row === row && selectedPosition?.col === col;
  const isEmpty = cellValue === null;
  
  // 클릭 가능한 영역 계산 (교차점 주변)
  const clickableSize = 20; // 클릭 가능한 영역 크기
  const left = col * CELL_GAP - clickableSize / 2;
  const top = row * CELL_GAP - clickableSize / 2;
  
  const handleClick = () => {
    // 승자가 있으면 클릭 불가
    if (winner) return;
    // 이미 돌이 있는 위치는 클릭 불가
    if (!isEmpty) return;
    
    // 선택 위치 설정
    setSelectedPosition(row, col);
  };
  
  return (
    <>
      {/* 클릭 가능한 영역 (투명) */}
      <div
        className="absolute cursor-pointer z-10 hover:bg-blue-200 hover:bg-opacity-20 rounded-full transition-all"
        style={{
          left,
          top,
          width: clickableSize,
          height: clickableSize,
        }}
        onClick={handleClick}
      />
      
      {/* 선택 표시 (파란 원) */}
      {isSelected && isEmpty && (
        <div
          className="absolute rounded-full border-2 border-blue-500 bg-blue-200 bg-opacity-30 z-20 animate-pulse"
          style={{
            left: col * CELL_GAP - 12,
            top: row * CELL_GAP - 12,
            width: 24,
            height: 24,
          }}
        />
      )}
      
      {/* 실제 돌 표시 */}
      {cellValue && (
        <div
          className={`absolute rounded-full z-30 shadow-lg ${
            cellValue === 'black' 
              ? 'bg-black border-2 border-gray-800' 
              : 'bg-white border-2 border-gray-300'
          }`}
          style={{
            left: col * CELL_GAP - 14,
            top: row * CELL_GAP - 14,
            width: 28,
            height: 28,
          }}
        />
      )}
    </>
  );
};

export default Cell;
