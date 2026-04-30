'use client';

import React from 'react';
import { PinStates } from '@/lib/types';

interface BreadboardWiresProps {
  wires?: any[];
  getCoords: (target: string) => any;
  draggingWire: any;
  pinStates: PinStates;
  isDarkMode: boolean;
  padY: number;
  boardHeight: number;
  showDetails: (title: string, desc: string) => void;
  hideDetails: () => void;
  setDraggingWire: React.Dispatch<React.SetStateAction<any>>;
  buildStep: number;
  isRunning: boolean;
  changedPins?: Set<string>;
}

export function BreadboardWires({
  wires,
  getCoords,
  draggingWire,
  pinStates,
  isDarkMode,
  padY,
  boardHeight,
  showDetails,
  hideDetails,
  setDraggingWire,
  buildStep,
  isRunning,
  changedPins,
}: BreadboardWiresProps) {
  if (!wires) return null;

  return (
    <>
      <style>
        {`
          @keyframes dashFlow {
            to { stroke-dashoffset: -20; }
          }
          .wire-flow {
            animation: dashFlow 0.5s linear infinite;
          }
          @keyframes debugFlash {
            0%   { filter: drop-shadow(0 0 0px #ffeaa7); }
            30%  { filter: drop-shadow(0 0 18px #fdcb6e) drop-shadow(0 0 32px #e17055); }
            100% { filter: drop-shadow(0 0 4px #ffeaa7); }
          }
          .wire-debug-flash {
            animation: debugFlash 0.7s ease-out forwards;
          }
        `}
      </style>
      {wires.map((w, index) => {
        if (buildStep > -1 && index > buildStep) return null;
        const isHighlighted = buildStep > -1 && index === buildStep;
        let c1: any = { ...getCoords(w.from) };
        let c2: any = { ...getCoords(w.to) };

        // Override coordinates if this specific wire endpoint is currently being dragged
        const isDraggingFrom = draggingWire?.id === w.id && draggingWire.end === 'from';
        const isDraggingTo = draggingWire?.id === w.id && draggingWire.end === 'to';

        if (isDraggingFrom) c1 = { x: draggingWire.mouseX, y: draggingWire.mouseY };
        if (isDraggingTo) c2 = { x: draggingWire.mouseX, y: draggingWire.mouseY };

        const isPower = (id: string) => id === 'VCC' || id === 'GND';
        const isExt = c1.isExternal || c2.isExternal;
        const isPwr = isPower(w.from) || isPower(w.to);

        const extPalette = ['#00a8ff', '#00cec9', '#0984e3', '#0abde3', '#74b9ff', '#81ecec'];
        const intPalette = ['#fbc531', '#9c88ff', '#fd79a8', '#e1b12c', '#8c7ae6', '#e84393'];

        let finalColor = w.color || '#9c88ff';
        let baseStroke = 4;
        let highStroke = 6;

        if (isPwr) {
          finalColor = (w.from === 'VCC' || w.to === 'VCC') ? '#e84118' : '#2f3640';
        } else if (isExt) {
          finalColor = extPalette[index % extPalette.length];
          baseStroke = 5; highStroke = 7;
        } else {
          finalColor = intPalette[index % intPalette.length];
          baseStroke = 4; highStroke = 6;
        }

        // Apply Smart Power Alignment ONLY if we are NOT currently dragging that end
        if (isPower(w.from) && !isDraggingFrom) {
          c1.x = c2.x;
          if (w.from === 'VCC') c1.y = c2.isBottom ? padY + 310 : padY + 40;
          if (w.from === 'GND') c1.y = c2.isBottom ? padY + 285 : padY + 65;
        }
        if (isPower(w.to) && !isDraggingTo) {
          c2.x = c1.x;
          if (w.to === 'VCC') c2.y = c1.isBottom ? padY + 310 : padY + 40;
          if (w.to === 'GND') c2.y = c1.isBottom ? padY + 285 : padY + 65;
        }

        let d = '';

        if (isPwr && !isDraggingFrom && !isDraggingTo) {
          d = `M ${c1.x} ${c1.y} L ${c2.x} ${c2.y}`;
        } else if (isExt && !isDraggingFrom && !isDraggingTo) {
          const ext = c1.isExternal ? c1 : c2;
          const brd = c1.isExternal ? c2 : c1;
          const cp1x = brd.x;
          const cp1y = brd.isTop ? (padY - 20 - (index * 8)) : (padY + boardHeight + 20 + (index * 8));
          const cp2x = ext.x - 100 - (index * 15);
          const cp2y = ext.y;
          d = `M ${brd.x} ${brd.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ext.x} ${ext.y}`;
        } else {
          const distance = Math.abs(c1.x - c2.x);
          const slack = (distance * 0.3) + 30 + ((index * 8) % 40);
          let cp1y = c1.isTop ? c1.y - slack : c1.y + slack;
          let cp2y = c2.isTop ? c2.y - slack : c2.y + slack;
          d = `M ${c1.x} ${c1.y} C ${c1.x} ${cp1y}, ${c2.x} ${cp2y}, ${c2.x} ${c2.y}`;
        }

        const isHigh        = pinStates[w.from] === 1;
        const isChangedDebug = changedPins && (changedPins.has(w.from) || changedPins.has(w.to));
        // Ultra visible when not running
        const opacity = !isRunning ? '1' : (isHighlighted ? '1' : (isHigh ? '1' : (isDarkMode ? '0.4' : '0.3')));
        const currentStroke = isHighlighted ? 10 : (isHigh ? highStroke : baseStroke);

        let filter = 'drop-shadow(2px 3px 2px rgba(0,0,0,0.3))';
        if (isChangedDebug) filter = 'none'; // handled by CSS class
        else if (isHighlighted) filter = `drop-shadow(0 0 12px yellow)`;
        else if (isHigh) filter = `drop-shadow(0 0 8px ${finalColor})`;

        return (
          <g key={`wire-group-${w.id}`}>
            {/* The Wire Path */}
            <path
              id={`svg-${w.id}`}
              className={[
                isHigh && isRunning ? 'wire-flow' : '',
                isChangedDebug ? 'wire-debug-flash' : '',
              ].filter(Boolean).join(' ')}
              d={d}
              stroke={finalColor}
              strokeWidth={currentStroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={isHigh ? '5,5' : 'none'}
              style={{
                opacity: (isDraggingFrom || isDraggingTo) ? 0.8 : opacity,
                transition: (isDraggingFrom || isDraggingTo) ? 'none' : 'stroke-width 0.2s, opacity 0.2s',
                filter: filter
              }}
              onMouseEnter={() => showDetails(`Wire: ${w.id}`, `Source: ${w.from}\nDestination: ${w.to}`)}
              onMouseLeave={hideDetails}
            />

            {/* Drag Handle: FROM */}
            <circle
              className="wire-handle"
              cx={c1.x} cy={c1.y} r="6"
              fill={isDarkMode ? "#2f3640" : "#ffffff"}
              stroke={finalColor} strokeWidth="2"
              style={{ cursor: 'grab', zIndex: 100 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingWire({ id: w.id, end: 'from', mouseX: c1.x, mouseY: c1.y });
              }}
            />

            {/* Drag Handle: TO */}
            <circle
              className="wire-handle"
              cx={c2.x} cy={c2.y} r="6"
              fill={isDarkMode ? "#2f3640" : "#ffffff"}
              stroke={finalColor} strokeWidth="2"
              style={{ cursor: 'grab', zIndex: 100 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingWire({ id: w.id, end: 'to', mouseX: c2.x, mouseY: c2.y });
              }}
            />
          </g>
        );
      })}
    </>
  );
}
