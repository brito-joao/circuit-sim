'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CircuitData, PinStates } from '@/lib/types';
import { ComponentLibrary } from '@/lib/componentLibrary';
import { BreadboardControls } from './breadboard/BreadboardControls';
import { BreadboardTooltip } from './breadboard/BreadboardTooltip';
import { BreadboardBoards } from './breadboard/BreadboardBoards';
import { BreadboardSidebar } from './breadboard/BreadboardSidebar';
import { BreadboardChips } from './breadboard/BreadboardChips';
import { BreadboardInputs } from './breadboard/BreadboardInputs';
import { BreadboardOutputs } from './breadboard/BreadboardOutputs';
import { BreadboardWires } from './breadboard/BreadboardWires';
import { useBreadboard } from './breadboard/useBreadboard';
import { getBreadboardLayout } from './breadboard/breadboardUtils';
import { getTheme } from './breadboard/breadboardThemes';
import { TestBenchPanel } from './breadboard/TestBenchPanel';
import { generateTruthTable } from '@/hooks/useSimulation';



interface BreadboardProps {
  simData: CircuitData;
  pinStates: PinStates;
  onInputClick: (inputId: string) => void;
  onWireChange?: (newSimData: CircuitData) => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  isRunning: boolean;
  jsonCode: string;
  debugMode: boolean;
  onToggleDebugMode: () => void;
  onExecuteTick: () => void;
  changedPins: Set<string>;
}

