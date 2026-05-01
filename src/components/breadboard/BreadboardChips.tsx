'use client';

import React from 'react';
import { ComponentLibrary } from '@/lib/componentLibrary';
import { PinStates, VisualElement } from '@/lib/types';

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
  /** Live pin states from the simulation engine — required for visualTemplate binding */
  pinStates?: PinStates;
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
  pinStates = {},
}: BreadboardChipsProps) {
  if (!chips) return null;

  // Resolve a lib entry using same priority chain as the engine
  const resolveLib = (type: string) => {
    if (componentDefinitions?.[type]) {
      const def = componentDefinitions[type];
      return {
        name: def.name || type,
        pins: def.pins,
        pinLabels: def.pinLabels || {},
        category: 'Inline',
        visualTemplate: def.visualTemplate ?? null,
      };
    }
    if (customComponents) {
      const cc = customComponents.find(c => c.type === type);
      if (cc) return { name: cc.name || type, pins: cc.pins, pinLabels: cc.pinLabels || {}, category: 'Custom', visualTemplate: null };
    }
    return { ...ComponentLibrary[type] || { name: type, pins: 14, pinLabels: {}, category: 'Unknown' }, visualTemplate: null };
  };

  // Get the simulated logic level (0 or 1) for a specific pin on a chip
  const getPinState = (chipId: string, pin: number): number => {
    return pinStates[`${chipId}.${pin}`] ?? 0;
  };

  // Font size scales down for larger packages
  const labelFontSize = (totalPins: number): number => {
    if (totalPins >= 24) return 7;
    if (totalPins >= 16) return 8;
    return 9;
  };

  // ─── Schema-Driven Visual Template Renderer ────────────────────────────────
  // Renders an array of VisualElement primitives (rect/circle/path/text) as SVG
  // nodes. Elements with a `bindState` switch their fill colour based on the
  // live pin state read from pinStates.
  const renderVisualTemplate = (
    chipId: string,
    template: NonNullable<ReturnType<typeof resolveLib>['visualTemplate']>,
    originX: number,
    originY: number,
  ) => {
    return template.elements.map((el: VisualElement, i: number) => {
      // Resolve fill: bindState overrides el.fill based on live pin logic level
      let fill = (el as any).fill ?? '#888888';
      if (el.bindState) {
        const isHigh = getPinState(chipId, el.bindState.pin) === 1;
        fill = isHigh ? el.bindState.activeFill : el.bindState.inactiveFill;
      }

      if (el.type === 'rect') {
        return (
          <rect
            key={`vt-${chipId}-${i}`}
            x={originX + el.x} y={originY + el.y}
            width={el.w} height={el.h}
            fill={fill} rx={el.rx ?? 0}
          />
        );
      }

      if (el.type === 'circle') {
        return (
          <circle
            key={`vt-${chipId}-${i}`}
            cx={originX + el.cx} cy={originY + el.cy}
            r={el.r} fill={fill}
          />
        );
      }

      if (el.type === 'path') {
        // SVG path `d` coordinates are absolute in the template's own space,
        // so we wrap in a <g transform="translate(...)"> to place them on-board.
        return (
          <g key={`vt-${chipId}-${i}`} transform={`translate(${originX},${originY})`}>
            <path d={el.d} fill={fill} />
          </g>
        );
      }

      if (el.type === 'text') {
        return (
          <text
            key={`vt-${chipId}-${i}`}
            x={originX + el.x} y={originY + el.y}
            fill={fill}
            fontSize={el.fontSize ?? 12}
            fontFamily={el.fontFamily ?? 'monospace'}
            textAnchor={(el.textAnchor as any) ?? 'middle'}
          >
            {el.text}
          </text>
        );
      }

      return null;
    });
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

        const fillBody   = xRayMode ? 'rgba(34, 47, 62, 0.4)' : theme.chipBody;
        const strokeBody = theme.chipStroke || '#1e272e';

        // ── Decide rendering mode ─────────────────────────────────────────────
        // If a visualTemplate is defined, render the custom SVG panel
        // centred over the chip's physical footprint on the breadboard.
        // The standard black DIP rectangle is NOT drawn in this case.
        const hasVisualTemplate = lib.visualTemplate !== null;

        return (
          <g key={`chip-${chip.id}`}>
            {pinMarkers}

            {hasVisualTemplate ? (
              // ── Custom Visual Template ──────────────────────────────────────
              // The template is drawn in a <g> anchored to the chip's top-left.
              // We vertically centre the template between the two pin rows
              // (offsetY+150 → offsetY+200 is the DIP body zone — 50px tall).
              (() => {
                const tmpl = lib.visualTemplate!;
                // Scale the template so it fits between the two pin rows.
                // The DIP body zone is 46 px tall (offsetY+150 to offsetY+196).
                // We place the template so it is centred in that zone.
                const bodyH = 46;
                const bodyW = width;
                const scaleX = bodyW / tmpl.width;
                const scaleY = bodyH / tmpl.height;
                const scale  = Math.min(scaleX, scaleY, 1); // never upscale

                const renderW = tmpl.width  * scale;
                const renderH = tmpl.height * scale;
                const ox = startX + (bodyW - renderW) / 2;
                const oy = offsetY + 150 + (bodyH - renderH) / 2;

                return (
                  <g
                    transform={`translate(${ox},${oy}) scale(${scale})`}
                    onMouseEnter={() => showDetails(`Chip: ${chip.id}`, `Type: ${chip.type} — ${lib.name}`)}
                    onMouseLeave={hideDetails}
                  >
                    {renderVisualTemplate(chip.id, tmpl, 0, 0)}
                  </g>
                );
              })()
            ) : (
              // ── Standard DIP Body ───────────────────────────────────────────
              <>
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
              </>
            )}

            {/* Draggable overlay — always present regardless of render mode */}
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
              const label = (lib.pinLabels && lib.pinLabels[pin]) ? lib.pinLabels[pin] : String(pin);

              let lx: number, ly: number;
              if (pin <= pinsPerSide) {
                lx = padX + 40 + (chip.col + pin - 1) * 20;
                ly = offsetY + 207;
              } else {
                lx = padX + 40 + (chip.col + (lib.pins - pin)) * 20;
                ly = offsetY + 142;
              }

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
