import { useState, useEffect, useCallback, useRef } from 'react';
import { CircuitData, PinStates, ChipStateMap } from '@/lib/types';
import { ComponentLibrary } from '@/lib/componentLibrary';

class UnionFind {
  parent: Record<string, string> = {};
  find(i: string): string {
    if (this.parent[i] === undefined) this.parent[i] = i;
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }
  union(i: string, j: string) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) this.parent[rootI] = rootJ;
  }
}

const defaultJSON: CircuitData = {
  "boards": 1,
  "chips": [
    { "id": "U1", "type": "74LS00", "board": 0, "col": 15 }
  ],
  "inputs": [
    { "id": "SW_S",  "label": "Set (S)",   "board": 0, "col": 5,  "state": 0 },
    { "id": "SW_R",  "label": "Reset (R)", "board": 0, "col": 8,  "state": 0 },
    { "id": "SW_EN", "label": "Enable",    "board": 0, "col": 11, "state": 1 }
  ],
  "outputs": [
    { "id": "LED_QH", "label": "Q_High", "board": 0, "col": 35 },
    { "id": "LED_QL", "label": "Q_Low",  "board": 0, "col": 39 }
  ],
  "wires": [
    { "id": "w_vcc",       "from": "VCC",   "to": "U1.14",   "color": "#e84118" },
    { "id": "w_gnd",       "from": "GND",   "to": "U1.7",    "color": "#2f3640" },
    { "id": "w_s",         "from": "SW_S",  "to": "U1.9",    "color": "#fd79a8" },
    { "id": "w_r",         "from": "SW_R",  "to": "U1.13",   "color": "#00b894" },
    { "id": "w_en1",       "from": "SW_EN", "to": "U1.10",   "color": "#6c5ce7" },
    { "id": "w_en2",       "from": "SW_EN", "to": "U1.12",   "color": "#6c5ce7" },
    { "id": "w_internal1", "from": "U1.8",  "to": "U1.1",    "color": "#e1b12c" },
    { "id": "w_internal2", "from": "U1.11", "to": "U1.5",    "color": "#e1b12c" },
    { "id": "w_cross1",    "from": "U1.3",  "to": "U1.4",    "color": "#ffffff" },
    { "id": "w_cross2",    "from": "U1.6",  "to": "U1.2",    "color": "#00cec9" },
    { "id": "w_out1",      "from": "U1.3",  "to": "LED_QH",  "color": "#4cd137" },
    { "id": "w_out2",      "from": "U1.6",  "to": "LED_QL",  "color": "#0984e3" }
  ]
};

// ==========================================
// Build the merged local component library
// Priority: componentDefinitions > customComponents > ComponentLibrary
// ==========================================
function buildLocalLib(simData: CircuitData): Record<string, any> {
  const localLib: Record<string, any> = { ...ComponentLibrary };

  // Layer 1: legacy customComponents array (lower priority)
  if (simData.customComponents) {
    simData.customComponents.forEach(cc => {
      try {
        const evalFn = new Function('pins', 'state', `"use strict"; ${cc.eval}`);
        localLib[cc.type] = {
          name:      cc.name || cc.type,
          pins:      cc.pins,
          pinLabels: cc.pinLabels || {},
          category:  'Custom',
          eval:      evalFn,
        };
      } catch (e) {
        console.error(`[Simulator] Failed to compile customComponent "${cc.type}":`, e);
      }
    });
  }

  // Layer 2: new componentDefinitions root object (highest priority)
  if (simData.componentDefinitions) {
    Object.entries(simData.componentDefinitions).forEach(([type, def]) => {
      try {
        const evalFn = new Function('pins', 'state', `"use strict"; ${def.eval}`);
        localLib[type] = {
          name:      def.name || type,
          pins:      def.pins,
          pinLabels: def.pinLabels || {},
          category:  'Inline',
          eval:      evalFn,
        };
      } catch (e) {
        console.error(`[Simulator] Failed to compile componentDefinition "${type}":`, e);
      }
    });
  }

  return localLib;
}

