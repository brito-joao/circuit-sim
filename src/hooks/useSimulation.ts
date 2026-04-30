import { useState, useEffect, useCallback } from 'react';
import { CircuitData, PinStates } from '@/lib/types';
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
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
    }
  }
}

const defaultJSON: CircuitData = {
  "boards": 1,
  "chips": [
    { "id": "U1", "type": "74LS00", "board": 0, "col": 15 }
  ],
  "inputs": [
    { "id": "SW_S", "label": "Set (S)", "board": 0, "col": 5, "state": 0 },
    { "id": "SW_R", "label": "Reset (R)", "board": 0, "col": 8, "state": 0 },
    { "id": "SW_EN", "label": "Enable", "board": 0, "col": 11, "state": 1 }
  ],
  "outputs": [
    { "id": "LED_QH", "label": "Q_High", "board": 0, "col": 35 },
    { "id": "LED_QL", "label": "Q_Low", "board": 0, "col": 39 }
  ],
  "wires": [
    { "id": "w_vcc", "from": "VCC", "to": "U1.14", "color": "#e84118" },
    { "id": "w_gnd", "from": "GND", "to": "U1.7", "color": "#2f3640" },
    { "id": "w_s", "from": "SW_S", "to": "U1.9", "color": "#fd79a8" },
    { "id": "w_r", "from": "SW_R", "to": "U1.13", "color": "#00b894" },
    { "id": "w_en1", "from": "SW_EN", "to": "U1.10", "color": "#6c5ce7" },
    { "id": "w_en2", "from": "SW_EN", "to": "U1.12", "color": "#6c5ce7" },
    { "id": "w_internal1", "from": "U1.8", "to": "U1.1", "color": "#e1b12c" },
    { "id": "w_internal2", "from": "U1.11", "to": "U1.5", "color": "#e1b12c" },
    { "id": "w_cross1", "from": "U1.3", "to": "U1.4", "color": "#ffffff" },
    { "id": "w_cross2", "from": "U1.6", "to": "U1.2", "color": "#00cec9" },
    { "id": "w_out1", "from": "U1.3", "to": "LED_QH", "color": "#4cd137" },
    { "id": "w_out2", "from": "U1.6", "to": "LED_QL", "color": "#0984e3" }
  ]
};

export function simulateCircuit(simData: CircuitData, inputStates: Record<string, number>, prevStates: PinStates): PinStates {
  const getParentNodeId = (target: string) => {
    if (!target) return 'UNKNOWN';
    if (target === 'VCC' || target === 'GND') return target;
    
    // Chip explicit pin connection
    if (target.includes('.')) {
      const [chipId, pinStr] = target.split('.');
      const pin = parseInt(pinStr);
      const chip = simData.chips?.find((c) => c.id === chipId);
      if (chip) {
        const lib = ComponentLibrary[chip.type] || { pins: 14 };
        const pinsPerSide = lib.pins / 2;
        if (pin <= pinsPerSide) return `B${chip.board || 0}_C${chip.col + pin - 1}_B`;
        else return `B${chip.board || 0}_C${chip.col + (lib.pins - pin)}_T`;
      }
    }

    // Physical Breadboard Hole Coordinate
    if (target.startsWith('B')) {
      const parts = target.split('_');
      if (parts[1] === 'PRT' || parts[1] === 'PRB') {
        return `${parts[0]}_${parts[1]}_${parts[2]}`;
      }
      if (parts[1].startsWith('C')) {
        return `${parts[0]}_${parts[1]}_${parts[2]}`;
      }
    }

    return target; // External I/O
  };

  // 1. Build Electrical Nets using Union-Find
  const uf = new UnionFind();
  if (simData.wires) {
    simData.wires.forEach(w => {
      uf.union(getParentNodeId(w.from), getParentNodeId(w.to));
    });
  }

  const netStates: Record<string, number | undefined> = {};
  
  // Absolute voltage rails
  netStates[uf.find('VCC')] = 1;
  netStates[uf.find('GND')] = 0;

  // Seed Nets from Inputs
  if (simData.inputs) {
    simData.inputs.forEach(inp => {
      const root = uf.find(inp.id);
      if (netStates[root] === undefined) {
        netStates[root] = inputStates[inp.id] !== undefined ? inputStates[inp.id] : inp.state;
      }
    });
  }

  // Build Local Component Library with Custom Components
  const localLib: Record<string, any> = { ...ComponentLibrary };
  if (simData.customComponents) {
    simData.customComponents.forEach(cc => {
      try {
        const evalFn = new Function("pins", cc.eval);
        localLib[cc.type] = {
           name: cc.name || cc.type,
           pins: cc.pins,
           pinLabels: cc.pinLabels || {},
           category: 'Custom',
           eval: evalFn
        };
      } catch (e) {
        console.error(`Failed to compile custom component ${cc.type}:`, e);
      }
    });
  }

  // Seed Nets from Previous Outputs (Feedback Loops)
  if (simData.chips) {
    simData.chips.forEach(chip => {
      const lib = localLib[chip.type];
      if (lib) {
        for (let p = 1; p <= lib.pins; p++) {
           const pinId = `${chip.id}.${p}`;
           const root = uf.find(getParentNodeId(pinId));
           if (netStates[root] === undefined && prevStates[pinId] !== undefined) {
             netStates[root] = prevStates[pinId];
           }
        }
      }
    });
  }

  // 2. Evaluate ICs topologically (Multi-pass sequential evaluation)
  let stable = false;
  let iterations = 0;
  while (!stable && iterations < 10) {
    stable = true;
    iterations++;
    
    if (simData.chips) {
      simData.chips.forEach(chip => {
        const lib = localLib[chip.type];
        if (lib && lib.eval) {
          const pinsProxy = new Proxy([] as number[], {
            get(target, prop) {
              const p = parseInt(prop as string);
              if (isNaN(p)) return undefined;
              const pinId = `${chip.id}.${p}`;
              const root = uf.find(getParentNodeId(pinId));
              return netStates[root] || 0;
            },
            set(target, prop, value) {
              const p = parseInt(prop as string);
              if (isNaN(p)) return true;
              const pinId = `${chip.id}.${p}`;
              const root = uf.find(getParentNodeId(pinId));
              if (netStates[root] !== value) {
                netStates[root] = value;
                stable = false; // State changed, require another pass
              }
              return true;
            }
          });
          
          lib.eval(pinsProxy);
        }
      });
    }
  }

  // 3. Map Net States to Component/Wire targets
  const finalStates: PinStates = { "VCC": 1, "GND": 0 };
  
  if (simData.wires) {
     simData.wires.forEach(w => {
       finalStates[w.from] = netStates[uf.find(getParentNodeId(w.from))] || 0;
       finalStates[w.to] = netStates[uf.find(getParentNodeId(w.to))] || 0;
     });
  }

  if (simData.chips) {
    simData.chips.forEach(chip => {
      const lib = localLib[chip.type] || { pins: 14 };
      for (let p = 1; p <= lib.pins; p++) {
         finalStates[`${chip.id}.${p}`] = netStates[uf.find(getParentNodeId(`${chip.id}.${p}`))] || 0;
      }
    });
  }

  if (simData.inputs) {
    simData.inputs.forEach(inp => {
      finalStates[inp.id] = netStates[uf.find(inp.id)] || 0;
    });
  }
  
  if (simData.outputs) {
    simData.outputs.forEach(outp => {
      finalStates[outp.id] = netStates[uf.find(outp.id)] || 0;
    });
  }

  return finalStates;
}

