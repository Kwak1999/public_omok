import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { FaAlignJustify, FaTimes } from 'react-icons/fa';
import ToggleSwitch from '../components/ToggleSwitch.jsx';
import Button from '../components/Button.jsx';

// 상단 네비게이션 바 컴포넌트
// darkMode: 현재 다크모드 상태
// onToggleTheme: 다크모드 토글 함수
const Navbar = ({ darkMode, onToggleTheme }) => {
    // 모바일 메뉴 열림/닫힘 상태
    const [nav, setNav] = useState(false);

    return (
        <nav className="w-screen h-[80px] z-10 bg-zinc-200 fixed drop-shadow-lg dark:bg-neutral-800">
            <div className="flex items-center justify-between w-full h-full px-10">
                {/* 로고 및 데스크탑 메뉴 */}
                <div className="flex items-center">
                    <h1 className="mr-4 text-3xl font-bold sm:text-4xl text-neutral-700 dark:text-gray-300">
                        BlackMok
                    </h1>

                    {/* 데스크탑 네비게이션 */}
                    <ul className="hidden md:flex">
                        <li className="text-neutral-800 dark:text-gray-300">
                            <Link to="home" smooth duration={500}>
                                Home
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* 데스크탑 우측 버튼 영역 */}
                <div className="hidden pr-4 md:flex items-center space-x-4">
                    <ToggleSwitch
                        checked={darkMode}
                        onChange={onToggleTheme}
                        label={darkMode ? 'Dark' : 'Light'}
                    />
                    <Button variant="ghost">Sign In</Button>
                    <Button>Sign Up</Button>
                </div>

                {/* 모바일 메뉴 버튼 */}
                <div
                    className="flex items-center gap-2 md:hidden"
                    onClick={() => setNav(!nav)}
                >
                    {!nav ? (
                        <FaAlignJustify className="w-5 text-neutral-800 dark:text-gray-300" />
                    ) : (
                        <FaTimes className="w-5 text-neutral-800 dark:text-gray-300" />
                    )}

                    {/* 모바일 다크모드 토글 */}
                    <ToggleSwitch
                        checked={darkMode}
                        onChange={onToggleTheme}
                        label={darkMode ? 'Dark' : 'Light'}
                    />
                </div>
            </div>

            {/* 모바일 메뉴 영역 */}
            <ul
                className={
                    !nav
                        ? 'hidden'
                        : 'absolute bg-zinc-200 w-full px-8 dark:bg-neutral-800'
                }
            >
                <li className="w-full border-b-2 border-zinc-300 text-gray-700 dark:text-gray-300">
                    <Link
                        onClick={() => setNav(false)}
                        to="home"
                        smooth
                        duration={500}
                    >
                        Home
                    </Link>
                </li>

                <div className="flex flex-col my-4">
                    <Button className="mb-4" variant="ghost">
                        Sign In
                    </Button>
                    <Button>Sign Up</Button>
                </div>
            </ul>
        </nav>
    );
};

export default Navbar;
