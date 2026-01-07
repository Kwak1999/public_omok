import React from 'react';
import Navbar from './Navbar.jsx';

// 전체 페이지 공통 레이아웃 컴포넌트
// darkMode: 전역 다크모드 상태
// onToggleTheme: 테마 변경 함수
// children: 실제 페이지 콘텐츠
const PageShell = ({ darkMode, onToggleTheme, children }) => (
    // Tailwind dark 모드 적용을 위한 클래스 토글
    <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-700">
            {/* 상단 네비게이션 */}
            <Navbar darkMode={darkMode} onToggleTheme={onToggleTheme} />

            {/* 페이지별 콘텐츠 */}
            {children}
        </div>
    </div>
);

export default PageShell;