// ==========================================
// Pure simulation function
// chipStates: mutable per-chip state objects (for edge-triggered logic)
// ==========================================
export function simulateCircuit(
  simData: CircuitData,
  inputStates: Record<string, number>,
  prevStates: PinStates,
  chipStates: ChipStateMap
): PinStates {

  const getParentNodeId = (target: string): string => {
    if (!target) return 'UNKNOWN';
    if (target === 'VCC' || target === 'GND') return target;

    if (target.includes('.')) {
      const [chipId, pinStr] = target.split('.');
      const pin  = parseInt(pinStr);
      const chip = simData.chips?.find(c => c.id === chipId);
      if (chip) {
        const lib        = localLib[chip.type] || { pins: 14 };
        const pinsPerSide = lib.pins / 2;
        if (pin <= pinsPerSide) return `B${chip.board || 0}_C${chip.col + pin - 1}_B`;
        else                    return `B${chip.board || 0}_C${chip.col + (lib.pins - pin)}_T`;
      }
    }

    if (target.startsWith('B')) {
      const parts = target.split('_');
      if (parts[1] === 'PRT' || parts[1] === 'PRB' || parts[1]?.startsWith('C')) {
        return `${parts[0]}_${parts[1]}_${parts[2]}`;
      }
    }

    return target;
  };

  // Build merged lib (called once per simulate invocation)
  const localLib = buildLocalLib(simData);

  // 1. Build Electrical Nets — Union-Find
  const uf = new UnionFind();
  simData.wires?.forEach(w => uf.union(getParentNodeId(w.from), getParentNodeId(w.to)));

  const netStates: Record<string, number | undefined> = {};
  netStates[uf.find('VCC')] = 1;
  netStates[uf.find('GND')] = 0;

  // Seed nets from inputs
  simData.inputs?.forEach(inp => {
    const root = uf.find(inp.id);
    if (netStates[root] === undefined) {
      netStates[root] = inputStates[inp.id] !== undefined ? inputStates[inp.id] : inp.state;
    }
  });

  // Seed nets from previous chip output states (feedback / latch memory)
  simData.chips?.forEach(chip => {
    const lib = localLib[chip.type];
    if (!lib) return;
    for (let p = 1; p <= lib.pins; p++) {
      const pinId = `${chip.id}.${p}`;
      const root  = uf.find(getParentNodeId(pinId));
      if (netStates[root] === undefined && prevStates[pinId] !== undefined) {
        netStates[root] = prevStates[pinId];
      }
    }
  });

  // 2. Stable-State Relaxation Loop (max 10 passes)
  let stable    = false;
  let iterations = 0;
  while (!stable && iterations < 10) {
    stable = true;
    iterations++;

    simData.chips?.forEach(chip => {
      const lib = localLib[chip.type];
      if (!lib?.eval) return;

      // Ensure this chip has a persistent state object
      if (!chipStates[chip.id]) chipStates[chip.id] = {};
      const chipState = chipStates[chip.id];

      // Proxy: reads from nets (safe 0 for uninitialized), writes back to nets
      const pinsProxy = new Proxy([] as number[], {
        get(_t, prop) {
          const p = parseInt(prop as string);
          if (isNaN(p)) return undefined;
          return netStates[uf.find(getParentNodeId(`${chip.id}.${p}`))] ?? 0;
        },
        set(_t, prop, value) {
          const p = parseInt(prop as string);
          if (isNaN(p)) return true;
          const root = uf.find(getParentNodeId(`${chip.id}.${p}`));
          if (netStates[root] !== value) {
            netStates[root] = value;
            stable = false; // Propagation triggered — need another pass
          }
          return true;
        }
      });

      try {
        lib.eval(pinsProxy, chipState);
      } catch (e) {
        console.error(`[Simulator] Error evaluating chip "${chip.id}" (${chip.type}):`, e);
      }
    });
  }

  if (!stable) {
    console.warn('[Simulator] Circuit did not settle after 10 passes — possible oscillation.');
  }

  // 3. Map final net states to named targets for React rendering
  const finalStates: PinStates = { VCC: 1, GND: 0 };

  simData.wires?.forEach(w => {
    finalStates[w.from] = netStates[uf.find(getParentNodeId(w.from))] ?? 0;
    finalStates[w.to]   = netStates[uf.find(getParentNodeId(w.to))]   ?? 0;
  });

  simData.chips?.forEach(chip => {
    const lib = localLib[chip.type] || { pins: 14 };
    for (let p = 1; p <= lib.pins; p++) {
      finalStates[`${chip.id}.${p}`] = netStates[uf.find(getParentNodeId(`${chip.id}.${p}`))] ?? 0;
    }
  });

  simData.inputs?.forEach(inp => {
    finalStates[inp.id] = netStates[uf.find(inp.id)] ?? 0;
  });

  simData.outputs?.forEach(outp => {
    finalStates[outp.id] = netStates[uf.find(outp.id)] ?? 0;
  });

  return finalStates;
}

