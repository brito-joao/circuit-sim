import React, { useState } from 'react';
import { ComponentLibrary } from '@/lib/componentLibrary';

interface ComponentPaletteProps {
  isDarkMode: boolean;
}

export function ComponentPalette({ isDarkMode }: ComponentPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    '74-Series TTL',
    '4000-Series CMOS',
    'Passives & ICs',
    'Passives',
    'Outputs'
  ];

  const handleDragStart = (e: React.DragEvent, type: string, pins: number) => {
    e.dataTransfer.setData('application/react-breadboard-component', type);
    e.dataTransfer.effectAllowed = 'copy';

    // Create a ghost drag image
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.background = '#2d3436';
    ghost.style.color = '#f5f6fa';
    ghost.style.padding = '10px 20px';
    ghost.style.borderRadius = '4px';
    ghost.style.fontFamily = 'monospace';
    ghost.style.fontWeight = 'bold';
    ghost.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    ghost.innerHTML = `[==== ${type} ====]`;
    document.body.appendChild(ghost);
    
    e.dataTransfer.setDragImage(ghost, 20, 20);

    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: isDarkMode ? '#2d3436' : '#f5f6fa',
      color: isDarkMode ? '#f5f6fa' : '#2d3436',
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`, background: isDarkMode ? '#222f3e' : '#e1e5ea' }}>
        Component Library
      </div>
      <div style={{ padding: '10px' }}>
        <input 
          type="text" 
          placeholder="Search components..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${isDarkMode ? '#576574' : '#b2bec3'}`, background: isDarkMode ? '#2f3640' : '#ffffff', color: isDarkMode ? 'white' : 'black' }}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {categories.map(cat => {
          const comps = Object.entries(ComponentLibrary).filter(([type, def]) => 
            def.category === cat && (type.toLowerCase().includes(searchTerm.toLowerCase()) || def.name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          if (comps.length === 0) return null;
          
          return (
            <div key={cat} style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0984e3', textTransform: 'uppercase' }}>{cat}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {comps.map(([type, def]) => (
                  <div 
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type, def.pins)}
                    style={{
                      background: isDarkMode ? '#2f3640' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`,
                      padding: '8px',
                      borderRadius: '4px',
                      cursor: 'grab',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <strong style={{ fontSize: '14px' }}>{type}</strong>
                    <span style={{ color: isDarkMode ? '#b2bec3' : '#636e72' }}>{def.name} ({def.pins} pins)</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
