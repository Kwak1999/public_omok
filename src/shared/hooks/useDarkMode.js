import { useEffect, useState } from 'react';

// 다크모드 상태를 관리하는 커스텀 훅
// initialMode: 초기 다크모드 여부
const useDarkMode = (initialMode = false) => {
    const [darkMode, setDarkMode] = useState(initialMode);

    // darkMode 변경 시 html 루트에 class 적용
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // 다크모드 토글 함수
    const toggleDarkMode = () =>
        setDarkMode((prev) => !prev);

    return { darkMode, toggleDarkMode };
};

export default useDarkMode;
