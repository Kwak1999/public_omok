import React, { useEffect, useState } from 'react';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import socketService from '../../services/socketService';

const Timer = () => {
    const { currentPlayer, winner, resetGame } = useGameStore();
    const { isMultiplayer, myPlayer } = useMultiplayerStore();
    const MAIN_TIME = 40; // 40초 (초 단위)
    const TURN_TIME = 20; // 20초 (초 단위)
    
    const [blackTime, setBlackTime] = useState(MAIN_TIME); // 40초 (초 단위)
    const [whiteTime, setWhiteTime] = useState(MAIN_TIME); // 40초 (초 단위)
    const [blackTurnTime, setBlackTurnTime] = useState(null); // 20초 턴 타이머 (null이면 아직 40초 단계)
    const [whiteTurnTime, setWhiteTurnTime] = useState(null); // 20초 턴 타이머 (null이면 아직 40초 단계)
    const [blackMainTimeExhausted, setBlackMainTimeExhausted] = useState(false); // 흑의 40초 소진 여부
    const [whiteMainTimeExhausted, setWhiteMainTimeExhausted] = useState(false); // 백의 40초 소진 여부

    // 게임이 시작되었는지 확인 (보드에 돌이 하나라도 있으면 시작)
    const { board } = useGameStore();
    const gameStarted = board.some(row => row.some(cell => cell !== null));

    // 게임이 리셋되면 타이머도 리셋
    useEffect(() => {
        if (!gameStarted && !winner) {
            setBlackTime(MAIN_TIME);
            setWhiteTime(MAIN_TIME);
            setBlackTurnTime(null);
            setWhiteTurnTime(null);
            setBlackMainTimeExhausted(false);
            setWhiteMainTimeExhausted(false);
        }
    }, [gameStarted, winner]);

    // 메인 타이머 (40초) - 각 플레이어 독립적으로 작동
    useEffect(() => {
        if (!gameStarted || winner) return;

        const interval = setInterval(() => {
            // 흑돌의 40초 타이머 (아직 소진하지 않았고, 흑돌 차례일 때만 감소)
            if (!blackMainTimeExhausted && currentPlayer === 'black' && blackTime > 0) {
                setBlackTime((prev) => {
                    if (prev <= 1) {
                        // 흑의 40초 소진 - 20초 턴 타이머로 전환
                        setBlackMainTimeExhausted(true);
                        setBlackTurnTime(TURN_TIME);
                        return 0;
                    }
                    return prev - 1;
                });
            }
            
            // 백돌의 40초 타이머 (아직 소진하지 않았고, 백돌 차례일 때만 감소)
            if (!whiteMainTimeExhausted && currentPlayer === 'white' && whiteTime > 0) {
                setWhiteTime((prev) => {
                    if (prev <= 1) {
                        // 백의 40초 소진 - 20초 턴 타이머로 전환
                        setWhiteMainTimeExhausted(true);
                        setWhiteTurnTime(TURN_TIME);
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPlayer, gameStarted, winner, blackMainTimeExhausted, whiteMainTimeExhausted, blackTime, whiteTime]);

    // 턴 타이머 (20초) - 40초를 소진한 플레이어만 사용
    useEffect(() => {
        if (!gameStarted || winner) return;

        const interval = setInterval(() => {
            // 흑돌의 20초 턴 타이머 (40초를 소진했고, 흑돌 차례일 때만 작동)
            if (blackMainTimeExhausted && currentPlayer === 'black' && blackTurnTime !== null && blackTurnTime > 0) {
                setBlackTurnTime((prev) => {
                    if (prev <= 1) {
                        // 시간 초과 - 상대 차례로 전환
                        const state = useGameStore.getState();
                        if (state.currentPlayer === 'black' && !state.winner) {
                            if (!isMultiplayer) {
                                // 싱글플레이어 모드: 직접 차례 전환
                                useGameStore.setState({ currentPlayer: 'white' });
                            } else {
                                // 멀티플레이어 모드: 서버에 시간 초과 알림
                                const multiplayerState = useMultiplayerStore.getState();
                                if (multiplayerState.roomId) {
                                    // 서버에 시간 초과 이벤트 전송 (서버에서 차례 전환 처리)
                                    socketService.getSocket()?.emit('timeout', { roomId: multiplayerState.roomId });
                                }
                            }
                        }
                        return 0; // 0으로 설정 (리셋하지 않음)
                    }
                    return prev - 1;
                });
            }
            
            // 백돌의 20초 턴 타이머 (40초를 소진했고, 백돌 차례일 때만 작동)
            if (whiteMainTimeExhausted && currentPlayer === 'white' && whiteTurnTime !== null && whiteTurnTime > 0) {
                setWhiteTurnTime((prev) => {
                    if (prev <= 1) {
                        // 시간 초과 - 상대 차례로 전환
                        const state = useGameStore.getState();
                        if (state.currentPlayer === 'white' && !state.winner) {
                            if (!isMultiplayer) {
                                // 싱글플레이어 모드: 직접 차례 전환
                                useGameStore.setState({ currentPlayer: 'black' });
                            } else {
                                // 멀티플레이어 모드: 서버에 시간 초과 알림
                                const multiplayerState = useMultiplayerStore.getState();
                                if (multiplayerState.roomId) {
                                    // 서버에 시간 초과 이벤트 전송 (서버에서 차례 전환 처리)
                                    socketService.getSocket()?.emit('timeout', { roomId: multiplayerState.roomId });
                                }
                            }
                        }
                        return 0; // 0으로 설정 (리셋하지 않음)
                    }
                    return prev - 1;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPlayer, gameStarted, winner, blackMainTimeExhausted, whiteMainTimeExhausted, blackTurnTime, whiteTurnTime, isMultiplayer]);

    // 착수 시 턴 타이머 리셋 (차례가 바뀔 때)
    const { moves } = useGameStore();
    useEffect(() => {
        if (moves.length > 0) {
            // 차례가 바뀌었을 때 (이전 플레이어의 턴 타이머 리셋)
            const lastMove = moves[moves.length - 1];
            if (lastMove) {
                // 흑이 착수했고 흑이 40초를 소진했다면 턴 타이머 20초로 리셋
                if (lastMove.player === 'black' && blackMainTimeExhausted && blackTurnTime !== null) {
                    setBlackTurnTime(TURN_TIME);
                }
                // 백이 착수했고 백이 40초를 소진했다면 턴 타이머 20초로 리셋
                else if (lastMove.player === 'white' && whiteMainTimeExhausted && whiteTurnTime !== null) {
                    setWhiteTurnTime(TURN_TIME);
                }
            }
        }
    }, [moves.length, blackMainTimeExhausted, whiteMainTimeExhausted]); // moves가 변경되면 (착수 후) 타이머 리셋

    // 차례가 변경될 때 (시간 초과로 인한 차례 전환 포함) 새로운 차례 플레이어의 턴 타이머 리셋
    const prevPlayerRef = React.useRef(currentPlayer);
    useEffect(() => {
        if (!gameStarted || winner) return;
        
        // 차례가 변경되었을 때만 실행
        if (prevPlayerRef.current !== currentPlayer) {
            // 새로운 차례 플레이어의 턴 타이머 리셋 (40초를 소진한 경우에만)
            if (currentPlayer === 'black' && blackMainTimeExhausted && blackTurnTime !== null) {
                setBlackTurnTime(TURN_TIME);
            } else if (currentPlayer === 'white' && whiteMainTimeExhausted && whiteTurnTime !== null) {
                setWhiteTurnTime(TURN_TIME);
            }
            prevPlayerRef.current = currentPlayer;
        }
    }, [currentPlayer, gameStarted, winner, blackMainTimeExhausted, whiteMainTimeExhausted, blackTurnTime, whiteTurnTime]);

    // 게임이 시작되지 않았거나 승자가 있으면 표시하지 않음
    if (!gameStarted || winner) return null;

    // 시간 포맷팅 (MM:SS)
    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 내 차례인지 확인
    const isMyTurn = !isMultiplayer || myPlayer === currentPlayer;

    // 흑돌의 현재 시간과 게이지 계산
    const blackCurrentTime = blackMainTimeExhausted && blackTurnTime !== null ? blackTurnTime : blackTime;
    const blackMaxTime = blackMainTimeExhausted ? TURN_TIME : MAIN_TIME;
    const blackPercentage = (blackCurrentTime / blackMaxTime) * 100;

    // 백돌의 현재 시간과 게이지 계산
    const whiteCurrentTime = whiteMainTimeExhausted && whiteTurnTime !== null ? whiteTurnTime : whiteTime;
    const whiteMaxTime = whiteMainTimeExhausted ? TURN_TIME : MAIN_TIME;
    const whitePercentage = (whiteCurrentTime / whiteMaxTime) * 100;

    return (
        <div className="w-full max-w-md mt-2 sm:mt-4 px-4">
            <div className="space-y-2 sm:space-y-3">
                {/* 흑돌 타이머 */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-gray-300">
                            ⚫ 흑돌 {blackMainTimeExhausted 
                                ? `턴: ${formatTime(blackTurnTime)}` 
                                : `(${formatTime(blackTime)})`}
                        </span>
                        {currentPlayer === 'black' && isMyTurn && (
                            <span className="text-[10px] sm:text-xs text-red-500 font-semibold animate-pulse">진행 중</span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${
                                currentPlayer === 'black' && isMyTurn
                                    ? 'bg-red-500'
                                    : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                            style={{ width: `${blackPercentage}%` }}
                        />
                    </div>
                </div>

                {/* 백돌 타이머 */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-gray-300">
                            ⚪ 백돌 {whiteMainTimeExhausted 
                                ? `턴: ${formatTime(whiteTurnTime)}` 
                                : `(${formatTime(whiteTime)})`}
                        </span>
                        {currentPlayer === 'white' && isMyTurn && (
                            <span className="text-[10px] sm:text-xs text-red-500 font-semibold animate-pulse">진행 중</span>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${
                                currentPlayer === 'white' && isMyTurn
                                    ? 'bg-red-500'
                                    : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                            style={{ width: `${whitePercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;
