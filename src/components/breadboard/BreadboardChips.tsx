'use client';

import React from 'react';
import { ComponentLibrary } from '@/lib/componentLibrary';

interface BreadboardChipsProps {
  chips?: any[];
  padX: number;
  padY: number;
  boardHeight: number;
  theme: any;
  isDarkMode: boolean;
  xRayMode: boolean;
  showDetails: (title: string, desc: string) => void;
  hideDetails: () => void;
  customComponents?: any[];
}

export function BreadboardChips({
  chips,
  padX,
  padY,
  boardHeight,
  theme,
  isDarkMode,
  xRayMode,
  showDetails,
  hideDetails,
  customComponents
}: BreadboardChipsProps) {
  if (!chips) return null;

  return (
    <>
      {chips.map((chip) => {
        let lib = ComponentLibrary[chip.type];
        if (!lib && customComponents) {
          const custom = customComponents.find(c => c.type === chip.type);
          if (custom) {
             lib = { name: custom.name || chip.type, pins: custom.pins, pinLabels: custom.pinLabels, category: 'Custom', eval: () => {} };
          }
        }
        if (!lib) lib = { pins: 14 } as any;

        const pinsPerSide = lib.pins / 2;
        const offsetY = padY + (chip.board || 0) * boardHeight;
        const startX = padX + 40 + chip.col * 20 - 10;
        const width = pinsPerSide * 20;

        const pins = [];
        for (let i = 0; i < pinsPerSide; i++) {
          const cx = padX + 40 + (chip.col + i) * 20;
          pins.push(<rect key={`pin-t-${chip.id}-${i}`} x={cx - 4} y={offsetY + 146} width={8} height={10} fill="silver" />);
          pins.push(<rect key={`pin-b-${chip.id}-${i}`} x={cx - 4} y={offsetY + 190} width={8} height={10} fill="silver" />);
        }

        const fillBody = xRayMode ? 'rgba(34, 47, 62, 0.4)' : theme.chipBody;

        return (
          <g key={`chip-${chip.id}`}>
            {pins}
            <rect className="ic-body" x={startX} y={offsetY + 150} width={width} height={46} fill={fillBody} stroke="#1e272e" strokeWidth="2" rx="4" ry="4" onMouseEnter={() => showDetails(`Chip: ${chip.id}`, `Type: ${chip.type}\n${lib.name || 'Logic IC'}`)} onMouseLeave={hideDetails} />
            <path className="ic-notch" d={`M ${startX} ${offsetY + 165} A 8 8 0 0 0 ${startX} ${offsetY + 181} Z`} fill={isDarkMode ? "#fdfdfc" : "#dfe6e9"} />
            <text x={startX + width / 2} y={offsetY + 168} fill="#f5f6fa" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{chip.type}</text>
            <text x={startX + width / 2} y={offsetY + 185} fontSize="11" fill={isDarkMode ? "#c8d6e5" : "#bdc3c7"} fontFamily="monospace" textAnchor="middle">{chip.id}</text>
            
            <foreignObject x={startX} y={offsetY + 150} width={width} height={46}>
              <div 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/react-breadboard-existing-chip', chip.id);
                }}
                style={{ width: '100%', height: '100%', cursor: 'grab' }}
                onMouseEnter={() => showDetails(`Chip: ${chip.id}`, `Type: ${chip.type}\n${lib.name || 'Logic IC'}`)} 
                onMouseLeave={hideDetails}
              />
            </foreignObject>
            
            {/* X-Ray Pin Labels */}
            {xRayMode && Array.from({ length: lib.pins }, (_, i) => i + 1).map((pin) => {
              let label = pin.toString();
              if (pin === lib.pins) label = "VCC";
              if (pin === pinsPerSide) label = "GND";
              
              // Override with custom labels if defined
              if (lib.pinLabels && lib.pinLabels[pin]) {
                label = lib.pinLabels[pin];
              }

              let lx, ly;
              if (pin <= pinsPerSide) {
                // Bottom
                lx = padX + 40 + (chip.col + pin - 1) * 20;
                ly = offsetY + 185;
              } else {
                // Top
                lx = padX + 40 + (chip.col + (lib.pins - pin)) * 20;
                ly = offsetY + 160;
              }
              return (
                <text key={`label-${chip.id}-${pin}`} x={lx} y={ly} fill="#ffdd59" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{label}</text>
              );
            })}
          </g>
        );
      })}
    </>
  );
}
