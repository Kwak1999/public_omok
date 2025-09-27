import React from 'react';

const Board = () => {

    // 오목 보드 15*15
    const Size = 15;
    const Gap = 32;
    const Len = Gap * (Size - 1);

    const Stars = [
        { r: 3,  c: 3  },
        { r: 3,  c: 11 },
        { r: 7,  c: 7  },
        { r: 11, c: 3  },
        { r: 11, c: 11 },
    ]

    return (
        // 중앙정렬, 배경색, 화면 전체 높이
        <div className="min-h-screen grid place-items-center bg-slate-100 dark:bg-neutral-700">
            {/* 보드 목재 배경 + 테두리 */}
            <div className="p-3 rounded-md shadow-lg bg-amber-200 border-4 border-amber-700">
                {/* 실제 보드 크기 */}
                <div className="relative" style={{width: Len, height: Len}}>
                {/* 세로줄 15개 */}
                {Array.from({length: Size}).map((_, i) => (
                    <div
                    key={`v-${i}`}
                    className="absolute bg-amber-800"
                    style={{
                        left: i * Gap, top: 0, width: 1, height: Len,
                    }}
                    />
                ))}
                {/* 가로줄 15개 */}
                    {Array.from({ length: Size }).map((_, i) => (
                        <div
                            key={`h-${i}`}
                            className="absolute bg-amber-800"
                            style={{
                                left: 0, top: i * Gap, width: Len, height: 1,
                            }}
                        />
                    ))}

                {/* 성혈 5개 */}
                    {Stars.map(({r, c}, idx) => (
                        <span
                            key={idx}
                            className='absolute rounded-full bg-amber-800'
                            style={{
                            width: 8, height: 8,
                            left: c * Gap - 4,  // 점의 중심이 교차점에 오도록 -반지름
                            top:  r * Gap - 4,
                            pointerEvents: 'none',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Board;