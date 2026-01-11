import React from 'react';
import { useNavigate } from 'react-router-dom';
import Board from "../components/omok/Board.jsx";

const Home = () => {
    const navigate = useNavigate();
    
    return (
        <div className="bg-slate-100 min-h-screen dark:bg-neutral-700 pt-20">
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-neutral-700 dark:text-gray-300 mb-4">
                        오목 게임
                    </h1>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-semibold text-lg"
                        >
                            공개방 입장
                        </button>
                    </div>
                </div>
                <Board />
            </div>
        </div>
    );
};

export default Home;