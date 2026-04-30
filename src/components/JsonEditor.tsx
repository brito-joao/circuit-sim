'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useI18n } from '@/lib/i18n';

interface JsonEditorProps {
  code: string;
  onChange: (value: string) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  clipboardMsg?: string;
}

export default function JsonEditor({ code, onChange, onCopy, onPaste, clipboardMsg }: JsonEditorProps) {
  const { t } = useI18n();
  const [pasting, setPasting] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    onChange(value);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(code);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Monaco already shows red squiggles
    }
  };

  const handlePasteClick = async () => {
    setPasting(true);
    await onPaste?.();
    setTimeout(() => setPasting(false), 700);
  };

  return (
    <div className="code-panel" data-tour="json-editor">
      {/* ═══════════════════════════════════════════════════════════
          BIG PASTE BUTTON — This is the main action for beginners.
          Impossible to miss: full-width, animated, high contrast.
      ═══════════════════════════════════════════════════════════ */}
      <button
        data-tour="paste-from-ai"
        onClick={handlePasteClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          padding: '18px 20px',
          background: pasting
            ? 'linear-gradient(90deg, #00b894, #00cec9)'
            : 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '17px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          transition: 'all 0.2s',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(0,184,148,0.45)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle shimmer sweep */}
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
          animation: 'shimmer 2.5s infinite',
          pointerEvents: 'none',
        }} />
        <span style={{ fontSize: '22px' }}>📥</span>
        <span>{pasting ? (clipboardMsg || t.msgPasted) : t.btnPasteFromAI}</span>
        <style>{`
          @keyframes shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </button>

      {/* Sub-hint */}
      <div style={{
        padding: '8px 16px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        fontSize: '11px',
        color: '#868e96',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {t.btnPasteFromAIHint}
      </div>

      {/* Compact secondary toolbar */}
      <div className="code-header" style={{ padding: '8px 12px', borderBottom: '1px solid #2d3436' }}>
        <span style={{ fontWeight: 700, fontSize: '12px', color: '#b2bec3' }}>{t.editorTitle}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {clipboardMsg && (
            <span style={{ fontSize: '11px', color: '#00b894', fontWeight: 700 }}>{clipboardMsg}</span>
          )}
          <button
            onClick={handleFormat}
            style={{ background: 'rgba(9,132,227,0.15)', color: '#74b9ff', border: '1px solid rgba(116,185,255,0.3)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
          >
            {t.btnFormat}
          </button>
          <button
            onClick={onCopy}
            style={{ background: 'rgba(0,184,148,0.15)', color: '#55efc4', border: '1px solid rgba(85,239,196,0.3)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
          >
            {t.btnCopy}
          </button>
        </div>
      </div>

      {/* Monaco editor */}
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
          }}
        />
      </div>
    </div>
  );
}
