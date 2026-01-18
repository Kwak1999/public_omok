import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById, formatGameDate } from '../utils/gameHistory';
import { getGuestId } from '../utils/guestAuth';
import { BOARD_SIZE, CELL_GAP, BOARD_LENGTH, STAR_POSITIONS, PLAYER } from '../utils/constants';

const Replay = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [replayBoard, setReplayBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYER.EMPTY))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      const guestId = getGuestId();
      if (!guestId) {
        navigate('/history');
        return;
      }

      try {
        const gameData = await getGameById(guestId, gameId);
        if (!gameData) {
          alert('경기 기록을 찾을 수 없습니다.');
          navigate('/history');
          return;
        }

        setGame(gameData);
      } catch (error) {
        console.error('경기 기록 로드 오류:', error);
        alert('경기 기록을 불러오는데 실패했습니다.');
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId, navigate]);

  // 현재 이동 인덱스에 따라 보드 업데이트
  useEffect(() => {
    if (!game || !game.moves) return;

    const newBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(PLAYER.EMPTY)
    );

    // 현재 이동 인덱스까지의 착수를 보드에 반영
    for (let i = 0; i < currentMoveIndex && i < game.moves.length; i++) {
      const move = game.moves[i];
      newBoard[move.row][move.col] = move.player;
    }

    setReplayBoard(newBoard);
  }, [currentMoveIndex, game]);

  const handlePrevious = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNext = () => {
    if (game && currentMoveIndex < game.moves.length) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const handleGoToStart = () => {
    setCurrentMoveIndex(0);
  };

  const handleGoToEnd = () => {
    if (game) {
      setCurrentMoveIndex(game.moves.length);
    }
  };

  // 모바일에서 보드 크기 계산
  const [boardScale, setBoardScale] = React.useState(1);
  
  React.useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const horizontalPadding = 32;
      const verticalPadding = 300; // 헤더, 컨트롤 등 고려
      
      const availableWidth = viewportWidth - horizontalPadding;
      const availableHeight = viewportHeight - verticalPadding;
      
      const boardWithPadding = BOARD_LENGTH + 24;
      
      const scaleByWidth = availableWidth / boardWithPadding;
      const scaleByHeight = availableHeight / boardWithPadding;
      
      const scale = Math.min(scaleByWidth, scaleByHeight, 1);
      setBoardScale(Math.max(scale, 0.5));
    };
    
    calculateScale();
    window.addEventListener('resize', calculateScale);
    window.addEventListener('orientationchange', calculateScale);
    return () => {
      window.removeEventListener('resize', calculateScale);
      window.removeEventListener('orientationchange', calculateScale);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 pt-16 sm:pt-20 flex items-center justify-center">
        <div className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const currentMove = game.moves[currentMoveIndex - 1] || null;
  const isAtStart = currentMoveIndex === 0;
  const isAtEnd = currentMoveIndex === game.moves.length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-gray-300 mb-1 sm:mb-2">
                경기 복기
              </h1>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-1 sm:gap-2">
                <span>{formatGameDate(game.timestamp)}</span>
                <span>|</span>
                <span>총 {game.moves.length}수</span>
                {game.winner && (
                  <>
                    <span>|</span>
                    <span>승자: {game.winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-gray-500 text-white rounded-md hover:bg-gray-600 transition w-full sm:w-auto flex-shrink-0"
            >
              목록으로
            </button>
          </div>
        </div>

        {/* 게임 보드 */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
          {/* 현재 상태 표시 */}
          <div className="text-center px-2">
            <div className="text-base sm:text-lg md:text-xl font-semibold text-neutral-700 dark:text-gray-300 mb-1 sm:mb-2">
              {isAtStart ? '시작 전' : `제 ${currentMoveIndex}수`}
              {currentMove && ` - ${currentMove.player === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}`}
            </div>
            {isAtEnd && game.winner && (
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                🎉 {game.winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉
              </div>
            )}
          </div>

          {/* 보드 */}
          <div 
            className="p-1.5 sm:p-2 md:p-3 rounded-md shadow-lg bg-amber-200 border-2 sm:border-4 border-amber-700 flex-shrink-0"
            style={{
              transform: `scale(${boardScale})`,
              transformOrigin: 'top center',
              width: `${BOARD_LENGTH + (boardScale < 1 ? 24 / boardScale : 24)}px`,
              height: `${BOARD_LENGTH + (boardScale < 1 ? 24 / boardScale : 24)}px`,
              marginBottom: boardScale < 1 ? `${Math.max((BOARD_LENGTH + 24) * (1 - boardScale) - 40, 0)}px` : '0',
            }}
          >
            <div className="relative" style={{ width: BOARD_LENGTH, height: BOARD_LENGTH }}>
              {/* 세로줄 */}
              {Array.from({ length: BOARD_SIZE }).map((_, i) => (
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

              {/* 가로줄 */}
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

              {/* 성혈 */}
              {STAR_POSITIONS.map(({ row, col }, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full bg-amber-800"
                  style={{
                    width: 8,
                    height: 8,
                    left: col * CELL_GAP - 4,
                    top: row * CELL_GAP - 4,
                    pointerEvents: 'none',
                  }}
                />
              ))}

              {/* 복기용 셀들 */}
              {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                Array.from({ length: BOARD_SIZE }).map((_, col) => (
                  <ReplayCell
                    key={`cell-${row}-${col}`}
                    row={row}
                    col={col}
                    value={replayBoard[row][col]}
                    moveNumber={game.moves.findIndex(m => m.row === row && m.col === col) + 1}
                  />
                ))
              )}
            </div>
          </div>

          {/* 복기 컨트롤 버튼 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full px-2 -mt-8 sm:-mt-4 md:mt-0">
            <button
              onClick={handleGoToStart}
              disabled={isAtStart}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-md font-semibold transition ${
                isAtStart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              처음
            </button>
            <button
              onClick={handlePrevious}
              disabled={isAtStart}
              className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md font-semibold transition text-lg sm:text-xl md:text-2xl ${
                isAtStart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &lt;
            </button>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-neutral-700 rounded-md font-semibold text-xs sm:text-sm md:text-base text-neutral-700 dark:text-gray-300 min-w-[60px] sm:min-w-[80px] md:min-w-[100px] text-center">
              {currentMoveIndex} / {game.moves.length}
            </div>
            <button
              onClick={handleNext}
              disabled={isAtEnd}
              className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md font-semibold transition text-lg sm:text-xl md:text-2xl ${
                isAtEnd
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              &gt;
            </button>
            <button
              onClick={handleGoToEnd}
              disabled={isAtEnd}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-md font-semibold transition ${
                isAtEnd
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              끝
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 복기용 셀 컴포넌트 (클릭 불가)
const ReplayCell = ({ row, col, value, moveNumber }) => {
  const cellValue = value;
  const isEmpty = cellValue === null;

  return (
    <>
      <div
        className="absolute z-10 rounded-full"
        style={{
          left: col * CELL_GAP - 10,
          top: row * CELL_GAP - 10,
          width: 20,
          height: 20,
        }}
      />
      {!isEmpty && (
        <>
          <div
            className={`absolute z-20 rounded-full border-2 ${
              cellValue === 'black'
                ? 'bg-black border-gray-800'
                : 'bg-white border-gray-300'
            }`}
            style={{
              left: col * CELL_GAP - 12,
              top: row * CELL_GAP - 12,
              width: 24,
              height: 24,
            }}
          />
          {moveNumber > 0 && (
            <div
              className={`absolute z-30 text-xs font-bold ${
                cellValue === 'black' ? 'text-white' : 'text-black'
              }`}
              style={{
                left: col * CELL_GAP - 6,
                top: row * CELL_GAP - 8,
                width: 12,
                height: 12,
                lineHeight: '12px',
                textAlign: 'center',
              }}
            >
              {moveNumber}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Replay;
