'use client';

import React from 'react';
import { PinStates } from '@/lib/types';

interface BreadboardInputsProps {
  inputs?: any[];
  pinStates: PinStates;
  getCoords: (target: string) => { x: number; y: number; isExternal?: boolean };
  handleSafeClick: (e: React.MouseEvent, callback: () => void) => void;
  onInputClick: (inputId: string) => void;
  showDetails: (title: string, desc: string) => void;
  hideDetails: () => void;
}

export function BreadboardInputs({
  inputs,
  pinStates,
  getCoords,
  handleSafeClick,
  onInputClick,
  showDetails,
  hideDetails
}: BreadboardInputsProps) {
  if (!inputs) return null;

  return (
    <>
      {inputs.map((inp) => {
        const coords = getCoords(inp.id);
        const isHigh = pinStates[inp.id] === 1;
        const color = isHigh ? '#4cd137' : '#e84118';
        return (
          <g key={`inp-${inp.id}`}>
            <rect x={coords.x} y={coords.y - 12} width={220} height={24} rx="4" fill={color} onClick={(e) => handleSafeClick(e, () => onInputClick(inp.id))} style={{ cursor: 'pointer', transition: 'fill 0.2s' }} onMouseEnter={() => showDetails(`Input Channel: ${inp.id}`, `Label: ${inp.label}\nClick to toggle. Current: ${isHigh ? 'HIGH' : 'LOW'}`)} onMouseLeave={hideDetails} />
            <text x={coords.x + 110} y={coords.y} fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" alignmentBaseline="central" style={{ pointerEvents: 'none' }}>
              {inp.label} ➔ {isHigh ? '1' : '0'}
            </text>
          </g>
        );
      })}
    </>
  );
}