export default function Breadboard({
  simData,
  pinStates,
  onInputClick,
  onWireChange,
  editMode,
  onToggleEditMode,
  isRunning,
  jsonCode,
  debugMode,
  onToggleDebugMode,
  onExecuteTick,
  changedPins,
}: BreadboardProps) {
  const {
    numBoards,
    boardHeight,
    padX,
    padY,
    getCoords,
    getAllTargets
  } = getBreadboardLayout(simData);

  const {
    isDarkMode,
    tooltip,
    transform,
    isDragging,
    draggingWire,
    setDraggingWire,
    svgRef,
    showDetails,
    hideDetails,
    getMouseCoords,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSafeClick,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleTheme,
    xRayMode,
    setXRayMode,
    buildStep,
    setBuildStep,
    autoCompleteCircuit
  } = useBreadboard(simData, onWireChange, getAllTargets);

  const theme = getTheme(isDarkMode);

  const exportTable = () => {
    const tableStr = generateTruthTable(simData);
    navigator.clipboard.writeText(tableStr);
    alert('Truth Table copied to clipboard!');
  };

  return (
    <div className="sim-panel" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: theme.bg }}>

      <BreadboardControls 
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        theme={theme}
        xRayMode={xRayMode}
        setXRayMode={setXRayMode}
        editMode={editMode}
        onToggleEditMode={onToggleEditMode}
        debugMode={debugMode}
        onToggleDebugMode={onToggleDebugMode}
        onExecuteTick={onExecuteTick}
      />

      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const type = e.dataTransfer.getData('application/react-breadboard-component');
          const existingId = e.dataTransfer.getData('application/react-breadboard-existing-chip');
          
          if (type && onWireChange) {
            const { x, y } = getMouseCoords(e.clientX, e.clientY);
            const board = Math.max(0, Math.min(numBoards - 1, Math.floor((y - padY) / boardHeight)));
            const col = Math.max(0, Math.floor((x - padX - 40) / 20));
            const newSimData = { ...simData };
            newSimData.chips = [...(newSimData.chips || []), {
              id: `U${(newSimData.chips?.length || 0) + 1}`,
              type,
              board,
              col
            }];
            onWireChange(newSimData);
          } else if (existingId && onWireChange) {
            const { x, y } = getMouseCoords(e.clientX, e.clientY);
            const board = Math.max(0, Math.min(numBoards - 1, Math.floor((y - padY) / boardHeight)));
            const col = Math.max(0, Math.floor((x - padX - 40) / 20));
            const newSimData = { ...simData };
            if (newSimData.chips) {
              newSimData.chips = newSimData.chips.map(c => 
                c.id === existingId ? { ...c, board, col } : c
              );
            }
            onWireChange(newSimData);
          }
        }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>

          <BreadboardBoards 
            numBoards={numBoards}
            padX={padX}
            padY={padY}
            boardHeight={boardHeight}
            theme={theme}
            isDarkMode={isDarkMode}
          />

          <BreadboardSidebar 
            padX={padX}
            padY={padY}
            boardHeight={boardHeight}
            numBoards={numBoards}
            theme={theme}
            isDarkMode={isDarkMode}
          />

          <BreadboardChips 
            chips={simData.chips}
            padX={padX}
            padY={padY}
            boardHeight={boardHeight}
            theme={theme}
            isDarkMode={isDarkMode}
            xRayMode={xRayMode}
            showDetails={showDetails}
            hideDetails={hideDetails}
            customComponents={simData.customComponents}
            componentDefinitions={simData.componentDefinitions}
          />

          <BreadboardInputs 
            inputs={simData.inputs}
            pinStates={pinStates}
            getCoords={getCoords}
            handleSafeClick={handleSafeClick}
            onInputClick={onInputClick}
            showDetails={showDetails}
            hideDetails={hideDetails}
          />

          <BreadboardOutputs 
            outputs={simData.outputs}
            pinStates={pinStates}
            getCoords={getCoords}
            theme={theme}
            showDetails={showDetails}
            hideDetails={hideDetails}
          />

          <BreadboardWires 
            wires={simData.wires}
            getCoords={getCoords}
            draggingWire={draggingWire}
            pinStates={pinStates}
            isDarkMode={isDarkMode}
            padY={padY}
            boardHeight={boardHeight}
            showDetails={showDetails}
            hideDetails={hideDetails}
            setDraggingWire={setDraggingWire}
            buildStep={buildStep}
            isRunning={isRunning}
            changedPins={changedPins}
          />

        </g>
      </svg>

      {/* Overlays */}
      <TestBenchPanel simData={simData} isDarkMode={isDarkMode} jsonCode={jsonCode} />

      {/* Lab Exporter */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={exportTable} style={{ background: '#e1b12c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 Copy Lab Table
        </button>
      </div>

      {/* ─── Guided Build Mode (IKEA Step-by-Step) ─────────────────────── */}
      <div
        data-tour="ikea-panel"
        style={{
          position: 'absolute', bottom: '20px', right: '20px',
          background: isDarkMode ? 'rgba(30,39,46,0.97)' : 'rgba(255,255,255,0.98)',
          padding: '16px', borderRadius: '14px', minWidth: '220px', maxWidth: '260px',
          border: `1px solid ${isDarkMode ? '#2d3436' : '#e0e4f0'}`,
          boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 800, fontSize: '13px', color: isDarkMode ? '#f5f6fa' : '#1e272e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔧 Montagem Passo a Passo
          </div>
          <div style={{ fontSize: '11px', color: isDarkMode ? '#b2bec3' : '#636e72', marginTop: '3px' }}>
            Siga os fios como instruções IKEA
          </div>
        </div>

        {/* Wire progress indicator */}
        {buildStep > -1 && simData.wires && (
          <div style={{ marginBottom: '12px', background: isDarkMode ? '#2d3436' : '#f0f4ff', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: isDarkMode ? '#b2bec3' : '#6c5ce7', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {buildStep < simData.wires.length
                ? `Fio ${buildStep + 1} de ${simData.wires.length}`
                : `Todos os ${simData.wires.length} fios colocados ✅`}
            </div>
            {/* Progress bar */}
            <div style={{ height: '4px', background: isDarkMode ? '#636e72' : '#dfe6e9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${Math.min(100, ((buildStep + 1) / (simData.wires?.length || 1)) * 100)}%`,
                background: 'linear-gradient(90deg, #6c5ce7, #00b894)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            {/* Current wire instruction */}
            {simData.wires[buildStep] && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#e84393', fontWeight: 700 }}>
                ⚡ Liga: <span style={{ fontFamily: 'monospace' }}>{simData.wires[buildStep].from}</span>
                <span style={{ color: isDarkMode ? '#b2bec3' : '#636e72', fontWeight: 400 }}> → </span>
                <span style={{ fontFamily: 'monospace' }}>{simData.wires[buildStep].to}</span>
              </div>
            )}
          </div>
        )}

        {/* Main buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <button
            onClick={() => setBuildStep(0)}
            title="Começar a ver os fios um de cada vez"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6c5ce7', color: 'white', border: 'none', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'opacity 0.15s' }}
          >
            <span>▶</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Iniciar Montagem</span>
            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>do fio 1</span>
          </button>

          <button
            onClick={() => setBuildStep(prev => prev + 1)}
            disabled={buildStep < 0}
            title="Revelar o próximo fio"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: buildStep >= 0 ? '#0984e3' : '#dfe6e9', color: buildStep >= 0 ? 'white' : '#b2bec3', border: 'none', padding: '9px 12px', borderRadius: '8px', cursor: buildStep >= 0 ? 'pointer' : 'default', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}
          >
            <span>→</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Próximo Fio</span>
            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>revelar</span>
          </button>

          <button
            onClick={() => setBuildStep(-1)}
            title="Mostrar todos os fios de uma vez"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDarkMode ? '#2d3436' : '#f0f2f5', color: isDarkMode ? '#dfe6e9' : '#2d3436', border: `1px solid ${isDarkMode ? '#636e72' : '#dfe6e9'}`, padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}
          >
            <span>👀</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Ver Todos os Fios</span>
          </button>

          <div style={{ height: '1px', background: isDarkMode ? '#2d3436' : '#e0e4f0', margin: '2px 0' }} />

          <button
            onClick={autoCompleteCircuit}
            title="Ligar automaticamente todos os fios de uma vez"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#d63031', color: 'white', border: 'none', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'opacity 0.15s' }}
          >
            <span>⚡</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Ligar Tudo</span>
            <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>saltar etapas</span>
          </button>
        </div>
      </div>

      <BreadboardTooltip tooltip={tooltip} theme={theme} />
    </div>
  );
}