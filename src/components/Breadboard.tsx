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
import { TruthTableValidator } from './breadboard/TruthTableValidator';
import { generateTruthTable } from '@/hooks/useSimulation';



interface BreadboardProps {
  simData: CircuitData;
  pinStates: PinStates;
  onInputClick: (inputId: string) => void;
  onWireChange?: (newSimData: CircuitData) => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  isRunning: boolean;
}

export default function Breadboard({
  simData,
  pinStates,
  onInputClick,
  onWireChange,
  editMode,
  onToggleEditMode,
  isRunning,
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
          />

        </g>
      </svg>

      {/* Overlays */}
      <TruthTableValidator simData={simData} isDarkMode={isDarkMode} />

      {/* Lab Exporter */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={exportTable} style={{ background: '#e1b12c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 Copy Lab Table
        </button>
      </div>

      {/* Guided Build Mode UI */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: isDarkMode ? 'rgba(47, 54, 64, 0.9)' : 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#576574' : '#dfe6e9'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', color: isDarkMode ? '#f5f6fa' : '#2d3436' }}>IKEA Build Mode</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button onClick={() => setBuildStep(0)} style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Start</button>
          <button onClick={() => setBuildStep(prev => prev + 1)} style={{ background: '#0984e3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Next Wire</button>
          <button onClick={() => setBuildStep(-1)} style={{ background: '#636e72', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Show All</button>
        </div>
        <button onClick={autoCompleteCircuit} style={{ background: '#d63031', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>⚡ Auto-Wire Cheat</button>
        {buildStep > -1 && simData.wires && simData.wires[buildStep] && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#e84393', fontWeight: 'bold' }}>
            Connect {simData.wires[buildStep].from} to {simData.wires[buildStep].to}
          </div>
        )}
      </div>

      <BreadboardTooltip tooltip={tooltip} theme={theme} />
    </div>
  );
}