'use client';

import React from 'react';

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
}

export function BreadboardControls({
  zoomIn,
  zoomOut,
  resetZoom,
  toggleTheme,
  isDarkMode,
  theme,
  xRayMode,
  setXRayMode,
  editMode,
  onToggleEditMode
}: BreadboardControlsProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'flex',
      gap: '12px',
      background: isDarkMode ? 'rgba(34, 47, 62, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      padding: '8px 16px',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      transition: 'background 0.3s',
      alignItems: 'center'
    }}>
      <button onClick={zoomIn} style={{ ...btnStyle, color: theme.panelIcon }}>+</button>
      <button onClick={zoomOut} style={{ ...btnStyle, color: theme.panelIcon }}>-</button>
      <button onClick={resetZoom} style={{ ...btnStyle, color: theme.panelIcon, fontSize: '12px', padding: '0 10px', width: 'auto' }}>Reset</button>
      
      <div style={{ width: '1px', height: '24px', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}></div>
      
      <button onClick={toggleTheme} style={{ ...btnStyle, color: theme.panelIcon, fontSize: '16px' }}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div style={{ width: '1px', height: '24px', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}></div>

      <button onClick={() => setXRayMode(!xRayMode)} style={{ ...btnStyle, color: xRayMode ? '#00b894' : theme.panelIcon, fontSize: '14px', width: 'auto', padding: '0 10px', background: xRayMode ? 'rgba(0, 184, 148, 0.2)' : 'transparent' }}>
        {xRayMode ? '🔍 X-Ray ON' : '🔍 X-Ray OFF'}
      </button>

      <div style={{ width: '1px', height: '24px', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}></div>

      <button onClick={onToggleEditMode} style={{ ...btnStyle, color: editMode ? '#0984e3' : theme.panelIcon, fontSize: '14px', width: 'auto', padding: '0 10px', background: editMode ? 'rgba(9, 132, 227, 0.2)' : 'transparent' }}>
        {editMode ? '✏️ Edit Mode ON' : '✏️ Edit Mode OFF'}
      </button>
    </div>
  );
}

// UI Styles for Zoom & Theme Buttons
const btnStyle = {
  background: 'transparent',
  border: 'none',
  borderRadius: '16px',
  width: '32px',
  height: '32px',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background 0.2s, transform 0.1s',
};
