'use client';

import React, { useState, useCallback } from 'react';
import { CircuitData } from '@/lib/types';
import { generateTruthTable } from '@/hooks/useSimulation';

interface TestBenchPanelProps {
  simData: CircuitData;
  isDarkMode: boolean;
  jsonCode: string;
}

interface DiffRow {
  inputs: string[];
  expected: string[];
  actual: string[];
  pass: boolean;
  mismatch: boolean[];
}

// Parse a Markdown or CSV truth table string into a 2D array of strings (header + rows)
function parseTable(raw: string): string[][] {
  const lines = raw.trim().split('\n').filter(l => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.match(/^[\|\s\-:]+$/); // skip separator rows
  });
  return lines.map(line => {
    if (line.includes('|')) {
      return line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
    }
    return line.split(',').map(c => c.trim());
  });
}

export function TestBenchPanel({ simData, isDarkMode, jsonCode }: TestBenchPanelProps) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [expectedRaw,  setExpectedRaw]  = useState('');
  const [diffRows,     setDiffRows]     = useState<DiffRow[]>([]);
  const [hasDiff,      setHasDiff]      = useState(false);
  const [passCount,    setPassCount]    = useState(0);
  const [totalCount,   setTotalCount]   = useState(0);
  const [copyDone,     setCopyDone]     = useState(false);

  const bg     = isDarkMode ? 'rgba(30, 39, 46, 0.97)' : 'rgba(255, 255, 255, 0.97)';
  const border = isDarkMode ? '#576574' : '#dfe6e9';
  const text   = isDarkMode ? '#f5f6fa' : '#2d3436';
  const subtle = isDarkMode ? '#636e72' : '#b2bec3';

  const runDiff = useCallback(() => {
    const actualRaw = generateTruthTable(simData);
    const actualRows  = parseTable(actualRaw);
    const expectedRows = parseTable(expectedRaw);

    if (actualRows.length < 2 || expectedRows.length < 2) {
      alert('Could not parse tables. Make sure both have a header row and data rows.');
      return;
    }

    const actualHeader   = actualRows[0];
    const expectedHeader = expectedRows[0];
    const dataActual     = actualRows.slice(1);
    const dataExpected   = expectedRows.slice(1);

    const numInputs = simData.inputs?.length ?? 0;
    const rows: DiffRow[] = [];

    const maxRows = Math.max(dataActual.length, dataExpected.length);
    let passes = 0;

    for (let i = 0; i < maxRows; i++) {
      const actRow = dataActual[i]   ?? [];
      const expRow = dataExpected[i] ?? [];
      const inputCols  = actRow.slice(0, numInputs);
      const actualOuts = actRow.slice(numInputs);
      const expOuts    = expRow.slice(numInputs);

      const mismatch = actualOuts.map((v, j) => v !== expOuts[j]);
      const pass = mismatch.every(m => !m);
      if (pass) passes++;

      rows.push({ inputs: inputCols, expected: expOuts, actual: actualOuts, pass, mismatch });
    }

    setDiffRows(rows);
    setHasDiff(true);
    setPassCount(passes);
    setTotalCount(maxRows);
  }, [simData, expectedRaw]);

  const copyDebugPayload = useCallback(() => {
    const actualTable = generateTruthTable(simData);
    const payload = `[SYSTEM] I am building a digital logic circuit and it is failing.

[EXPECTED TRUTH TABLE]:
${expectedRaw || '(not provided)'}

[ACTUAL TRUTH TABLE]:
${actualTable}

[CURRENT JSON CODE]:
${jsonCode}

[TASK] Please analyze the JSON wire routing and the component definitions. Identify why the actual output deviates from the expected output. Provide the exact corrected JSON "wires" array (and any required "componentDefinitions" changes) to fix this circuit.`;

    navigator.clipboard.writeText(payload).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    });
  }, [simData, expectedRaw, jsonCode]);

  const btn = (label: string, onClick: () => void, bg: string, extraStyle?: React.CSSProperties) => (
    <button
      onClick={onClick}
      style={{
        background: bg, color: 'white', border: 'none', padding: '7px 14px',
        borderRadius: '5px', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
        transition: 'opacity 0.15s', ...extraStyle
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Toggle button — top-left, below the Lab Table button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'absolute', top: '70px', left: '20px', zIndex: 600,
          background: '#6c5ce7', color: 'white', border: 'none', padding: '8px 14px',
          borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
          boxShadow: '0 4px 12px rgba(108,92,231,0.4)',
        }}
      >
        🧪 Test Bench {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '115px', left: '20px', zIndex: 600,
          width: '420px', maxWidth: 'calc(100vw - 40px)', background: bg, border: `1px solid ${border}`,
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#6c5ce7', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>🧪 Automated Test Bench</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Diff Engine v2</span>
          </div>

          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Expected table input */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: subtle, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Paste Expected Truth Table (Markdown or CSV):
              </label>
              <textarea
                value={expectedRaw}
                onChange={e => setExpectedRaw(e.target.value)}
                placeholder={`| A | B | Output |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |`}
                style={{
                  width: '100%', height: '110px', resize: 'vertical', boxSizing: 'border-box',
                  background: isDarkMode ? '#2d3436' : '#f8f9fa', border: `1px solid ${border}`,
                  borderRadius: '5px', padding: '8px', color: text, fontFamily: 'monospace',
                  fontSize: '11px', lineHeight: '1.5',
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {btn('▶ Run Diff', runDiff, '#0984e3')}
              {btn(copyDone ? '✅ Copied!' : '🤖 Copy Debug for AI', copyDebugPayload, '#d63031')}
            </div>

            {/* Results */}
            {hasDiff && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, color: text, fontSize: '13px' }}>
                    Results: {passCount}/{totalCount} rows passing
                  </span>
                  <span style={{ fontSize: '18px' }}>
                    {passCount === totalCount ? '✅' : '❌'}
                  </span>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '5px', border: `1px solid ${border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'monospace' }}>
                    <thead>
                      <tr style={{ background: isDarkMode ? '#2d3436' : '#f1f2f6' }}>
                        <th style={{ padding: '5px 8px', textAlign: 'center', color: subtle }}>Status</th>
                        {simData.inputs?.map(i => (
                          <th key={i.id} style={{ padding: '5px 8px', color: subtle }}>{i.label || i.id}</th>
                        ))}
                        {simData.outputs?.map(o => (
                          <th key={`e-${o.id}`} style={{ padding: '5px 8px', color: '#0984e3' }}>Expected {o.label || o.id}</th>
                        ))}
                        {simData.outputs?.map(o => (
                          <th key={`a-${o.id}`} style={{ padding: '5px 8px', color: '#00b894' }}>Actual {o.label || o.id}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {diffRows.map((row, ri) => (
                        <tr
                          key={ri}
                          style={{ background: row.pass ? 'transparent' : (isDarkMode ? 'rgba(214,48,49,0.15)' : 'rgba(255,118,117,0.1)') }}
                        >
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                            {row.pass ? '✅' : '❌'}
                          </td>
                          {row.inputs.map((v, j) => (
                            <td key={j} style={{ padding: '4px 8px', textAlign: 'center', color: text }}>{v}</td>
                          ))}
                          {row.expected.map((v, j) => (
                            <td key={j} style={{ padding: '4px 8px', textAlign: 'center', color: '#0984e3', fontWeight: 700 }}>{v}</td>
                          ))}
                          {row.actual.map((v, j) => (
                            <td
                              key={j}
                              style={{
                                padding: '4px 8px', textAlign: 'center', fontWeight: 700,
                                color: row.mismatch[j] ? '#d63031' : '#00b894',
                                background: row.mismatch[j] ? (isDarkMode ? 'rgba(214,48,49,0.3)' : 'rgba(255,118,117,0.25)') : 'transparent',
                              }}
                            >
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
