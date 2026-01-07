import React from 'react';
import Board from "../components/omok/Board.jsx";

const Home = () => {
    return (
        <div className="bg-slate-100 min-h-screen grid place-items-center dark:bg-neutral-700">
            <h1 className="text-4xl font-bold">Home</h1>
            <Board />
        </div>
    );
};

export default Home;