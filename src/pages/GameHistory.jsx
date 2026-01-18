import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameHistory, formatGameDate, deleteGameById } from '../utils/gameHistory';
import { getGuestId } from '../utils/guestAuth';

const GameHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const guestId = getGuestId();
      if (!guestId) {
        navigate('/');
        return;
      }

      try {
        const gameHistory = await getGameHistory(guestId);
        setHistory(gameHistory);
      } catch (error) {
        console.error('경기 기록 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [navigate]);

  const handleReplay = (gameId) => {
    navigate(`/replay/${gameId}`);
  };

  const handleDelete = async (gameId, e) => {
    e.stopPropagation();
    if (window.confirm('이 경기 기록을 삭제하시겠습니까?')) {
      const guestId = getGuestId();
      if (guestId) {
        try {
          await deleteGameById(guestId, gameId);
          setHistory(history.filter(game => game.id !== gameId));
        } catch (error) {
          console.error('경기 기록 삭제 오류:', error);
          alert('경기 기록 삭제에 실패했습니다.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-700 pt-[60px] sm:pt-[70px] md:pt-[80px]">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-700 dark:text-gray-300">
              경기 기록
            </h1>
            <button
              onClick={() => navigate('/')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-gray-500 text-white rounded-md hover:bg-gray-600 transition w-full sm:w-auto"
            >
              홈으로
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 px-4">
                저장된 경기 기록이 없습니다.
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                게임하러 가기
              </button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {history.map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3 md:p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-600 transition gap-2 sm:gap-3"
                >
                  <div className="flex-1 w-full sm:w-auto min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4">
                      <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatGameDate(game.timestamp)}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-300">
                          착수: {game.moves.length}수
                        </span>
                      </div>
                      {game.winner && (
                        <div className="text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap">
                          승자: {game.winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleReplay(game.id)}
                      className="flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
                    >
                      복기
                    </button>
                    <button
                      onClick={(e) => handleDelete(game.id, e)}
                      className="flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
