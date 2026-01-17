import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const Rule = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <>
            {/* 배경 오버레이 - 전체 화면을 덮음 */}
            <div
                className="fixed inset-0 z-[9999] bg-black bg-opacity-50"
                onClick={onClose}
            />
            {/* 모달 컨텐츠 */}
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 pointer-events-none">
                <div
                    className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[calc(90vh-80px)] overflow-y-auto pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4
                        border-none
                        text-gray-500 hover:text-gray-700
                        bg-white
                        dark:bg-neutral-800
                        dark:text-gray-400
                        dark:hover:text-gray-200 transition-colors"
                        aria-label="닫기"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>

                    {/* 내용 */}
                    <div className="p-6 pt-12">
                        <h2 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-gray-200">
                            렌주룰 (連珠ルール)
                        </h2>

                        <div className="space-y-6">
                            {/* 흑돌 규칙 */}
                            <div className="bg-neutral-100 dark:bg-neutral-700 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-gray-200">
                                    흑(선공) ⚫
                                </h3>
                                <ul className="space-y-2 text-neutral-700 dark:text-gray-300">
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2">❌</span>
                                        <span><strong>6목 이상(장목)</strong> 금지</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2">❌</span>
                                        <span><strong>금수 33</strong> - 열린 3이 동시에 2개 이상 생기는 수</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-red-500 mr-2">❌</span>
                                        <span><strong>금수 44</strong> - 열린 4가 동시에 2개 이상 생기는 수</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 백돌 규칙 */}
                            <div className="bg-neutral-100 dark:bg-neutral-700 p-5 rounded-lg">
                                <h3 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-gray-200">
                                    백(후공) ⚪
                                </h3>
                                <ul className="space-y-2 text-neutral-700 dark:text-gray-300">
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✅</span>
                                        <span><strong>5목 이상 연결</strong>하면 승리</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-500 mr-2">✅</span>
                                        <span><strong>제한 없음</strong> - 모든 수를 둘 수 있습니다</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 기본 규칙 */}
                            <div className="border-t border-neutral-300 dark:border-neutral-600 pt-4">
                                <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-gray-200">
                                    기본 규칙
                                </h3>
                                <ul className="space-y-2 text-neutral-700 dark:text-gray-300">
                                    <li>• 보드 크기: 15×15</li>
                                    <li>• 승리 조건: 가로, 세로, 대각선 중 하나의 방향으로 5개 연속</li>
                                    <li>• 흑돌이 먼저 시작</li>
                                    <li>• 공개방에서 방장은 항상 흑돌</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default Rule;
