import React, { useEffect, useState, useRef } from 'react';
import { CircuitData, PinStates } from '@/lib/types';

interface LogicAnalyzerProps {
  simData: CircuitData;
  pinStates: PinStates;
  isDarkMode: boolean;
  isRunning: boolean;
}

export function LogicAnalyzer({ simData, pinStates, isDarkMode, isRunning }: LogicAnalyzerProps) {
  const [history, setHistory] = useState<PinStates[]>([]);
  const MAX_TICKS = 100;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Sample every 100ms
    timerRef.current = setInterval(() => {
      setHistory(prev => {
        const next = [...prev, { ...pinStates }];
        if (next.length > MAX_TICKS) return next.slice(next.length - MAX_TICKS);
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, pinStates]);

  const targets = [
    ...(simData.inputs?.map(i => i.id) || []),
    ...(simData.outputs?.map(o => o.id) || [])
  ];

  if (targets.length === 0) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: isDarkMode ? '#222f3e' : '#f5f6fa',
      borderTop: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '8px 15px', fontWeight: 'bold', background: isDarkMode ? '#2d3436' : '#e1e5ea', color: isDarkMode ? '#f5f6fa' : '#2d3436', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Logic Analyzer Timeline</span>
        <button onClick={() => setHistory([])} style={{ background: 'transparent', border: 'none', color: '#0984e3', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Clear</button>
      </div>
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'auto' }}>
        <svg width={Math.max(800, MAX_TICKS * 5 + 50)} height={Math.max(100, targets.length * 40)}>
          {targets.map((target, idx) => {
            const yOffset = idx * 40 + 25;
            
            // Build square wave path
            let pathD = '';
            let currentVal = -1;
            
            history.forEach((state, tick) => {
              const val = state[target] === 1 ? 0 : 1; // 0 is top (HIGH), 1 is bottom (LOW)
              const px = 50 + tick * 5;
              const py = yOffset - (val === 0 ? 15 : 0);
              
              if (tick === 0) {
                pathD += `M ${px} ${py}`;
                currentVal = val;
              } else {
                if (val !== currentVal) {
                  // Draw vertical transition line
                  pathD += ` L ${px} ${yOffset - (currentVal === 0 ? 15 : 0)}`;
                  currentVal = val;
                }
                pathD += ` L ${px} ${py}`;
              }
            });

            return (
              <g key={`timeline-${target}`}>
                <text x="5" y={yOffset} fill={isDarkMode ? '#c8d6e5' : '#636e72'} fontSize="11" fontFamily="monospace" fontWeight="bold">{target}</text>
                <line x1="45" y1={yOffset} x2="100%" y2={yOffset} stroke={isDarkMode ? '#576574' : '#dfe6e9'} strokeWidth="1" strokeDasharray="2,2" />
                <line x1="45" y1={yOffset - 15} x2="100%" y2={yOffset - 15} stroke={isDarkMode ? '#576574' : '#dfe6e9'} strokeWidth="1" strokeDasharray="2,2" />
                {pathD && <path d={pathD} fill="none" stroke="#00b894" strokeWidth="2" />}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
