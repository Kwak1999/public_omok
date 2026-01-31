import React, { useState } from 'react';
import Cell from './Cell';
import { BOARD_SIZE, CELL_GAP, BOARD_LENGTH, STAR_POSITIONS } from '../../utils/constants';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import MultiplayerLobby from './MultiplayerLobby';
import socketService from '../../services/socketService';
import { saveGameHistory } from '../../utils/gameHistory';
import { getGuestId } from '../../utils/guestAuth';
import Timer from './Timer';

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

    // 모바일에서 보드 크기 계산 (화면 너비와 높이를 모두 고려)
    // 초기값을 안전하게 설정 (모바일로 가정)
    const [boardScale, setBoardScale] = React.useState(1);
    const [isMobile, setIsMobile] = React.useState(true); // 초기값을 모바일로 가정
    const [boardPadding, setBoardPadding] = React.useState(6); // 초기값을 모바일 패딩으로 설정
    const [borderPx, setBorderPx] = React.useState(2); // 초기값을 모바일 border로 설정
    const [isCalculated, setIsCalculated] = React.useState(false); // 계산 완료 여부

    React.useEffect(() => {
        const calculateScale = () => {
            // 뷰포트가 준비될 때까지 대기
            if (typeof window === 'undefined' || !window.innerWidth) {
                return;
            }

            const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 375;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 667;
            const isMobileView = viewportWidth < 640; // sm 브레이크포인트
            setIsMobile(isMobileView);

            // 화면 크기에 따른 패딩 설정 (Tailwind 브레이크포인트 기준)
            // p-1.5 = 6px (모바일), p-2 = 8px (sm), p-3 = 12px (md)
            if (viewportWidth >= 768) {
                setBoardPadding(12); // md 이상: 12px
            } else if (viewportWidth >= 640) {
                setBoardPadding(8); // sm: 8px
            } else {
                setBoardPadding(6); // 모바일: 6px
            }

            // 화면 크기에 따른 border 설정 (border-2, sm:border-4)
            setBorderPx(viewportWidth >= 640 ? 4 : 2);

            // PC에서는 스케일을 적용하지 않음
            if (!isMobileView) {
                setBoardScale(1);
                setIsCalculated(true);
                return;
            }

            // 모바일에서만 스케일 계산
            // 매우 작은 화면(150px~640px)에서도 보드가 제대로 보이도록 조정
            const horizontalPadding = Math.max(viewportWidth * 0.05, 8); // 최소 8px, 화면의 5%
            const verticalPadding = Math.max(viewportHeight * 0.25, 180); // 최소 180px, 화면의 25%

            const availableWidth = Math.max(viewportWidth - horizontalPadding * 2, 120); // 최소 120px 보장
            const availableHeight = Math.max(viewportHeight - verticalPadding, 250); // 최소 250px 보장

            const currentPadding = 6; // 모바일 패딩
            const boardWithPadding = BOARD_LENGTH + currentPadding * 2; // 보드 + 내부 패딩

            const scaleByWidth = availableWidth / boardWithPadding;
            const scaleByHeight = availableHeight / boardWithPadding;

            // 더 작은 스케일을 선택하되, 최소 0.35 (35%)로 제한하여 보드가 너무 작아지지 않도록
            const scale = Math.min(scaleByWidth, scaleByHeight, 1);
            setBoardScale(Math.max(scale, 0.35)); // 최소 35% 스케일
            setIsCalculated(true);
        };

        // 즉시 계산 시도
        calculateScale();

        // DOM이 완전히 로드된 후 다시 계산 (일부 브라우저에서 필요)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', calculateScale);
        }

        // 약간의 지연 후 다시 계산 (뷰포트가 안정화될 때까지)
        const timeoutId = setTimeout(calculateScale, 100);

        window.addEventListener('resize', calculateScale);
        window.addEventListener('orientationchange', () => {
            setTimeout(calculateScale, 100); // orientationchange 후 뷰포트가 안정화될 때까지 대기
        });

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('DOMContentLoaded', calculateScale);
            window.removeEventListener('resize', calculateScale);
            window.removeEventListener('orientationchange', calculateScale);
        };
    }, []);

    return (
        // 중앙정렬, 배경색, 화면 전체 높이
        <div className="min-h-screen flex flex-col items-center bg-slate-100 dark:bg-neutral-700 pt-[60px] sm:pt-[70px] md:pt-[80px] pb-4 sm:pb-8 px-2 sm:px-4 md:px-6">
            {showLobby && <MultiplayerLobby onClose={() => setShowLobby(false)} />}

            <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-2xl flex-shrink-0">
                {/* 멀티플레이어 모드 표시 */}
                {isMultiplayer && (
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
                                멀티플레이어 모드
                            </span>
                        </div>
                        {displayPlayer && (
                            <div className="text-xs sm:text-sm text-neutral-600 dark:text-gray-400">
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
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse text-center px-4">
                                🎉 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉
                            </div>
                        ) : (
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 animate-pulse text-center px-4">
                                😢 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리... 패배 😢
                            </div>
                        )
                    ) : (
                        // 싱글플레이어 모드
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse text-center px-4">
                            🎉 {winner === 'black' ? '⚫ 흑돌' : '⚪ 백돌'} 승리! 🎉
                        </div>
                    )
                ) : (
                    <div className="text-base sm:text-lg md:text-xl font-bold text-neutral-700 dark:text-gray-300 text-center px-4">
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
                {(() => {
                    const borderPx = isMobile ? 2 : 4;           // ✅ window.innerWidth 사용 X
                    const scale = isMobile ? Math.min(boardScale, 1) : 1;

                    // ✅ padding + border 포함한 바깥 크기
                    const outerSize = BOARD_LENGTH + boardPadding * 2 + borderPx * 2;

                    return (
                        // ✅ [레이아웃 박스] : 여기서는 절대 outerSize를 늘리지 않음 (클리핑 방지)
                        <div
                            className="flex-shrink-0"
                            style={{
                                width: outerSize,
                                height: outerSize,
                            }}
                        >
                            {/* ✅ [시각 박스] : 여기만 scale */}
                            <div
                                className="rounded-md shadow-lg bg-amber-200 border-amber-700 inline-block relative z-0"
                                style={{
                                    borderStyle: "solid",
                                    borderWidth: borderPx,
                                    padding: boardPadding,
                                    width: outerSize,
                                    height: outerSize,
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top center",
                                }}
                            >


                            {/* 실제 보드 크기 */}
                            <div className="relative" style={{ width: BOARD_LENGTH, height: BOARD_LENGTH }}>
                                {/* 세로줄 (퍼센트 기반) */}
                                {Array.from({ length: BOARD_SIZE }).map((_, i) => {
                                    const pos = (i / (BOARD_SIZE - 1)) * 100;
                                    return (
                                        <div
                                            key={`v-${i}`}
                                            className="absolute bg-amber-800"
                                            style={{
                                                left: `${pos}%`,
                                                top: 0,
                                                width: 1,
                                                height: "100%",
                                                transform: "translateX(-0.5px)",
                                            }}
                                        />
                                    );
                                })}

                                {/* 가로줄 (퍼센트 기반) */}
                                {Array.from({ length: BOARD_SIZE }).map((_, i) => {
                                    const pos = (i / (BOARD_SIZE - 1)) * 100;
                                    return (
                                        <div
                                            key={`h-${i}`}
                                            className="absolute bg-amber-800"
                                            style={{
                                                left: 0,
                                                top: `${pos}%`,
                                                width: "100%",
                                                height: 1,
                                                transform: "translateY(-0.5px)",
                                            }}
                                        />
                                    );
                                })}

                                {/* 성혈 (퍼센트 기반) */}
                                {STAR_POSITIONS.map(({ row, col }, idx) => {
                                    const x = (col / (BOARD_SIZE - 1)) * 100;
                                    const y = (row / (BOARD_SIZE - 1)) * 100;
                                    return (
                                        <span
                                            key={idx}
                                            className="absolute rounded-full bg-amber-800"
                                            style={{
                                                width: 8,
                                                height: 8,
                                                left: `${x}%`,
                                                top: `${y}%`,
                                                transform: "translate(-50%, -50%)",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    );
                                })}

                                {/* Cell */}
                                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                                    Array.from({ length: BOARD_SIZE }).map((_, col) => (
                                        <Cell key={`cell-${row}-${col}`} row={row} col={col} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    );
                })()}

                {/* 착수 버튼 영역 */}
                <div
                    className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center w-full px-2 sm:px-4 relative z-10"
                    style={{
                        marginTop: isMobile && boardScale < 1
                            ? `${Math.max(-((BOARD_LENGTH + 12) * (1 - boardScale)) + 30, -20)}px`
                            : '0px',
                    }}
                >
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
                            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold"
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
                                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-purple-500 text-white rounded-md hover:bg-purple-600 transition font-semibold"
                                >
                                    저장하기
                                </button>
                            )}
                            {isSaved && (
                                <button
                                    disabled
                                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-300 text-gray-500 rounded-md cursor-not-allowed font-semibold"
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
                                    className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-green-500 text-white rounded-md hover:bg-green-600 transition font-semibold"
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
                                        className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                                        className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                                        className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                                            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-semibold"
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
                                    className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                                        className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-semibold"
                                    >
                                        취소
                                    </button>
                                )}
                            </>
                        )
                    )}
                </div>

                {/* 타이머 - 게임 진행 중일 때만 표시 */}
                {(isMultiplayer && (isPlaying || isPrivateGameStarted) && !winner) && (
                    <Timer />
                )}

                {/* 싱글플레이어 모드 타이머 */}
                {!isMultiplayer && !winner && board.some(row => row.some(cell => cell !== null)) && (
                    <Timer />
                )}

                {/* 공개방 모드일 때 게임 종료 후 Ready 버튼 (유저만) */}
                {isPublicRoom && roomData && roomData.players.length === 2 && winner && !isHost ? (
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onToggleReady}
                            className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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
                        className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md font-semibold transition ${
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