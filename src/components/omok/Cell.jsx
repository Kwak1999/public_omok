import React, { useMemo } from 'react';
import { CELL_GAP } from '../../utils/constants';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import { checkRenjuRule } from '../../hooks/omok/useRenjuRule';

const Cell = ({ row, col }) => {
  const { 
    board, 
    selectedPosition, 
    setSelectedPosition,
    winner,
    currentPlayer
  } = useGameStore();
  
  const { isMultiplayer, myPlayer } = useMultiplayerStore();
  
  const cellValue = board[row][col];
  const isSelected = selectedPosition?.row === row && selectedPosition?.col === col;
  const isEmpty = cellValue === null;
  
  // 멀티플레이어 모드일 때 자신의 차례인지 확인
  const isMyTurn = !isMultiplayer || myPlayer === currentPlayer;
  
  // 렌주룰 금지 위치 체크 (흑돌 차례이고 빈 칸일 때만)
  const isForbidden = useMemo(() => {
    if (!isEmpty || currentPlayer !== 'black' || winner) {
      return false;
    }
    const renjuCheck = checkRenjuRule(board, row, col, currentPlayer);
    return !renjuCheck.isValid;
  }, [board, row, col, currentPlayer, isEmpty, winner]);
  
  // 클릭 가능한 영역 계산 (교차점 주변)
  const clickableSize = 20; // 클릭 가능한 영역 크기
  const left = col * CELL_GAP - clickableSize / 2;
  const top = row * CELL_GAP - clickableSize / 2;
  
  const handleClick = () => {
    // 승자가 있으면 클릭 불가
    if (winner) return;
    // 멀티플레이어 모드일 때 자신의 차례가 아니면 클릭 불가
    if (!isMyTurn) return;
    // 이미 돌이 있는 위치는 클릭 불가
    if (!isEmpty) return;
    
    // 렌주룰 체크 (흑돌만)
    const renjuCheck = checkRenjuRule(board, row, col, currentPlayer);
    if (!renjuCheck.isValid) {
      alert(renjuCheck.reason);
      return;
    }
    
    // 선택 위치 설정
    setSelectedPosition(row, col);
  };
  
  return (
    <>
      {/* 클릭 가능한 영역 (투명) */}
      <div
        className={`absolute z-10 rounded-full transition-all ${
          isMyTurn && isEmpty && !winner
            ? 'cursor-pointer hover:bg-blue-200 hover:bg-opacity-20'
            : 'cursor-not-allowed'
        }`}
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
      
      {/* 렌주룰 금지 위치 X 표시 */}
      {isForbidden && (
        <div
          className="absolute z-25 text-red-500 font-bold text-xl pointer-events-none"
          style={{
            left: col * CELL_GAP - 10,
            top: row * CELL_GAP - 10,
            width: 20,
            height: 20,
            lineHeight: '20px',
            textAlign: 'center',
          }}
        >
          ✕
        </div>
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