export function generateTruthTable(simData: CircuitData): string {
  if (!simData.inputs || simData.inputs.length === 0) return 'No inputs to test.';
  if (!simData.outputs || simData.outputs.length === 0) return 'No outputs to measure.';
  
  const numInputs = simData.inputs.length;
  const numPermutations = Math.pow(2, numInputs);
  
  let table = '| ' + simData.inputs.map(i => i.label || i.id).join(' | ') + ' | ' + simData.outputs.map(o => o.label || o.id).join(' | ') + ' |\\n';
  table += '|' + simData.inputs.map(() => '---').join('|') + '|' + simData.outputs.map(() => '---').join('|') + '|\\n';

  for (let i = 0; i < numPermutations; i++) {
    const inputStates: Record<string, number> = {};
    simData.inputs.forEach((inp, idx) => {
      // Extract the bit for this input
      const bit = (i >> (numInputs - 1 - idx)) & 1;
      inputStates[inp.id] = bit;
    });
    
    // Simulate until stable (to resolve any feedback holding states correctly for a fresh input permutation)
    // We run it a few times to simulate time passing for the latch
    let states: PinStates = {};
    for(let tick = 0; tick < 3; tick++) {
      states = simulateCircuit(simData, inputStates, states);
    }
    
    table += '| ' + simData.inputs.map(inp => inputStates[inp.id]).join(' | ') + ' | ' + simData.outputs.map(outp => states[outp.id] || 0).join(' | ') + ' |\\n';
  }
  
  return table;
}

export function useSimulation() {
  const [simData, setSimData] = useState<CircuitData>(defaultJSON);
  const [pinStates, setPinStates] = useState<PinStates>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const evaluateLogic = useCallback(() => {
    setPinStates((prevStates) => {
      // Use current inputs from simData state
      const currentInputStates: Record<string, number> = {};
      if (simData.inputs) {
        simData.inputs.forEach(inp => currentInputStates[inp.id] = inp.state);
      }
      return simulateCircuit(simData, currentInputStates, prevStates);
    });
  }, [simData]);

  const compileCircuit = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as CircuitData;
      setSimData(parsed);
      setCompileError(null);

      const initialStates: PinStates = { "VCC": 1, "GND": 0 };
      if (parsed.inputs) {
        parsed.inputs.forEach(inp => {
          initialStates[inp.id] = inp.state;
        });
      }
      setPinStates(initialStates);
    } catch (e: any) {
      setCompileError(e.message);
    }
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const toggleInputState = useCallback((inputId: string) => {
    if (!isRunning) return;
    setSimData((prevData) => {
      if (!prevData.inputs) return prevData;
      const newInputs = prevData.inputs.map((inp) => {
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

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      evaluateLogic();
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, evaluateLogic]);

  useEffect(() => {
    evaluateLogic();
  }, [simData, evaluateLogic]);

  return {
    simData,
    pinStates,
    isRunning,
    compileError,
    compileCircuit,
    toggleSimulation,
    toggleInputState,
    defaultJSON
  };
}
