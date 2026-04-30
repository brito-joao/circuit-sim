'use client';

import React from 'react';

interface BreadboardTooltipProps {
  tooltip: {
    visible: boolean;
    title: string;
    desc: string;
  };
  theme: any;
}

export function BreadboardTooltip({ tooltip, theme }: BreadboardTooltipProps) {
  if (!tooltip.visible) return null;

  return (
    <div
      id="details-box"
      style={{
        position: 'absolute', bottom: '20px', left: '20px',
        background: theme.tooltipBg, padding: '15px', borderRadius: '8px',
        borderLeft: '4px solid #00a8ff', color: theme.tooltipText,
        pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'background 0.3s, color 0.3s'
      }}
    >
      <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#00a8ff' }}>{tooltip.title}</h3>
      {tooltip.desc.split('\n').map((line, i) => (
        <p style={{ margin: 0, fontSize: '12px' }} key={`tooltip-line-${i}`}>{line}</p>
      ))}
    </div>
  );
}
