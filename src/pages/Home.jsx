import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from "../components/omok/Board.jsx";
import { loginAsGuest, isGuestLoggedIn, getGuestInfo } from '../utils/guestAuth';
import useGameStore from '../stores/useGameStore';
import useMultiplayerStore from '../stores/useMultiplayerStore';
import { saveGameHistory } from '../utils/gameHistory';

const Home = () => {
    const navigate = useNavigate();
    const [guestId, setGuestId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { winner, moves, board } = useGameStore();
    const { isMultiplayer, players } = useMultiplayerStore();

    useEffect(() => {
        // 게스트 로그인 상태 확인
        const loggedIn = isGuestLoggedIn();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
            const info = getGuestInfo();
            if (info) {
                setGuestId(info.id);
            }
        }
    }, []);

    // 자동 저장은 제거하고 수동 저장 버튼 사용

    const handleGuestLogin = () => {
        const id = loginAsGuest();
        setGuestId(id);
        setIsLoggedIn(true);
    };

    const handleGoToRooms = () => {
        if (!isLoggedIn) {
            alert('게스트 로그인이 필요합니다.');
            return;
        }
        navigate('/rooms');
    };
    
    return (
        <div className="bg-slate-100 min-h-screen dark:bg-neutral-700 pt-[60px] sm:pt-[70px] md:pt-[80px]">
            <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-700 dark:text-gray-300 mb-3 sm:mb-4">
                        오목 게임
                    </h1>
                    {!isLoggedIn ? (
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 px-4">
                                게임을 시작하려면 게스트 로그인이 필요합니다.
                            </p>
                            <button
                                onClick={handleGuestLogin}
                                className="px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg bg-green-500 text-white rounded-md hover:bg-green-600 transition font-semibold"
                            >
                                게스트
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 px-4 break-all">
                                게스트 ID: <span className="font-mono">{guestId}</span>
                            </div>
                            <button
                                onClick={handleGoToRooms}
                                className="px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold"
                            >
                                공개방 입장
                            </button>
                        </div>
                    )}
                </div>
                {isLoggedIn && <Board />}
            </div>
        </div>
    );
};

export default Home;