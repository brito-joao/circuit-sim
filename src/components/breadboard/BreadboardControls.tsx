'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';

interface BreadboardControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  theme: any;
  xRayMode: boolean;
  setXRayMode: (val: boolean) => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  debugMode: boolean;
  onToggleDebugMode: () => void;
  onExecuteTick: () => void;
}

export function BreadboardControls({
  zoomIn, zoomOut, resetZoom, toggleTheme,
  isDarkMode, theme, xRayMode, setXRayMode,
  editMode, onToggleEditMode,
  debugMode, onToggleDebugMode, onExecuteTick,
}: BreadboardControlsProps) {
  const { t } = useI18n();

  const divider = (
    <div style={{ width: '1px', height: '24px', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
  );

  return (
    <div
      data-tour="breadboard-controls"
      style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
        background: isDarkMode ? 'rgba(34,47,62,0.75)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '8px 18px', borderRadius: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        alignItems: 'center',
      }}
    >
      <button onClick={zoomIn}  style={{ ...btn, color: theme.panelIcon }}>{t.btnZoomIn}</button>
      <button onClick={zoomOut} style={{ ...btn, color: theme.panelIcon }}>{t.btnZoomOut}</button>
      <button onClick={resetZoom} style={{ ...btn, color: theme.panelIcon, fontSize: '12px', width: 'auto', padding: '0 10px' }}>
        {t.btnReset}
      </button>

      {divider}

      <button onClick={toggleTheme} style={{ ...btn, color: theme.panelIcon, fontSize: '16px' }}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {divider}

      <button
        data-tour="xray-btn"
        onClick={() => setXRayMode(!xRayMode)}
        style={{ ...btn, color: xRayMode ? '#00b894' : theme.panelIcon, fontSize: '13px', width: 'auto', padding: '0 10px', background: xRayMode ? 'rgba(0,184,148,0.15)' : 'transparent' }}
      >
        {xRayMode ? t.btnXRayOn : t.btnXRayOff}
      </button>

      {divider}

      <button
        onClick={onToggleEditMode}
        style={{ ...btn, color: editMode ? '#0984e3' : theme.panelIcon, fontSize: '13px', width: 'auto', padding: '0 10px', background: editMode ? 'rgba(9,132,227,0.15)' : 'transparent' }}
      >
        {editMode ? t.btnEditOn : t.btnEditOff}
      </button>

      {divider}

      {/* Debug Mode */}
      <button
        data-tour="debug-btn"
        onClick={onToggleDebugMode}
        title="Pause auto-tick and step through one evaluation at a time"
        style={{ ...btn, color: debugMode ? '#e17055' : theme.panelIcon, fontSize: '13px', width: 'auto', padding: '0 10px', background: debugMode ? 'rgba(225,112,85,0.15)' : 'transparent' }}
      >
        {debugMode ? t.btnDebugOn : t.btnDebugOff}
      </button>

      {debugMode && (
        <button
          onClick={onExecuteTick}
          style={{
            ...btn, width: 'auto', padding: '0 14px', fontSize: '13px',
            background: '#6c5ce7', color: 'white', borderRadius: '14px',
            boxShadow: '0 2px 8px rgba(108,92,231,0.4)',
            animation: 'debugPulse 1.5s infinite',
          }}
        >
          {t.btnExecuteTick}
        </button>
      )}

      <style>{`
        @keyframes debugPulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(108,92,231,0.4); }
          50%       { box-shadow: 0 4px 16px rgba(108,92,231,0.7); }
        }
      `}</style>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: 'transparent', border: 'none', borderRadius: '16px',
  width: '32px', height: '32px', fontSize: '18px', fontWeight: 'bold',
  cursor: 'pointer', display: 'flex', justifyContent: 'center',
  alignItems: 'center', transition: 'background 0.15s',
};
