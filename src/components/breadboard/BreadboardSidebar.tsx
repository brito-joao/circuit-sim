'use client';

import React from 'react';

interface BreadboardSidebarProps {
  padX: number;
  padY: number;
  boardHeight: number;
  numBoards: number;
  theme: any;
  isDarkMode: boolean;
}

export function BreadboardSidebar({
  padX,
  padY,
  boardHeight,
  numBoards,
  theme,
  isDarkMode
}: BreadboardSidebarProps) {
  return (
    <g>
      <rect x={padX + 1070} y={padY} width={260} height={boardHeight * numBoards - 40} rx={10} fill={theme.discoveryBg} stroke={isDarkMode ? 'none' : '#dcdde1'} strokeWidth={2} />
      <text x={padX + 1200} y={padY + 30} fill={theme.discoveryText} fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="1">
        ANALOG DISCOVERY
      </text>
    </g>
  );
}
