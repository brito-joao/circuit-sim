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
  isDarkMode,
}: BreadboardBoardsProps) {
  const boardsArray = [];

  for (let b = 0; b < numBoards; b++) {
    const offsetY = padY + b * boardHeight;
    const holes = [];

    for (let col = 1; col <= 50; col++) {
      const cx = padX + 40 + col * 20;

      // Power rail holes
      holes.push(<circle key={`h-prt1-${b}-${col}`} cx={cx} cy={offsetY + 40}  r="3.5" fill={theme.hole} />);
      holes.push(<circle key={`h-prt2-${b}-${col}`} cx={cx} cy={offsetY + 65}  r="3.5" fill={theme.hole} />);

      // Main terminal strips (5 rows each side)
      for (let row = 0; row < 5; row++) {
        holes.push(<circle key={`h-mm1-${b}-${col}-${row}`} cx={cx} cy={offsetY + 90  + row * 14} r="3.5" fill={theme.hole} />);
        holes.push(<circle key={`h-mm2-${b}-${col}-${row}`} cx={cx} cy={offsetY + 200 + row * 14} r="3.5" fill={theme.hole} />);
      }

      // Bottom power rail holes
      holes.push(<circle key={`h-prb1-${b}-${col}`} cx={cx} cy={offsetY + 285} r="3.5" fill={theme.hole} />);
      holes.push(<circle key={`h-prb2-${b}-${col}`} cx={cx} cy={offsetY + 310} r="3.5" fill={theme.hole} />);
    }

    boardsArray.push(
      <g key={`board-${b}`}>
        {/* Board body — white with subtle border shadow */}
        <rect
          className="bb-body"
          x={padX + 20} y={offsetY + 20}
          width="1020" height="310"
          rx="12" ry="12"
          fill={theme.boardBody}
          stroke={isDarkMode ? '#374151' : '#c8d0d8'}
          strokeWidth={2}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
        />

        {/* Top power rails */}
        <line x1={padX + 60} y1={offsetY + 40} x2={padX + 1020} y2={offsetY + 40}
              stroke="#e84118" strokeWidth="2" strokeDasharray="none" />
        <line x1={padX + 60} y1={offsetY + 65} x2={padX + 1020} y2={offsetY + 65}
              stroke="#0097e6" strokeWidth="2" />

        {/* Rail labels */}
        <text x={padX + 46} y={offsetY + 44} fill="#e84118" fontSize="9" fontWeight="bold" textAnchor="middle">+</text>
        <text x={padX + 46} y={offsetY + 69} fill="#0097e6" fontSize="9" fontWeight="bold" textAnchor="middle">−</text>

        {/* Center trench */}
        <rect className="bb-trench"
          x={padX + 60} y={offsetY + 157}
          width="962" height="28"
          fill={theme.trench}
          rx="2"
        />

        {/* Bottom power rails */}
        <line x1={padX + 60} y1={offsetY + 285} x2={padX + 1020} y2={offsetY + 285}
              stroke="#0097e6" strokeWidth="2" />
        <line x1={padX + 60} y1={offsetY + 310} x2={padX + 1020} y2={offsetY + 310}
              stroke="#e84118" strokeWidth="2" />

        {/* Column letter labels a-j on each terminal strip row */}
        {['a','b','c','d','e'].map((letter, i) => (
          <text key={`lbl-t-${b}-${i}`} x={padX + 30} y={offsetY + 94 + i * 14}
                fill={isDarkMode ? '#636e72' : '#b2bec3'} fontSize="8" textAnchor="middle" fontFamily="monospace">
            {letter}
          </text>
        ))}
        {['f','g','h','i','j'].map((letter, i) => (
          <text key={`lbl-b-${b}-${i}`} x={padX + 30} y={offsetY + 204 + i * 14}
                fill={isDarkMode ? '#636e72' : '#b2bec3'} fontSize="8" textAnchor="middle" fontFamily="monospace">
            {letter}
          </text>
        ))}

        {holes}
      </g>
    );
  }

  return <>{boardsArray}</>;
}
