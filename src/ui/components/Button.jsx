import React from 'react';

// 버튼 스타일 변형(variant) 정의
// primary: 기본 강조 버튼
// ghost: 배경 없는 보조 버튼
const VARIANTS = {
    primary: 'bg-blue-500 text-white hover:bg-blue-400 dark:hover:bg-blue-600',
    ghost:
        'text-slate-600 bg-transparent hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300',
};

// 공통 버튼 컴포넌트
// children: 버튼 내부 콘텐츠
// variant: 버튼 스타일 타입
// className: 추가 커스텀 스타일
// ...props: onClick, type 등 기타 button 속성
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    // 전달된 variant가 없을 경우 primary로 fallback
    const variantClass = VARIANTS[variant] || VARIANTS.primary;

    // 모든 버튼에 공통 적용되는 기본 스타일
    const baseClass = 'px-4 py-2 rounded-md transition font-medium';

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
