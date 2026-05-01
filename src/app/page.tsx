'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import JsonEditor from '@/components/JsonEditor';
import Breadboard from '@/components/Breadboard';
import { ComponentPalette } from '@/components/breadboard/ComponentPalette';
import { DigitalIOPanel } from '@/components/breadboard/DigitalIOPanel';
import { useSimulation } from '@/hooks/useSimulation';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { OnboardingTour } from '@/components/OnboardingTour';
import { getAIPrompt } from '@/lib/aiPrompt';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
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
  const [tourOpen,    setTourOpen]    = useState(false);
  const isMobile = useIsMobile();

  // Prevent hydration mismatch by waiting for the client to mount and determine device type
  if (isMobile === null) return null;

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

  const handleCopyAIPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getAIPrompt());
      setClipboardMsg('🤖 Prompt Copied!');
    } catch {
      const el = document.createElement('textarea');
      el.value = getAIPrompt(); el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      setClipboardMsg('🤖 Prompt Copied!');
    }
    setTimeout(() => setClipboardMsg(''), 2000);
  }, []);

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
    const tabDef = [
      { id: 'board', label: '🔌', title: 'Placa' },
      { id: 'json',  label: '📥', title: 'Colar IA' },
      { id: 'io',    label: '⚡', title: 'E/S' },
    ] as const;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', overflow: 'hidden',
        background: '#0f1923',
      }}>

        {/* ── Lean mobile header ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', flexShrink: 0,
          background: '#1e272e',
          borderBottom: '2px solid #6c5ce7',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff', letterSpacing: '0.3px' }}>
            ⚡ CircuitSim
          </span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Status pill */}
            {compileError
              ? <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(214,48,49,0.25)', color: '#ff7675', fontWeight: 700 }}>Erro</span>
              : isRunning
              ? <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0,184,148,0.25)', color: '#55efc4', fontWeight: 700 }}>Simulando</span>
              : null
            }

            {/* Run / Stop */}
            <button
              onClick={toggleSimulation}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '13px',
                background: isRunning ? '#d63031' : '#00b894',
                color: '#fff',
                boxShadow: isRunning ? '0 0 12px rgba(214,48,49,0.4)' : '0 0 12px rgba(0,184,148,0.4)',
              }}
            >
              {isRunning ? '⏸ Parar' : '▶ Iniciar'}
            </button>

            {/* Help Button */}
            <button
              onClick={() => setTourOpen(true)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              ❓
            </button>

            {/* Compile (only shown when stopped) */}
            {!isRunning && (
              <button
                onClick={handleCompile}
                style={{ padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px', background: '#6c5ce7', color: '#fff' }}
              >
                ✓
              </button>
            )}
          </div>
        </div>

        {/* ── Tab content ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#0f1923' }}>

          {/* BOARD TAB — full-screen breadboard, touch-action:none on wrapper */}
          <div style={{
            position: 'absolute', inset: 0,
            display: mobileTab === 'board' ? 'flex' : 'none',
            flexDirection: 'column',
            // touch-action:none tells the browser to hand ALL touch events to JS
            // This is required for the pinch/pan handlers in useBreadboard to work
            touchAction: 'none',
          }}>
            <Breadboard {...breadboardProps} isMobile />


          </div>

          {/* JSON TAB — paste-first */}
          {mobileTab === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* Big paste button */}
              <button
                onClick={handlePasteJson}
                style={{
                  width: '100%', padding: '22px 16px', flexShrink: 0, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                  color: '#fff', fontSize: '18px', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 4px 20px rgba(0,184,148,0.5)',
                  letterSpacing: '0.5px',
                }}
              >
                <span style={{ fontSize: '26px' }}>📥</span>
                COLAR DA IA
              </button>

              {/* Secondary toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', background: '#1e272e', flexShrink: 0,
                borderBottom: '1px solid #2d3436',
              }}>
                <span style={{ fontSize: '11px', color: '#b2bec3', flex: 1 }}>JSON do Circuito</span>
                {clipboardMsg && <span style={{ fontSize: '12px', color: '#00b894', fontWeight: 700 }}>{clipboardMsg}</span>}
                <button
                  onClick={handleCopyAIPrompt}
                  style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.3)', padding: '5px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                >
                  🤖 Copiar Prompt IA
                </button>
                <button
                  onClick={handleCopyJson}
                  style={{ background: 'rgba(0,184,148,0.15)', color: '#55efc4', border: '1px solid rgba(0,184,148,0.3)', padding: '5px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                >
                  📋 Copiar
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={jsonCode}
                onChange={e => handleJsonChange(e.target.value)}
                spellCheck={false} autoCorrect="off" autoCapitalize="off"
                style={{
                  flex: 1, background: '#141e27', color: '#a29bfe',
                  fontFamily: 'monospace', fontSize: '13px',
                  border: 'none', padding: '14px', resize: 'none', outline: 'none', lineHeight: 1.6,
                }}
              />
            </div>
          )}

          {/* I/O TAB */}
          {mobileTab === 'io' && (
            <div style={{ height: '100%', overflow: 'auto', background: '#f5f6fa' }}>
              <DigitalIOPanel
                simData={simData} pinStates={pinStates}
                isDarkMode={false} onWireChange={handleWireChange}
                onInputClick={toggleInputState}
              />
            </div>
          )}
        </div>

        {/* ── Bottom nav bar ──────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexShrink: 0,
          background: '#1e272e',
          borderTop: '1px solid #2d3436',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {tabDef.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id as MobileTab)}
              style={{
                flex: 1, padding: '10px 4px 8px',
                border: 'none', cursor: 'pointer',
                background: mobileTab === tab.id ? 'rgba(108,92,231,0.2)' : 'transparent',
                borderTop: `2px solid ${mobileTab === tab.id ? '#6c5ce7' : 'transparent'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '20px' }}>{tab.label}</span>
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: mobileTab === tab.id ? '#a29bfe' : '#636e72',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Onboarding Tour for Mobile */}
        {tourOpen && <OnboardingTour forceOpen onClose={() => setTourOpen(false)} />}
        {!tourOpen && <OnboardingTour />}

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
