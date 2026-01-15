import React, { useState } from 'react';
import Cell from './Cell';
import { BOARD_SIZE, CELL_GAP, BOARD_LENGTH, STAR_POSITIONS } from '../../utils/constants';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import MultiplayerLobby from './MultiplayerLobby';
import socketService from '../../services/socketService';
import { saveGameHistory } from '../../utils/gameHistory';
import { getGuestId } from '../../utils/guestAuth';

const Board = ({ isPublicRoom = false, onToggleReady, onStartGame, roomData = null }) => {
    const { 
        selectedPosition, 
        placeStone, 
        currentPlayer,
        clearSelectedPosition,
        winner,
        resetGame,
        moves,
        board
    } = useGameStore();
    
    const { isMultiplayer, myPlayer, gameEndedPlayer, surrender, players } = useMultiplayerStore();
    const [showLobby, setShowLobby] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    // 게임이 끝났을 때는 gameEndedPlayer를 사용, 아니면 myPlayer 사용
    const displayPlayer = winner && gameEndedPlayer ? gameEndedPlayer : myPlayer;
    
    // 공개방 데이터
    const socket = socketService?.getSocket();
    const mySocketId = socket?.id;
    const isHost = isPublicRoom && roomData?.hostId === mySocketId;
    const guestPlayer = isPublicRoom ? roomData?.players?.find(p => p.socketId !== roomData?.hostId) : null;
    const guestReady = guestPlayer?.isReady || false;
    const myPublicPlayer = isPublicRoom ? roomData?.players?.find(p => p.socketId === mySocketId) : null;
    const isPlaying = isPublicRoom && roomData?.status === 'playing';
    
    // 비공개 방에서 게임이 시작되었는지 확인 (보드에 돌이 하나라도 있으면 시작된 것으로 간주)
    const hasStonesOnBoard = board.some(row => row.some(cell => cell !== null));
    const isPrivateGameStarted = !isPublicRoom && isMultiplayer && hasStonesOnBoard;

    // 게임 종료 시 저장 상태 초기화
    React.useEffect(() => {
        if (!winner) {
            setIsSaved(false);
        }
    }, [winner]);

    const handlePlaceStone = () => {
        if (selectedPosition) {
            placeStone();
        }
    };

    const handleCancel = () => {
        clearSelectedPosition();
    };

    const handleSaveGame = async () => {
        const guestId = getGuestId();
        if (!guestId) {
            alert('게스트 로그인이 필요합니다.');
            return;
        }

        if (!winner || moves.length === 0) {
            alert('저장할 경기 기록이 없습니다.');
            return;
        }

        try {
            const saved = await saveGameHistory(guestId, {
                moves,
                winner,
                players: isMultiplayer ? (players || []) : [],
                roomId: isPublicRoom && roomData ? roomData.id : null,
            });

            if (saved) {
                setIsSaved(true);
                alert('경기 기록이 저장되었습니다.');
            } else {
                alert('경기 기록 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('경기 기록 저장 오류:', error);
            alert('경기 기록 저장에 실패했습니다.');
        }
    };

    return (
        // 중앙정렬, 배경색, 화면 전체 높이
        <div className="min-h-screen grid place-items-center bg-slate-100 dark:bg-neutral-700">
            {showLobby && <MultiplayerLobby onClose={() => setShowLobby(false)} />}
            
            <div className="flex flex-col items-center gap-4">
                {/* 멀티플레이어 모드 표시 */}
                {isMultiplayer && (
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                멀티플레이어 모드
                            </span>
                        </div>
                        {displayPlayer && (
                            <div className="text-sm text-neutral-600 dark:text-gray-400">
                                내 돌: {displayPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}
                            </div>
                        )}
                    </div>
                )}
                
                {/* 승자/패자 표시 또는 현재 플레이어 표시 */}
                {winner ? (
                    isMultiplayer && displayPlayer ? (
                        // 멀티플레이어 모드: 승자/패자 구분
                        displayPlayer === winner ? (
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse">
                                🎉 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 animate-pulse">
                                😢 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리... 패배 😢
                            </div>
                        )
                    ) : (
                        // 싱글플레이어 모드
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse">
                            🎉 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉
                        </div>
                    )
                ) : (
                    <div className="text-xl font-bold text-neutral-700 dark:text-gray-300">
                        {isMultiplayer && myPlayer === currentPlayer ? (
                            <span className="text-green-600 dark:text-green-400">
                                ✅ 당신의 차례입니다!
                            </span>
                        ) : isMultiplayer ? (
                            <span className="text-gray-500 dark:text-gray-400">
                                상대방의 차례입니다...
                            </span>
                        ) : (
                            <>
                                현재 플레이어: 
                                <span className={`ml-2 ${currentPlayer === 'black' ? 'text-black' : 'text-gray-600'}`}>
                                    {currentPlayer === 'black' ? '⚫ 흑돌' : '⚪ 백돌'}
                                </span>
                            </>
                        )}
                    </div>
                )}

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
                    {/* 기권 버튼 - 멀티플레이어 모드이고 게임이 진행 중일 때만 표시 */}
                    {isMultiplayer && !winner && (isPlaying || isPrivateGameStarted) && (
                        <button
                            onClick={() => {
                                if (window.confirm('정말 기권하시겠습니까? 상대방이 승리합니다.')) {
                                    surrender((response) => {
                                        if (!response.success) {
                                            alert('기권 실패: ' + response.error);
                                        }
                                    });
                                }
                            }}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold"
                        >
                            기권
                        </button>
                    )}
                    {winner ? (
                        <>
                            {/* 저장하기 버튼 */}
                            {!isSaved && (
                                <button
                                    onClick={handleSaveGame}
                                    className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition font-semibold"
                                >
                                    저장하기
                                </button>
                            )}
                            {isSaved && (
                                <button
                                    disabled
                                    className="px-6 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed font-semibold"
                                >
                                    저장됨
                                </button>
                            )}
                            {/* 게임이 끝났을 때: 공개방이고 방장이면 새 게임 버튼 (ready 상태 확인), 일반 유저는 버튼 없음 */}
                            {isPublicRoom && isHost ? (
                                <button 
                                    onClick={() => {
                                        resetGame((response) => {
                                            if (!response.success) {
                                                alert('새 게임 시작 실패: ' + response.error);
                                            }
                                        });
                                    }}
                                    disabled={!guestReady}
                                    className={`px-6 py-2 rounded-md font-semibold transition ${
                                        guestReady
                                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    title={!guestReady ? '참가자가 Ready 상태가 되어야 합니다' : ''}
                                >
                                    새 게임 시작
                                </button>
                            ) : !isPublicRoom ? (
                                // 공개방이 아닐 때는 기존대로 새 게임 버튼 표시
                                <button 
                                    onClick={resetGame}
                                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition font-semibold"
                                >
                                    새 게임 시작
                                </button>
                            ) : null}
                        </>
                    ) : (
                        // 공개방 모드일 때: 게임 시작 전에는 START/Ready 버튼, 게임 중에는 착수 버튼
                        isPublicRoom && roomData && roomData.players.length === 2 ? (
                            !isPlaying ? (
                                // 게임 시작 전: 방장은 START, 유저는 Ready
                                isHost ? (
                                    <button
                                        onClick={onStartGame}
                                        disabled={!guestReady}
                                        className={`px-6 py-2 rounded-md font-semibold transition ${
                                            guestReady
                                                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                        title={!guestReady ? '참가자가 Ready 상태가 되어야 합니다' : ''}
                                    >
                                        START
                                    </button>
                                ) : (
                                    <button
                                        onClick={onToggleReady}
                                        className={`px-6 py-2 rounded-md font-semibold transition ${
                                            myPublicPlayer?.isReady
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                    >
                                        {myPublicPlayer?.isReady ? 'Ready 취소' : 'Ready'}
                                    </button>
                                )
                            ) : (
                                // 게임 진행 중: 착수 버튼
                                <>
                                    <button 
                                        onClick={handlePlaceStone}
                                        disabled={!selectedPosition || (isMultiplayer && myPlayer !== currentPlayer)}
                                        className={`px-6 py-2 rounded-md font-semibold transition ${
                                            selectedPosition && (!isMultiplayer || myPlayer === currentPlayer)
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
                                </>
                            )
                        ) : (
                            // 공개방이 아니거나 플레이어가 2명이 아닐 때: 기존 착수 버튼
                            <>
                                <button 
                                    onClick={handlePlaceStone}
                                    disabled={!selectedPosition || (isMultiplayer && myPlayer !== currentPlayer)}
                                    className={`px-6 py-2 rounded-md font-semibold transition ${
                                        selectedPosition && (!isMultiplayer || myPlayer === currentPlayer)
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
                            </>
                        )
                    )}
                </div>
                
                {/* 공개방 모드일 때 게임 종료 후 Ready 버튼 (유저만) */}
                {isPublicRoom && roomData && roomData.players.length === 2 && winner && !isHost ? (
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onToggleReady}
                            className={`px-6 py-2 rounded-md font-semibold transition ${
                                myPublicPlayer?.isReady
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                        >
                            {myPublicPlayer?.isReady ? 'Ready 취소' : 'Ready'}
                        </button>
                    </div>
                ) : !isPublicRoom && !winner ? (
                    /* 멀티플레이어 버튼 - 공개방이 아니고 게임이 진행 중이 아닐 때만 표시 */
                    <button
                        onClick={() => setShowLobby(!showLobby)}
                        disabled={isMultiplayer && !winner}
                        className={`px-6 py-2 rounded-md font-semibold transition ${
                            isMultiplayer && !winner
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isMultiplayer
                                ? 'bg-purple-500 text-white hover:bg-purple-600'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                    >
                        {isMultiplayer ? '멀티플레이어 설정' : '멀티플레이어 시작'}
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default Board;