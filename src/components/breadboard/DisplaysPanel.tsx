'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CircuitData, PinStates, VisualElement } from '@/lib/types';

interface DisplaysPanelProps {
  simData: CircuitData;
  pinStates: PinStates;
  isDarkMode: boolean;
  onClose: () => void;
}

// ─── Render a single VisualElement primitive ──────────────────────────────────
function renderElement(
  el: VisualElement,
  chipId: string,
  idx: number,
  pinStates: PinStates,
) {
  // Resolve fill: bindState overrides based on live pin level
  let fill = (el as any).fill ?? '#888';
  if (el.bindState) {
    const live = pinStates[`${chipId}.${el.bindState.pin}`] ?? 0;
    fill = live === 1 ? el.bindState.activeFill : el.bindState.inactiveFill;
  }

  switch (el.type) {
    case 'rect':
      return <rect key={idx} x={el.x} y={el.y} width={el.w} height={el.h} fill={fill} rx={el.rx ?? 0} />;
    case 'circle':
      return <circle key={idx} cx={el.cx} cy={el.cy} r={el.r} fill={fill} />;
    case 'path':
      return <path key={idx} d={el.d} fill={fill} />;
    case 'text':
      return (
        <text
          key={idx}
          x={el.x} y={el.y}
          fill={fill}
          fontSize={el.fontSize ?? 12}
          fontFamily={el.fontFamily ?? 'monospace'}
          textAnchor={(el.textAnchor as any) ?? 'middle'}
        >
          {el.text}
        </text>
      );
    default:
      return null;
  }
}

// ─── Single chip display card ─────────────────────────────────────────────────
function ChipDisplay({
  chip,
  def,
  pinStates,
  isDarkMode,
}: {
  chip: any;
  def: any;
  pinStates: PinStates;
  isDarkMode: boolean;
}) {
  const tmpl = def.visualTemplate!;
  // Render at a generous fixed height so small templates become readable
  const RENDER_HEIGHT = 180;
  const scale = RENDER_HEIGHT / tmpl.height;
  const renderW = tmpl.width * scale;

  const border = isDarkMode ? '#2d3436' : '#e0e4f0';
  const bg     = isDarkMode ? '#1e272e' : '#f8f9fa';
  const nameClr = isDarkMode ? '#b2bec3' : '#636e72';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: bg, borderRadius: '10px', border: `1px solid ${border}`,
      padding: '10px 12px', gap: '6px',
    }}>
      {/* Label */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: nameClr, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
        {chip.id} — {def.name || chip.type}
      </div>

      {/* SVG Display */}
      <svg
        width={renderW}
        height={RENDER_HEIGHT}
        viewBox={`0 0 ${tmpl.width} ${tmpl.height}`}
        style={{ display: 'block', borderRadius: '6px', overflow: 'visible' }}
      >
        {tmpl.elements.map((el: VisualElement, i: number) =>
          renderElement(el, chip.id, i, pinStates)
        )}
      </svg>
    </div>
  );
}

// ─── Main floating panel ──────────────────────────────────────────────────────
export function DisplaysPanel({ simData, pinStates, isDarkMode, onClose }: DisplaysPanelProps) {
  // Collect all chips that have a visualTemplate in componentDefinitions
  const visualChips = (simData.chips ?? []).filter(chip => {
    const def = simData.componentDefinitions?.[chip.type];
    return def?.visualTemplate != null;
  });

  // Don't render the panel at all if nothing to show
  if (visualChips.length === 0) return null;

  // ─── Drag state ────────────────────────────────────────────────────────────
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const onTitleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ─── Styles ────────────────────────────────────────────────────────────────
  const bg     = isDarkMode ? 'rgba(22, 33, 43, 0.97)' : 'rgba(255,255,255,0.97)';
  const border = isDarkMode ? '#2d3436' : '#d0d8e4';
  const titleC = isDarkMode ? '#f5f6fa' : '#1e272e';
  const subC   = isDarkMode ? '#b2bec3' : '#636e72';

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 1000,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
        minWidth: '220px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        userSelect: 'none',
      }}
    >
      {/* ── Title / drag handle ──────────────────────────────────────────── */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'grab',
          borderBottom: `1px solid ${border}`,
          background: isDarkMode ? 'rgba(40,55,70,0.9)' : 'rgba(240,244,255,0.9)',
          borderRadius: '14px 14px 0 0',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: '13px', color: titleC, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🖥️ Monitor de Displays
          </div>
          <div style={{ fontSize: '10px', color: subC, marginTop: '1px' }}>
            {visualChips.length} {visualChips.length === 1 ? 'display' : 'displays'} activo{visualChips.length !== 1 ? 's' : ''} · arrasta para mover
          </div>
        </div>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          style={{
            background: 'rgba(214,48,49,0.15)', border: '1px solid rgba(214,48,49,0.35)',
            color: '#d63031', borderRadius: '6px', width: '26px', height: '26px',
            cursor: 'pointer', fontWeight: 900, fontSize: '14px', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Display grid ────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px',
        padding: '14px',
        justifyContent: visualChips.length === 1 ? 'center' : 'flex-start',
      }}>
        {visualChips.map(chip => {
          const def = simData.componentDefinitions![chip.type];
          return (
            <ChipDisplay
              key={chip.id}
              chip={chip}
              def={def}
              pinStates={pinStates}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </div>
    </div>
  );
}
