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
  componentDefinitions?: Record<string, any>;
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
  customComponents,
  componentDefinitions,
}: BreadboardChipsProps) {
  if (!chips) return null;

  // Resolve a lib entry using same priority chain as the engine
  const resolveLib = (type: string) => {
    if (componentDefinitions?.[type]) {
      const def = componentDefinitions[type];
      return { name: def.name || type, pins: def.pins, pinLabels: def.pinLabels || {}, category: 'Inline' };
    }
    if (customComponents) {
      const cc = customComponents.find(c => c.type === type);
      if (cc) return { name: cc.name || type, pins: cc.pins, pinLabels: cc.pinLabels || {}, category: 'Custom' };
    }
    return ComponentLibrary[type] || { name: type, pins: 14, pinLabels: {}, category: 'Unknown' };
  };

  // Font size scales down for larger packages
  const labelFontSize = (totalPins: number): number => {
    if (totalPins >= 24) return 7;
    if (totalPins >= 16) return 8;
    return 9;
  };

  return (
    <>
      {chips.map(chip => {
        const lib         = resolveLib(chip.type);
        const pinsPerSide = lib.pins / 2;
        const offsetY     = padY + (chip.board || 0) * boardHeight;
        const startX      = padX + 40 + chip.col * 20 - 10;
        const width       = pinsPerSide * 20;
        const fontSize    = labelFontSize(lib.pins);

        const pinMarkers = [];
        for (let i = 0; i < pinsPerSide; i++) {
          const cx = padX + 40 + (chip.col + i) * 20;
          pinMarkers.push(<rect key={`pin-t-${chip.id}-${i}`} x={cx - 4} y={offsetY + 146} width={8} height={10} fill="#555" rx="1" />);
          pinMarkers.push(<rect key={`pin-b-${chip.id}-${i}`} x={cx - 4} y={offsetY + 190} width={8} height={10} fill="#555" rx="1" />);
        }

        const fillBody = xRayMode ? 'rgba(34, 47, 62, 0.4)' : theme.chipBody;
        const strokeBody = theme.chipStroke || '#1e272e';

        return (
          <g key={`chip-${chip.id}`}>
            {pinMarkers}
            <rect
              className="ic-body"
              x={startX} y={offsetY + 150} width={width} height={46}
              fill={fillBody} stroke={strokeBody} strokeWidth="2" rx="4" ry="4"
              onMouseEnter={() => showDetails(`Chip: ${chip.id}`, `Type: ${chip.type} — ${lib.name}`)}
              onMouseLeave={hideDetails}
            />
            <path
              className="ic-notch"
              d={`M ${startX} ${offsetY + 165} A 8 8 0 0 0 ${startX} ${offsetY + 181} Z`}
              fill={isDarkMode ? '#fdfdfc' : '#dfe6e9'}
            />
            <text x={startX + width / 2} y={offsetY + 168} fill="#f5f6fa" fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {chip.type}
            </text>
            <text x={startX + width / 2} y={offsetY + 185} fontSize="11" fill={isDarkMode ? '#c8d6e5' : '#bdc3c7'} fontFamily="monospace" textAnchor="middle">
              {chip.id}
            </text>

            {/* Draggable overlay */}
            <foreignObject x={startX} y={offsetY + 150} width={width} height={46}>
              <div
                draggable
                onDragStart={e => e.dataTransfer.setData('application/react-breadboard-existing-chip', chip.id)}
                style={{ width: '100%', height: '100%', cursor: 'grab' }}
                onMouseEnter={() => showDetails(`Chip: ${chip.id}`, `Type: ${chip.type} — ${lib.name}`)}
                onMouseLeave={hideDetails}
              />
            </foreignObject>

            {/* === DYNAMIC X-RAY PIN LABELS === */}
            {xRayMode && Array.from({ length: lib.pins }, (_, i) => i + 1).map(pin => {
              // Single source of truth: pinLabels from definition, fallback to pin number
              const label = (lib.pinLabels && lib.pinLabels[pin]) ? lib.pinLabels[pin] : String(pin);

              let lx: number, ly: number;
              if (pin <= pinsPerSide) {
                // Bottom row
                lx = padX + 40 + (chip.col + pin - 1) * 20;
                ly = offsetY + 207;
              } else {
                // Top row (count from right)
                lx = padX + 40 + (chip.col + (lib.pins - pin)) * 20;
                ly = offsetY + 142;
              }

              // Color-code VCC/GND/CLK labels for quick visual recognition
              const isVCC = label.toUpperCase().includes('VCC') || label.toUpperCase().includes('VDD');
              const isGND = label.toUpperCase().includes('GND') || label.toUpperCase().includes('VSS');
              const isCLK = label.toUpperCase().includes('CLK');
              const labelColor = isVCC ? '#e84118' : isGND ? '#74b9ff' : isCLK ? '#fdcb6e' : '#ffdd59';

              return (
                <text
                  key={`label-${chip.id}-${pin}`}
                  x={lx} y={ly}
                  fill={labelColor}
                  fontSize={fontSize}
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}
          </g>
        );
      })}
    </>
  );
}
