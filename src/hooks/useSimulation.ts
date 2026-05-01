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
//
// IMPORTANT: Custom eval strings are compiled with THREE sandbox arguments:
//   pins    — the Proxy over electrical nets (reads/writes to this tick's netStates)
//   state   — the chip's persistent memory object (survives across ticks)
//   sysTick — the global simulation clock (integer, increments once per setInterval
//             fire). This is the ONLY safe way for oscillator components to read
//             time without polluting the relaxation loop.
// ==========================================
function buildLocalLib(simData: CircuitData): Record<string, any> {
  const localLib: Record<string, any> = { ...ComponentLibrary };

  // Layer 1: legacy customComponents array (lower priority)
  if (simData.customComponents) {
    simData.customComponents.forEach(cc => {
      try {
        // ← sysTick added as 3rd sandbox argument
        const evalFn = new Function('pins', 'state', 'sysTick', `"use strict"; ${cc.eval}`);
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
        // ← sysTick added as 3rd sandbox argument
        const evalFn = new Function('pins', 'state', 'sysTick', `"use strict"; ${def.eval}`);
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
// sysTick:    global simulation clock — FROZEN for the entire duration of this
//             call. The relaxation loop may call lib.eval many times, but sysTick
//             never changes within a single call. Components MUST NOT mutate their
//             own tick counter; they should only READ sysTick.
// ==========================================
export function simulateCircuit(
  simData: CircuitData,
  inputStates: Record<string, number>,
  prevStates: PinStates,
  chipStates: ChipStateMap,
  sysTick: number = 0            // ← Global System Time injected here
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

  // 2. Stable-State Relaxation Loop with Double Buffering (max 10 passes)
  //
  // DOUBLE-BUFFER INVARIANT:
  //   Each pass is a complete, independent "simultaneous evaluation" of all chips.
  //   - passSnapshot  = what the nets looked like at the START of this pass
  //                     (every chip reads from this → no chip can read another
  //                      chip's output that was written in the same pass)
  //   - netStates     = accumulates all writes during this pass
  //   - stable        = true iff netStates === passSnapshot after all chips run
  //
  // Why not just freeze once at tick start?
  //   Combinational chains (AND → OR → XOR) NEED to see intermediate writes
  //   across passes to converge. Freezing once would stop them from settling.
  //   Freezing per-pass gives combinational logic one extra iteration per gate
  //   depth — with 10 passes, chains up to 10 gates deep resolve correctly.
  //
  // Why this fixes the shift register race:
  //   FF1 writes Q_new to netStates in pass N.
  //   FF2 reads FF1's Q from passSnapshot (which still has Q_old from before
  //   pass N started). FF2 therefore captures Q_old, not Q_new. This matches
  //   real hardware: all flip-flops clock simultaneously on the same edge.
  //
  // SR latches are unaffected:
  //   The latch's cross-coupling converges over multiple passes (pass 1: NAND A
  //   writes; pass 2: NAND B sees it; pass 3: stable). No regression here.
  let stable    = false;
  let iterations = 0;
  while (!stable && iterations < 20) {
    stable = true;
    iterations++;

    // ── FREEZE: snapshot nets at the start of this pass ─────────────────────
    // Every chip in this pass READS from this frozen copy.
    // Every chip WRITES to netStates (the accumulator for this pass).
    const passSnapshot = { ...netStates };

    simData.chips?.forEach(chip => {
      const lib = localLib[chip.type];
      if (!lib?.eval) return;

      // Ensure this chip has a persistent state object
      if (!chipStates[chip.id]) chipStates[chip.id] = {};
      const chipState = chipStates[chip.id];

      // Proxy:
      //   GET  → reads from passSnapshot (frozen at the top of this pass)
      //   SET  → writes to netStates    (the accumulator)
      //   The split is the double-buffer: reads and writes are temporally isolated.
      const pinsProxy = new Proxy([] as number[], {
        get(_t, prop) {
          const p = parseInt(prop as string);
          if (isNaN(p)) return undefined;
          // ← passSnapshot, NOT netStates
          return passSnapshot[uf.find(getParentNodeId(`${chip.id}.${p}`))] ?? 0;
        },
        set(_t, prop, value) {
          const p = parseInt(prop as string);
          if (isNaN(p)) return true;
          const root = uf.find(getParentNodeId(`${chip.id}.${p}`));
          // ← Compare against snapshot to detect if this write is a real change
          if (passSnapshot[root] !== value) {
            netStates[root] = value;
            stable = false; // Net changed vs snapshot → need another pass
          }
          return true;
        }
      });

      try {
        // sysTick is passed as the 3rd argument — frozen for the entire tick.
        lib.eval(pinsProxy, chipState, sysTick);
      } catch (e) {
        console.error(`[Simulator] Error evaluating chip "${chip.id}" (${chip.type}):`, e);
      }
    });
  }

  if (!stable) {
    console.warn('[Simulator] Circuit did not settle after 20 passes — possible oscillation.');
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

  // ─── Global System Time ───────────────────────────────────────────────────
  // simulationTick is the ONE source of truth for time in the entire engine.
  // It increments exactly ONCE per setInterval fire (every 100 ms by default).
  // The relaxation loop receives this frozen integer and passes it to every
  // chip eval. Because the tick does not change mid-loop, oscillator components
  // (555 timers, clock dividers) read a stable value and can never accumulate
  // spurious counts from repeated relaxation passes.
  const [simulationTick, setSimulationTick] = useState<number>(0);

  // chipStates lives in a ref so it persists across renders without causing re-renders
  const chipStatesRef = useRef<ChipStateMap>({});

  // Capture the latest simulationTick in a ref so evaluateLogic always reads
  // the current value without needing it as a useCallback dependency.
  const simTickRef = useRef<number>(0);
  useEffect(() => { simTickRef.current = simulationTick; }, [simulationTick]);

  // Helper: evaluate one tick, compute changed pins for flash animation
  const evaluateLogic = useCallback(() => {
    setPinStates(prevStates => {
      const currentInputStates: Record<string, number> = {};
      simData.inputs?.forEach(inp => { currentInputStates[inp.id] = inp.state; });

      // Pass the FROZEN global tick — this value does not change during the
      // relaxation loop, so oscillators read a stable number.
      const next = simulateCircuit(
        simData,
        currentInputStates,
        prevStates,
        chipStatesRef.current,
        simTickRef.current,
      );

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
    // In debug mode we must also advance the system clock so oscillators step.
    setSimulationTick(t => t + 1);
    setTimeout(() => setChangedPins(new Set()), 700);
  }, []);

  const compileCircuit = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as CircuitData;
      setSimData(parsed);
      setCompileError(null);
      // Reset all edge-triggered chip memory on recompile
      chipStatesRef.current = {};
      // Reset the global clock so oscillators start from a clean state
      setSimulationTick(0);
      simTickRef.current = 0;

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

  // ─── Global Clock: the interval ONLY advances the tick ───────────────────
  // evaluateLogic is NOT called directly from the interval anymore.
  // Instead, advancing simulationTick triggers the effect below which calls
  // evaluateLogic. This two-step design means the tick is always committed to
  // React state before the engine reads it, so simTickRef.current is fresh.
  useEffect(() => {
    if (!isRunning || debugMode) return;
    const interval = setInterval(() => {
      setSimulationTick(t => t + 1);   // ← This is the ONLY place time advances
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, debugMode]);

  // ─── Run engine on every tick change (and on simData recompile) ──────────
  useEffect(() => {
    evaluateLogic();
  }, [simulationTick, evaluateLogic]);

  // Initial evaluation when circuit is first loaded
  useEffect(() => {
    evaluateLogic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simData]);

  return {
    simData,
    pinStates,
    isRunning,
    compileError,
    debugMode,
    changedPins,
    simulationTick,
    compileCircuit,
    toggleSimulation,
    toggleDebugMode,
    executeTick,
    toggleInputState,
    defaultJSON,
  };
}
