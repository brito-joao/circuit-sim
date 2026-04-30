import React from 'react';
import { CircuitData } from '@/lib/types';

interface WaveformsOverlayProps {
  simData: CircuitData;
  isDarkMode: boolean;
}

export function WaveformsOverlay({ simData, isDarkMode }: WaveformsOverlayProps) {
  if (!simData.inputs || simData.inputs.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: '20px',
      bottom: '20px',
      background: isDarkMode ? 'rgba(47, 54, 64, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      color: isDarkMode ? '#f5f6fa' : '#2d3436',
      padding: '15px',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 500,
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Waveforms Setup Guide</h3>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {simData.inputs.map((inp, idx) => {
          let instruction = `Set DIO ${idx} to Switches -> Switch`;
          if (inp.label.toLowerCase().includes('clock') || inp.id.toLowerCase().includes('clk')) {
            instruction = `Set DIO ${idx} to Generator -> Clock -> 1kHz`;
          }
          return (
            <li key={`wave-${inp.id}`} style={{ marginBottom: '5px' }}>
              <strong>{inp.label}:</strong> {instruction}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
