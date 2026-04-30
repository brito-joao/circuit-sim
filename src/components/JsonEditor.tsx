'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

interface JsonEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export default function JsonEditor({ code, onChange }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    try {
      JSON.parse(value);
      setError(null);
      onChange(value);
    } catch (e: any) {
      setError(e.message);
      // We don't call onChange if invalid so we don't crash the simulator
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(code);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setError(null);
    } catch (e: any) {
      setError('Cannot format invalid JSON.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('JSON copied to clipboard!');
  };

  return (
    <div className="code-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div className="code-header" style={{ padding: '10px', background: '#2d3436', color: '#f5f6fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Circuit Blueprint (JSON)</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleFormat} style={{ background: '#0984e3', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Auto-Format
          </button>
          <button onClick={handleCopy} style={{ background: '#00b894', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Copy JSON
          </button>
        </div>
      </div>
      {error && (
        <div style={{ background: '#d63031', color: 'white', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>
          Invalid JSON: {error}
        </div>
      )}
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
}