// ==========================================
// Truth Table Generator (for clipboard export & Test Bench)
// ==========================================
export function generateTruthTable(simData: CircuitData): string {
  if (!simData.inputs  || simData.inputs.length  === 0) return 'No inputs to test.';
  if (!simData.outputs || simData.outputs.length === 0) return 'No outputs to measure.';

  const numInputs       = simData.inputs.length;
  const numPermutations = Math.pow(2, numInputs);
  const tempChipStates: ChipStateMap = {};

  const header = '| ' + simData.inputs.map(i => i.label || i.id).join(' | ') + ' | ' + simData.outputs.map(o => o.label || o.id).join(' | ') + ' |\n';
  const sep    = '|' + simData.inputs.map(() => '---').join('|') + '|' + simData.outputs.map(() => '---').join('|') + '|\n';
  let table    = header + sep;

  for (let i = 0; i < numPermutations; i++) {
    const inputStates: Record<string, number> = {};
    simData.inputs.forEach((inp, idx) => {
      inputStates[inp.id] = (i >> (numInputs - 1 - idx)) & 1;
    });

    // Run 3 ticks so latches can settle from any previous permutation
    let states: PinStates = {};
    for (let tick = 0; tick < 3; tick++) {
      states = simulateCircuit(simData, inputStates, states, tempChipStates);
    }

    table += '| ' + simData.inputs.map(inp => inputStates[inp.id]).join(' | ') + ' | ' + simData.outputs.map(o => states[o.id] ?? 0).join(' | ') + ' |\n';
  }

  return table;
}

// ==========================================
// React Hook
// ==========================================
export function useSimulation() {
  const [simData,      setSimData]      = useState<CircuitData>(defaultJSON);
  const [pinStates,    setPinStates]    = useState<PinStates>({});
  const [isRunning,    setIsRunning]    = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [debugMode,    setDebugMode]    = useState<boolean>(false);
  const [changedPins,  setChangedPins]  = useState<Set<string>>(new Set());

  // chipStates lives in a ref so it persists across renders without causing re-renders
  const chipStatesRef = useRef<ChipStateMap>({});

  // Helper: evaluate one tick, compute changed pins for flash animation
  const evaluateLogic = useCallback(() => {
    setPinStates(prevStates => {
      const currentInputStates: Record<string, number> = {};
      simData.inputs?.forEach(inp => { currentInputStates[inp.id] = inp.state; });
      const next = simulateCircuit(simData, currentInputStates, prevStates, chipStatesRef.current);

      // Compute changed pins (for debug flash animation)
      const changed = new Set<string>();
      for (const key of Object.keys(next)) {
        if (next[key] !== prevStates[key]) changed.add(key);
      }
      if (changed.size > 0) setChangedPins(changed);

      return next;
    });
  }, [simData]);

  // Manual single-tick step (used in debug mode)
  const executeTick = useCallback(() => {
    evaluateLogic();
    // Clear flash highlights after 700ms
    setTimeout(() => setChangedPins(new Set()), 700);
  }, [evaluateLogic]);

  const compileCircuit = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as CircuitData;
      setSimData(parsed);
      setCompileError(null);
      // Reset all edge-triggered chip memory on recompile
      chipStatesRef.current = {};

      const initialStates: PinStates = { VCC: 1, GND: 0 };
      parsed.inputs?.forEach(inp => { initialStates[inp.id] = inp.state; });
      setPinStates(initialStates);
      setChangedPins(new Set());
    } catch (e: any) {
      setCompileError(e.message);
    }
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const toggleDebugMode = useCallback(() => {
    setDebugMode(prev => !prev);
    setChangedPins(new Set());
  }, []);

  const toggleInputState = useCallback((inputId: string) => {
    if (!isRunning) return;
    setSimData(prevData => {
      if (!prevData.inputs) return prevData;
      const newInputs = prevData.inputs.map(inp => {
        if (inp.id === inputId) {
          const newState = inp.state === 1 ? 0 : 1;
          setPinStates(prev => ({ ...prev, [inputId]: newState }));
          return { ...inp, state: newState };
        }
        return inp;
      });
      return { ...prevData, inputs: newInputs };
    });
  }, [isRunning]);

  // Auto-tick interval — paused in debug mode so user steps manually
  useEffect(() => {
    if (!isRunning || debugMode) return;
    const interval = setInterval(() => { evaluateLogic(); }, 100);
    return () => clearInterval(interval);
  }, [isRunning, debugMode, evaluateLogic]);

  useEffect(() => {
    evaluateLogic();
  }, [simData, evaluateLogic]);

  return {
    simData,
    pinStates,
    isRunning,
    compileError,
    debugMode,
    changedPins,
    compileCircuit,
    toggleSimulation,
    toggleDebugMode,
    executeTick,
    toggleInputState,
    defaultJSON,
  };
}
