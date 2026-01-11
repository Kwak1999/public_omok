import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAlignJustify, FaTimes } from "react-icons/fa";
import useGameStore from '../stores/useGameStore';
import useMultiplayerStore from '../stores/useMultiplayerStore';

const Navbar = ({darkMode, setDarkMode}) => {
    const [nav, setNav] = useState(false)
    const navigate = useNavigate();
    const { winner } = useGameStore();
    const { isMultiplayer } = useMultiplayerStore();
    
    // 게임이 진행 중인지 확인 (멀티플레이어이고 승자가 없을 때)
    const isGameInProgress = isMultiplayer && !winner;
    
    return (
        <nav className='w-screen h-[80px] z-10 bg-zinc-200 fixed drop-shadow-lg dark:bg-neutral-800'>
            <div className='flex items-center justify-between w-full h-full px-10'>
                <div className='flex items-center'>
                    <h1 
                        className='mr-4 text-3xl font-bold sm:text-4xl text-neutral-700 dark:text-gray-300'
                    >
                        BlackMok
                    </h1>

                    <ul className='hidden md:flex'>
                        <li className='text-neutral-800 dark:text-gray-300'>
                            <Link 
                                to="/" 
                                className={`hover:text-blue-600 transition ${isGameInProgress ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => isGameInProgress && e.preventDefault()}
                            >
                                Home
                            </Link>
                        </li>
                        <li className='text-neutral-800 dark:text-gray-300 ml-4'>
                            <Link 
                                to="/rooms" 
                                className={`hover:text-blue-600 transition ${isGameInProgress ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => isGameInProgress && e.preventDefault()}
                            >
                                공개방
                            </Link>
                        </li>
                    </ul>

                </div>

                <div className='hidden pr-4 md:flex items-center space-x-4'>
                    {/*DarkMode */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type='checkbox'
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}/>
                        {/* toggle style */}
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2
                          rounded-full peer dark:bg-gray-700
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {darkMode ? 'Dark' : 'Light'}
                        </span>
                    </label>

                    <button className = 'mr-4 text-black bg-transparent border-none dark:text-gray-300'>
                        Sign In
                    </button>
                    <button className='px-4 py-2'>Sign Up</button>
                </div>


                <div className='flex items-center gap-2 md:hidden mr-0' onClick={() => setNav(!nav)}>
                    {!nav ? <FaAlignJustify className='w-5 text-neutral-800 dark:text-gray-300' /> : <FaTimes className='w-5 text-neutral-800 dark:text-gray-300' />}
                    <label className="relative inline-flex cursor-pointer">
                        <input
                            type='checkbox'
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}/>
                        {/* toggle style */}
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2
                          rounded-full peer dark:bg-gray-700
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                          after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                          after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                        </div>
                        <span className="flex ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {darkMode ? 'Dark' : 'Light'}
                    </span>
                    </label>
                </div>

            </div>


            <ul className={!nav ? 'hidden' : 'absolute bg-zinc-200 w-full px-8 dark:bg-neutral-800'}>

                <li className={`w-full border-b-2 border-zinc-300 text-gray-700 dark:text-gray-300 ${isGameInProgress ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Link 
                        onClick={() => !isGameInProgress && setNav(false)} 
                        to="/"
                        className={isGameInProgress ? 'cursor-not-allowed' : ''}
                    >
                        Home
                    </Link>
                </li>
                <li className={`w-full border-b-2 border-zinc-300 text-gray-700 dark:text-gray-300 ${isGameInProgress ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Link 
                        onClick={() => !isGameInProgress && setNav(false)} 
                        to="/rooms"
                        className={isGameInProgress ? 'cursor-not-allowed' : ''}
                    >
                        공개방
                    </Link>
                </li>

                <div className='flex flex-col my-4'>
                    <button className='px-8 py-3 mb-4 text-slate-600 bg-transparent'>Sign In</button>
                    <button className='px-8 py-3'>Sign Up</button>
                </div>
            </ul>
        </nav>

    );
};

export default Navbar;