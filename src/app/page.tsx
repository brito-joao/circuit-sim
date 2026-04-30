'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import JsonEditor from '@/components/JsonEditor';
import Breadboard from '@/components/Breadboard';
import { ComponentPalette } from '@/components/breadboard/ComponentPalette';
import { DigitalIOPanel } from '@/components/breadboard/DigitalIOPanel';
import { useSimulation } from '@/hooks/useSimulation';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

type MobileTab = 'board' | 'io' | 'json';

export default function Home() {
  const {
    simData, pinStates, isRunning, compileError,
    debugMode, changedPins,
    compileCircuit, toggleSimulation, toggleDebugMode, executeTick,
    toggleInputState, defaultJSON,
  } = useSimulation();

  const [jsonCode, setJsonCode] = useState(JSON.stringify(defaultJSON, null, 2));
  const [editMode,    setEditMode]    = useState(false);
  const [mobileTab,   setMobileTab]   = useState<MobileTab>('board');
  const [clipboardMsg, setClipboardMsg] = useState('');
  const isMobile = useIsMobile();

  const handleJsonChange = useCallback((value: string) => {
    setJsonCode(value);
    compileCircuit(value);
  }, [compileCircuit]);

  const handleWireChange = useCallback((newSimData: any) => {
    const newJson = JSON.stringify(newSimData, null, 2);
    setJsonCode(newJson);
    compileCircuit(newJson);
  }, [compileCircuit]);

  const handleCompile = useCallback(() => { compileCircuit(jsonCode); }, [compileCircuit, jsonCode]);

  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonCode);
      setClipboardMsg('✅ Copied!');
    } catch {
      const el = document.createElement('textarea');
      el.value = jsonCode; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      setClipboardMsg('✅ Copied!');
    }
    setTimeout(() => setClipboardMsg(''), 2000);
  }, [jsonCode]);

  const handlePasteJson = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleJsonChange(text);
      setClipboardMsg('📋 Pasted!');
    } catch {
      setClipboardMsg('⚠️ Paste denied — use the editor directly');
    }
    setTimeout(() => setClipboardMsg(''), 2500);
  }, [handleJsonChange]);

  const breadboardProps = {
    simData, pinStates, isRunning, jsonCode, editMode, debugMode, changedPins,
    onInputClick: toggleInputState,
    onWireChange: handleWireChange,
    onToggleEditMode: () => setEditMode(e => !e),
    onToggleDebugMode: toggleDebugMode,
    onExecuteTick: executeTick,
  };

  // ===================== MOBILE =====================
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#f0f2f5' }}>
        <Header isRunning={isRunning} onToggleSimulation={toggleSimulation} onCompile={handleCompile} compileError={compileError} />

        <div style={{ display: 'flex', background: '#1e272e', borderBottom: '1px solid #2d3436', flexShrink: 0 }}>
          {(['board', 'io', 'json'] as MobileTab[]).map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)} style={{
              flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '12px', textTransform: 'uppercase',
              background: mobileTab === tab ? '#6c5ce7' : 'transparent',
              color: mobileTab === tab ? '#fff' : '#b2bec3',
              borderBottom: mobileTab === tab ? '2px solid #a29bfe' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {tab === 'board' ? '🔌 Board' : tab === 'io' ? '⚡ I/O' : '📄 JSON'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {mobileTab === 'board' && <Breadboard {...breadboardProps} />}

          {mobileTab === 'io' && (
            <div style={{ height: '100%', overflow: 'auto', background: '#f0f2f5' }} data-tour="io-panel">
              <DigitalIOPanel simData={simData} pinStates={pinStates} isDarkMode={false} onWireChange={handleWireChange} onInputClick={toggleInputState} />
            </div>
          )}

          {mobileTab === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} data-tour="json-editor">
              {/* BIG PASTE BUTTON — main action */}
              <button
                data-tour="paste-from-ai"
                onClick={handlePasteJson}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '20px',
                  background: 'linear-gradient(90deg, #00b894, #00cec9)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  fontSize: '17px', fontWeight: 800, flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(0,184,148,0.4)',
                }}
              >
                <span style={{ fontSize: '22px' }}>📥</span>
                <span>COLAR DA IA</span>
              </button>
              {/* Compact secondary bar */}
              <div style={{ padding: '8px 12px', background: '#2d3436', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: '#b2bec3', flex: 1 }}>JSON</span>
                {clipboardMsg && <span style={{ fontSize: '12px', color: '#00b894', fontWeight: 700 }}>{clipboardMsg}</span>}
                <button onClick={handleCopyJson} style={{ background: 'rgba(0,184,148,0.2)', color: '#55efc4', border: 'none', padding: '5px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                  📋 Copiar
                </button>
              </div>
              <textarea
                value={jsonCode}
                onChange={e => handleJsonChange(e.target.value)}
                spellCheck={false} autoCorrect="off" autoCapitalize="off"
                style={{ flex: 1, background: '#1e272e', color: '#a29bfe', fontFamily: 'monospace', fontSize: '13px', border: 'none', padding: '14px', resize: 'none', outline: 'none', lineHeight: 1.6 }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== DESKTOP =====================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header isRunning={isRunning} onToggleSimulation={toggleSimulation} onCompile={handleCompile} compileError={compileError} />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup orientation="horizontal">

          {editMode && (
            <>
              <Panel defaultSize={20} minSize={15}>
                <ComponentPalette isDarkMode={false} />
              </Panel>
              <PanelResizeHandle style={{ width: '4px', background: '#dfe6e9', cursor: 'col-resize' }} />
            </>
          )}

          <Panel defaultSize={editMode ? 50 : 65} minSize={30}>
            <PanelGroup orientation="vertical">
              <Panel defaultSize={75} minSize={40}>
                <Breadboard {...breadboardProps} />
              </Panel>
              <PanelResizeHandle style={{ height: '4px', background: '#dfe6e9', cursor: 'row-resize' }} />
              <Panel defaultSize={25} minSize={10}>
                <div data-tour="io-panel" style={{ height: '100%' }}>
                  <DigitalIOPanel simData={simData} pinStates={pinStates} isDarkMode={false} onWireChange={handleWireChange} onInputClick={toggleInputState} />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle style={{ width: '4px', background: '#dfe6e9', cursor: 'col-resize' }} />

          <Panel defaultSize={editMode ? 30 : 35} minSize={20}>
            <div data-tour="json-editor" style={{ height: '100%' }}>
              <JsonEditor code={jsonCode} onChange={handleJsonChange} onCopy={handleCopyJson} onPaste={handlePasteJson} clipboardMsg={clipboardMsg} />
            </div>
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );
}
