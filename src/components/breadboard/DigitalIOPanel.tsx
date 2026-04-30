import React from 'react';
import { CircuitData, PinStates } from '@/lib/types';

interface DigitalIOPanelProps {
  simData: CircuitData;
  pinStates: PinStates;
  isDarkMode: boolean;
  onWireChange: (newSimData: CircuitData) => void;
  onInputClick: (inputId: string) => void;
}

export function DigitalIOPanel({ simData, pinStates, isDarkMode, onWireChange, onInputClick }: DigitalIOPanelProps) {
  const bg = isDarkMode ? '#222f3e' : '#f5f6fa';
  const color = isDarkMode ? '#f5f6fa' : '#2d3436';
  const borderColor = isDarkMode ? '#576574' : '#dfe6e9';

  const updateChannel = (id: string, newMode: 'none' | 'input' | 'output', newLabel: string) => {
    const newSimData = { ...simData };

    // Remove from both first
    if (newSimData.inputs) newSimData.inputs = newSimData.inputs.filter(i => i.id !== id);
    if (newSimData.outputs) newSimData.outputs = newSimData.outputs.filter(o => o.id !== id);

    if (newMode === 'input') {
      const idx = parseInt(id.split('_')[1]) || 0;
      newSimData.inputs = [...(newSimData.inputs || []), { id, label: newLabel, state: 0, board: 0, col: 5 + idx * 4 }];
      newSimData.wires = [...(newSimData.wires || []), { id: `w_${id}`, from: id, to: `B0_C${5 + idx * 4}_T_0`, color: '#00cec9' }];
    } else if (newMode === 'output') {
      const idx = parseInt(id.split('_')[1]) || 0;
      newSimData.outputs = [...(newSimData.outputs || []), { id, label: newLabel, board: 0, col: 5 + idx * 4 }];
      newSimData.wires = [...(newSimData.wires || []), { id: `w_${id}`, from: `B0_C${5 + idx * 4}_B_0`, to: id, color: '#e1b12c' }];
    }

    onWireChange(newSimData);
  };

  return (
    <div style={{ width: '100%', height: '100%', background: bg, color, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 15px', fontWeight: 'bold', borderBottom: `1px solid ${borderColor}`, background: isDarkMode ? '#2d3436' : '#e1e5ea', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span>I/O Channels (Static I/O)</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflowX: 'auto', padding: '10px', gap: '8px' }}>
        {(() => {
          const allIds = new Set<string>();
          simData.inputs?.forEach(i => allIds.add(i.id));
          simData.outputs?.forEach(o => allIds.add(o.id));
          for (let i = 0; i < 8; i++) allIds.add(`DIO_${i}`);

          return Array.from(allIds).map((id, idx) => {
            const inp = simData.inputs?.find(i => i.id === id);
            const outp = simData.outputs?.find(o => o.id === id);

            const mode = inp ? 'input' : outp ? 'output' : 'none';
            const label = inp?.label || outp?.label || `Channel ${idx}`;
            const state = pinStates[id] || 0;

            return (
              <div key={id} style={{
                minWidth: '130px',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                background: isDarkMode ? '#2f3640' : '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontWeight: 'bold', color: '#0984e3', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{id}</div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <select
                    value={mode}
                    onChange={(e) => updateChannel(id, e.target.value as any, label)}
                    style={{ width: '100%', padding: '2px', borderRadius: '4px', border: `1px solid ${borderColor}`, background: isDarkMode ? '#222f3e' : '#fff', color, fontSize: '11px' }}
                  >
                    <option value="none">None</option>
                    <option value="input">Button (In)</option>
                    <option value="output">LED (Out)</option>
                  </select>

                  <input
                    type="text"
                    value={label}
                    onChange={(e) => updateChannel(id, mode, e.target.value)}
                    placeholder="Label"
                    disabled={mode === 'none'}
                    style={{ width: '100%', padding: '2px', borderRadius: '4px', border: `1px solid ${borderColor}`, background: isDarkMode ? '#222f3e' : '#fff', color, fontSize: '11px' }}
                  />
                </div>

                <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                  {mode === 'none' && <div style={{ color: borderColor, fontSize: '10px' }}>Off</div>}
                  {mode === 'input' && (
                    <button
                      onMouseDown={() => onInputClick(id)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: state ? '#d63031' : '#b2bec3',
                        boxShadow: state ? '0 0 10px #d63031' : 'inset 0 4px 6px rgba(0,0,0,0.2)',
                        transition: 'all 0.1s'
                      }}
                    />
                  )}
                  {mode === 'output' && (
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: state ? '#00b894' : '#2d3436',
                      boxShadow: state ? '0 0 15px #00b894' : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                      border: `2px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`,
                      transition: 'all 0.1s'
                    }} />
                  )}
                </div>

              </div>
            );
          }); // <-- THIS WAS THE MISSING BRACE/PARENTHESIS
        })()}
      </div>
    </div>
  );
}