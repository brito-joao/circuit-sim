'use client';

import React from 'react';

interface BreadboardBoardsProps {
  numBoards: number;
  padX: number;
  padY: number;
  boardHeight: number;
  theme: any;
  isDarkMode: boolean;
}

export function BreadboardBoards({
  numBoards,
  padX,
  padY,
  boardHeight,
  theme,
  isDarkMode
}: BreadboardBoardsProps) {
  const boardsArray = [];
  for (let b = 0; b < numBoards; b++) {
    const offsetY = padY + (b * boardHeight);
    const holes = [];

    for (let col = 1; col <= 50; col++) {
      const cx = padX + 40 + col * 20;
      holes.push(<circle key={`h-prt1-${b}-${col}`} className="hole" cx={cx} cy={offsetY + 40} r="3" fill={theme.hole} />);
      holes.push(<circle key={`h-prt2-${b}-${col}`} className="hole" cx={cx} cy={offsetY + 65} r="3" fill={theme.hole} />);

      for (let row = 0; row < 5; row++) {
        holes.push(<circle key={`h-mm1-${b}-${col}-${row}`} className="hole" cx={cx} cy={offsetY + 90 + row * 14} r="3" fill={theme.hole} />);
        holes.push(<circle key={`h-mm2-${b}-${col}-${row}`} className="hole" cx={cx} cy={offsetY + 200 + row * 14} r="3" fill={theme.hole} />);
      }

      holes.push(<circle key={`h-prb1-${b}-${col}`} className="hole" cx={cx} cy={offsetY + 285} r="3" fill={theme.hole} />);
      holes.push(<circle key={`h-prb2-${b}-${col}`} className="hole" cx={cx} cy={offsetY + 310} r="3" fill={theme.hole} />);
    }

    boardsArray.push(
      <g key={`board-${b}`}>
        <rect className="bb-body" x={padX + 20} y={offsetY + 20} width="1020" height="310" rx="10" ry="10" fill="#ffffff" stroke={isDarkMode ? 'none' : '#dcdde1'} strokeWidth={2} />
        <line className="rail-red" x1={padX + 40} y1={offsetY + 40} x2={padX + 1020} y2={offsetY + 40} stroke="#e84118" strokeWidth="3" />
        <line className="rail-blue" x1={padX + 40} y1={offsetY + 65} x2={padX + 1020} y2={offsetY + 65} stroke="#0097e6" strokeWidth="3" />
        <rect className="bb-trench" x={padX + 40} y={offsetY + 160} width="980" height="30" fill={theme.trench} />
        <line className="rail-blue" x1={padX + 40} y1={offsetY + 285} x2={padX + 1020} y2={offsetY + 285} stroke="#0097e6" strokeWidth="3" />
        <line className="rail-red" x1={padX + 40} y1={offsetY + 310} x2={padX + 1020} y2={offsetY + 310} stroke="#e84118" strokeWidth="3" />
        {holes}
      </g>
    );
  }

  return <>{boardsArray}</>;
}
