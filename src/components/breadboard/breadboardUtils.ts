import { CircuitData } from '@/lib/types';
import { ComponentLibrary } from '@/lib/componentLibrary';

export const getBreadboardLayout = (simData: CircuitData) => {
  const numBoards = simData.boards || 1;
  const boardHeight = 350;
  const boardWidth = 1450;
  const padX = 20;
  const padY = 120;

  const getCoords = (target: string) => {
    // 1. External Inputs / Outputs
    const inpIndex = simData.inputs && simData.inputs.findIndex((i) => i.id === target);
    if (inpIndex !== undefined && inpIndex >= 0) return { x: padX + 1100, y: padY + 20 + inpIndex * 35, isExternal: true };

    const outIndex = simData.outputs && simData.outputs.findIndex((o) => o.id === target);
    if (outIndex !== undefined && outIndex >= 0) {
      const outStartY = padY + 20 + (simData.inputs?.length || 0) * 35 + 40;
      return { x: padX + 1100, y: outStartY + outIndex * 35, isExternal: true };
    }

    // 2. Legacy abstract power
    if (target === 'VCC') return { x: padX, y: padY + 40 };
    if (target === 'GND') return { x: padX, y: padY + 65 };

    // 3. New Topological Physical Holes
    if (target.startsWith('B')) {
      const parts = target.split('_');
      if (parts.length === 4) {
        const b = parseInt(parts[0].substring(1));
        const offsetY = b * boardHeight;
        
        // Power Rails
        if (parts[1] === 'PRT') {
          const col = parseInt(parts[3]);
          const cx = padX + 40 + col * 20;
          if (parts[2] === 'RED') return { x: cx, y: padY + offsetY + 40, isPower: true, isTop: true };
          if (parts[2] === 'BLU') return { x: cx, y: padY + offsetY + 65, isPower: true, isTop: true };
        }
        if (parts[1] === 'PRB') {
          const col = parseInt(parts[3]);
          const cx = padX + 40 + col * 20;
          if (parts[2] === 'BLU') return { x: cx, y: padY + offsetY + 285, isPower: true, isBottom: true };
          if (parts[2] === 'RED') return { x: cx, y: padY + offsetY + 310, isPower: true, isBottom: true };
        }
        // Main Grid Holes
        if (parts[1].startsWith('C')) {
          const col = parseInt(parts[1].substring(1));
          const half = parts[2]; // T or B
          const row = parseInt(parts[3]);
          const cx = padX + 40 + col * 20;
          if (half === 'T') return { x: cx, y: padY + offsetY + 90 + row * 14, isTop: true };
          if (half === 'B') return { x: cx, y: padY + offsetY + 200 + row * 14, isBottom: true };
        }
      }
    }

    // 4. Legacy abstract chip pins
    if (target.includes('.')) {
      const [chipId, pinStr] = target.split('.');
      const pin = parseInt(pinStr);
      const chip = simData.chips && simData.chips.find((c) => c.id === chipId);
      if (chip) {
        const lib = ComponentLibrary[chip.type] || { pins: 14 };
        const pinsPerSide = lib.pins / 2;
        const offsetY = (chip.board || 0) * boardHeight;

        // Visual mapping: we usually place chip center at trench. Bottom pins are 1 to pinsPerSide.
        if (pin <= pinsPerSide) return { x: padX + 40 + (chip.col + pin - 1) * 20, y: padY + offsetY + 200, isBottom: true };
        else return { x: padX + 40 + (chip.col + (lib.pins - pin)) * 20, y: padY + offsetY + 146, isTop: true };
      }
    }
    
    return { x: 0, y: 0 };
  };

  const getAllTargets = () => {
    const targets: any[] = [];
    
    // Inputs and Outputs
    simData.inputs?.forEach(i => targets.push({ id: i.id, ...getCoords(i.id) }));
    simData.outputs?.forEach(o => targets.push({ id: o.id, ...getCoords(o.id) }));

    // Generate physical hole targets
    for (let b = 0; b < numBoards; b++) {
      for (let col = 1; col <= 50; col++) {
        targets.push({ id: `B${b}_PRT_RED_${col}`, ...getCoords(`B${b}_PRT_RED_${col}`) });
        targets.push({ id: `B${b}_PRT_BLU_${col}`, ...getCoords(`B${b}_PRT_BLU_${col}`) });
        
        for (let row = 0; row < 5; row++) {
          targets.push({ id: `B${b}_C${col}_T_${row}`, ...getCoords(`B${b}_C${col}_T_${row}`) });
          targets.push({ id: `B${b}_C${col}_B_${row}`, ...getCoords(`B${b}_C${col}_B_${row}`) });
        }
        
        targets.push({ id: `B${b}_PRB_BLU_${col}`, ...getCoords(`B${b}_PRB_BLU_${col}`) });
        targets.push({ id: `B${b}_PRB_RED_${col}`, ...getCoords(`B${b}_PRB_RED_${col}`) });
      }
    }
    
    // Include chip pins just in case
    simData.chips?.forEach(c => {
      const lib = ComponentLibrary[c.type] || { pins: 14 };
      for (let p = 1; p <= lib.pins; p++) {
        const pinId = `${c.id}.${p}`;
        targets.push({ id: pinId, ...getCoords(pinId) });
      }
    });

    return targets;
  };

  return {
    numBoards,
    boardHeight,
    boardWidth,
    padX,
    padY,
    getCoords,
    getAllTargets
  };
};
