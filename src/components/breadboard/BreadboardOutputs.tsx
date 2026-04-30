'use client';

import React from 'react';
import { PinStates } from '@/lib/types';

interface BreadboardOutputsProps {
  outputs?: any[];
  pinStates: PinStates;
  getCoords: (target: string) => { x: number; y: number; isExternal?: boolean };
  theme: any;
  showDetails: (title: string, desc: string) => void;
  hideDetails: () => void;
}

export function BreadboardOutputs({
  outputs,
  pinStates,
  getCoords,
  theme,
  showDetails,
  hideDetails
}: BreadboardOutputsProps) {
  if (!outputs) return null;

  return (
    <>
      {outputs.map((out) => {
        const coords = getCoords(out.id);
        const isHigh = pinStates[out.id] === 1;
        const color = isHigh ? '#00a8ff' : theme.discoveryOff;
        return (
          <g key={`out-${out.id}`}>
            <rect x={coords.x} y={coords.y - 12} width={220} height={24} rx="4" fill={color} style={{ transition: 'fill 0.1s' }} onMouseEnter={() => showDetails(`Output Channel: ${out.id}`, `Label: ${out.label}\nStatus: ${isHigh ? 'HIGH (1)' : 'LOW (0)'}`)} onMouseLeave={hideDetails} />
            <text x={coords.x + 110} y={coords.y} fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" alignmentBaseline="central" style={{ pointerEvents: 'none' }}>
              {out.label} ➔ {isHigh ? 'HIGH' : 'LOW'}
            </text>
          </g>
        );
      })}
    </>
  );
}
