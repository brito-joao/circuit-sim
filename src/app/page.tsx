'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import JsonEditor from '@/components/JsonEditor';
import Breadboard from '@/components/Breadboard';
import { ComponentPalette } from '@/components/breadboard/ComponentPalette';
import { DigitalIOPanel } from '@/components/breadboard/DigitalIOPanel';
import { useSimulation } from '@/hooks/useSimulation';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

export default function Home() {
  const {
    simData,
    pinStates,
    isRunning,
    compileError,
    compileCircuit,
    toggleSimulation,
    toggleInputState,
    defaultJSON,
  } = useSimulation();

  const [jsonCode, setJsonCode] = useState(
    JSON.stringify(defaultJSON, null, 2)
  );

  const [editMode, setEditMode] = useState(false);

  // Two-way sync: Update UI when Monaco editor JSON is valid
  const handleJsonChange = (value: string) => {
    setJsonCode(value);
    compileCircuit(value);
  };

  // Two-way sync: Update Monaco JSON when visually dragging elements
  const handleWireChange = (newSimData: any) => {
    const newJson = JSON.stringify(newSimData, null, 2);
    setJsonCode(newJson);
    compileCircuit(newJson);
  };

  const handleCompile = () => {
    compileCircuit(jsonCode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        isRunning={isRunning}
        onToggleSimulation={toggleSimulation}
        onCompile={handleCompile}
        compileError={compileError}
      />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup orientation="horizontal">
          
          {editMode && (
            <>
              <Panel defaultSize={20} minSize={15}>
                <ComponentPalette isDarkMode={false} />
              </Panel>
              <PanelResizeHandle style={{ width: '4px', background: '#dfe6e9', cursor: 'col-resize', transition: 'background 0.2s' }} />
            </>
          )}

          <Panel defaultSize={editMode ? 50 : 65} minSize={30}>
            <PanelGroup orientation="vertical">
              <Panel defaultSize={75} minSize={40}>
                <Breadboard
                  simData={simData}
                  pinStates={pinStates}
                  onInputClick={toggleInputState}
                  onWireChange={handleWireChange}
                  editMode={editMode}
                  onToggleEditMode={() => setEditMode(!editMode)}
                  isRunning={isRunning}
                />
              </Panel>
              <PanelResizeHandle style={{ height: '4px', background: '#dfe6e9', cursor: 'row-resize', transition: 'background 0.2s' }} />
              <Panel defaultSize={25} minSize={10}>
                <DigitalIOPanel 
                  simData={simData} 
                  pinStates={pinStates} 
                  isDarkMode={false} 
                  onWireChange={handleWireChange}
                  onInputClick={toggleInputState}
                />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle style={{ width: '4px', background: '#dfe6e9', cursor: 'col-resize', transition: 'background 0.2s' }} />
          
          <Panel defaultSize={editMode ? 30 : 35} minSize={20}>
            <JsonEditor code={jsonCode} onChange={handleJsonChange} />
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );
}
