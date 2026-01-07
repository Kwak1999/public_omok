import React from 'react';
import OmokBoard from '@features/omok/components/OmokBoard.jsx';

// 홈 페이지
// 오목 보드를 메인 콘텐츠로 렌더링
const Home = () => (
    <div id="home" className="pt-28 pb-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-8">
            {/* 페이지 타이틀 영역 */}
            <div className="text-center text-neutral-800 dark:text-gray-200">
                <h1 className="text-4xl font-bold mb-2">Home</h1>
                <p className="text-lg text-neutral-600 dark:text-gray-400">
                    Play and experiment with the Omok board layout.
                </p>
            </div>

            {/* 오목 게임 메인 컴포넌트 */}
            <OmokBoard />
        </div>
    </div>
);

export default Home;
