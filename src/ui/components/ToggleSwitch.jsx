import React from 'react';

// 토글 스위치 컴포넌트
// checked: 스위치 on/off 상태
// onChange: 상태 변경 핸들러
// label: 스위치 옆에 표시할 텍스트 (선택)
const ToggleSwitch = ({ checked, onChange, label }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        {/* 실제 체크박스 (접근성용, 화면에서는 숨김) */}
        <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={onChange}
        />

        {/* 스위치 UI */}
        <div
            className="
        w-11 h-6 bg-gray-700
        peer-focus:outline-none peer-focus:ring-2
        rounded-full
        peer dark:bg-gray-700
        peer-checked:after:translate-x-full
        peer-checked:after:border-white
        after:content-['']
        after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border-gray-300 after:border
        after:rounded-full after:h-5 after:w-5
        after:transition-all
        dark:border-gray-600
        peer-checked:bg-blue-600
      "
        />

        {/* 라벨이 있을 경우에만 렌더링 */}
        {label && (
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </span>
        )}
    </label>
);

export default ToggleSwitch;
