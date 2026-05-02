// ==========================================
// ComponentDef — now supports stateful eval
// The `state` object is a mutable per-chip dictionary persisted across ticks.
// `sysTick` provides deterministic, globally-synced oscillation.
// ==========================================
export interface ComponentDef {
  name: string;
  pins: number;
  category: string;
  pinLabels?: Record<number, string>;
  eval: (pins: number[], state: Record<string, any>, sysTick?: number) => void;
}

// ==========================================
// 1. LOGIC GATE PRIMITIVES (Defensively Cast)
// ==========================================
const GATES = {
  NAND: (a: number, b: number) => ((a || 0) === 1 && (b || 0) === 1 ? 0 : 1),
  AND: (a: number, b: number) => ((a || 0) === 1 && (b || 0) === 1 ? 1 : 0),
  OR: (a: number, b: number) => ((a || 0) === 1 || (b || 0) === 1 ? 1 : 0),
  NOR: (a: number, b: number) => ((a || 0) === 1 || (b || 0) === 1 ? 0 : 1),
  XOR: (a: number, b: number) => ((a || 0) !== (b || 0) ? 1 : 0),
  XNOR: (a: number, b: number) => ((a || 0) === (b || 0) ? 1 : 0),
  NOT: (a: number) => ((a || 0) === 1 ? 0 : 1),
  BUF: (a: number) => (a || 0),
};

// ==========================================
// 2. PINOUT FACTORIES & LABELS
// ==========================================

// Standard 74-Series Quad 2-Input (7400, 7408, 7432, 7486)
const ttlQuad2InLabels: Record<number, string> = {
  1: "1A", 2: "1B", 3: "1Y", 4: "2A", 5: "2B", 6: "2Y", 7: "GND",
  8: "3Y", 9: "3A", 10: "3B", 11: "4Y", 12: "4A", 13: "4B", 14: "VCC"
};
const ttlQuad2InEval = (gate: (a: number, b: number) => number) => (pins: number[], _state: Record<string, any>, _sysTick?: number) => {
  pins[3] = gate(pins[1], pins[2]);
  pins[6] = gate(pins[4], pins[5]);
  pins[8] = gate(pins[9], pins[10]);
  pins[11] = gate(pins[12], pins[13]);
};

// 74LS02 Quad 2-Input NOR
const ttlQuad2InNorLabels: Record<number, string> = {
  1: "1Y", 2: "1A", 3: "1B", 4: "2Y", 5: "2A", 6: "2B", 7: "GND",
  8: "3A", 9: "3B", 10: "3Y", 11: "4A", 12: "4B", 13: "4Y", 14: "VCC"
};
const ttlQuad2InNorEval = (gate: (a: number, b: number) => number) => (pins: number[], _state: Record<string, any>, _sysTick?: number) => {
  pins[1] = gate(pins[2], pins[3]);
  pins[4] = gate(pins[5], pins[6]);
  pins[10] = gate(pins[8], pins[9]);
  pins[13] = gate(pins[11], pins[12]);
};

// Standard 74-Series Hex 1-Input (7404, 7414)
const ttlHex1InLabels: Record<number, string> = {
  1: "1A", 2: "1Y", 3: "2A", 4: "2Y", 5: "3A", 6: "3Y", 7: "GND",
  8: "4Y", 9: "4A", 10: "5Y", 11: "5A", 12: "6Y", 13: "6A", 14: "VCC"
};
const ttlHex1InEval = (gate: (a: number) => number) => (pins: number[], _state: Record<string, any>, _sysTick?: number) => {
  pins[2] = gate(pins[1]);
  pins[4] = gate(pins[3]);
  pins[6] = gate(pins[5]);
  pins[8] = gate(pins[9]);
  pins[10] = gate(pins[11]);
  pins[12] = gate(pins[13]);
};

// Standard CMOS 4000-Series Quad 2-Input (CD4001, CD4011, CD4070, CD4071, CD4081)
const cmosQuad2InLabels: Record<number, string> = {
  1: "1A", 2: "1B", 3: "1Y", 4: "2Y", 5: "2A", 6: "2B", 7: "VSS",
  8: "3A", 9: "3B", 10: "3Y", 11: "4Y", 12: "4A", 13: "4B", 14: "VDD"
};
const cmosQuad2InEval = (gate: (a: number, b: number) => number) => (pins: number[], _state: Record<string, any>, _sysTick?: number) => {
  pins[3] = gate(pins[1], pins[2]);
  pins[4] = gate(pins[5], pins[6]);
  pins[10] = gate(pins[8], pins[9]);
  pins[11] = gate(pins[12], pins[13]);
};

// ==========================================
// 3. INITIALIZE INVENTORY LISTS (Datasheet Verified)
// ==========================================
// 7490, 7495B, 74393, 7454 fixed and moved to TTL_14
const TTL_14 = ['7400', '7402', '7403', '7404', '7405', '7408', '7410', '7411', '7414', '7420', '7421', '7432', '7454', '7474', '7486', '7490', '7495B', '74107', '74125A', '74126A', '74132', '74393'];
// 74112 fixed and moved to TTL_16
const TTL_16 = ['7442', '7447', '7485', '74112', '74123', '74138', '74139', '74148', '74151', '74161', '74173', '74191', '74253', '74257', '74283A', '74670'];
const TTL_20 = ['74273', '74299', '74373', '74374'];
const CMOS_14 = ['CD4001', 'CD4011', 'CD4012', 'CD4013', 'CD4023', 'CD4030', 'CD4066', 'CD4070', 'CD4071', 'CD4072', 'CD4075', 'CD4077', 'CD4081', 'CD4093', 'CD40106'];
// CD4049, CD4050 fixed and moved to CMOS_16
const CMOS_16 = ['CD4014', 'CD4017', 'CD4022', 'CD4027', 'CD4028', 'CD4029', 'CD4035', 'CD4040', 'CD4049', 'CD4050', 'CD4051', 'CD4503', 'CD4511', 'CD4512'];

const library: Record<string, ComponentDef> = {};

const generatePlaceholders = (prefix: string, ids: string[], pins: number, category: string) => {
  ids.forEach(id => {
    const formattedId = prefix === '74LS' ? `74LS${id.replace(/^74/, '')}` : id;
    library[formattedId] = {
      name: formattedId,
      pins,
      category,
      eval: () => { } // No-op placeholder
    };
  });
};

generatePlaceholders('74LS', TTL_14, 14, '74-Series TTL');
generatePlaceholders('74LS', TTL_16, 16, '74-Series TTL');
generatePlaceholders('74LS', TTL_20, 20, '74-Series TTL');
generatePlaceholders('', CMOS_14, 14, '4000-Series CMOS');
generatePlaceholders('', CMOS_16, 16, '4000-Series CMOS');

// ==========================================
// 4. INJECT SMART COMPONENTS
// ==========================================
const defineIC = (
  id: string,
  name: string,
  category: string,
  labels: Record<number, string>,
  evalFn: (pins: number[], state: Record<string, any>, sysTick?: number) => void
) => {
  if (library[id]) {
    library[id].name = name;
    library[id].pinLabels = labels;
    library[id].eval = evalFn;
  }
};

// --- TTL Smart Implementations ---
defineIC('74LS00', 'Quad 2-Input NAND', '74-Series TTL', ttlQuad2InLabels, ttlQuad2InEval(GATES.NAND));
defineIC('74LS02', 'Quad 2-Input NOR', '74-Series TTL', ttlQuad2InNorLabels, ttlQuad2InNorEval(GATES.NOR));
defineIC('74LS04', 'Hex Inverter (NOT)', '74-Series TTL', ttlHex1InLabels, ttlHex1InEval(GATES.NOT));
defineIC('74LS08', 'Quad 2-Input AND', '74-Series TTL', ttlQuad2InLabels, ttlQuad2InEval(GATES.AND));
defineIC('74LS32', 'Quad 2-Input OR', '74-Series TTL', ttlQuad2InLabels, ttlQuad2InEval(GATES.OR));
defineIC('74LS86', 'Quad 2-Input XOR', '74-Series TTL', ttlQuad2InLabels, ttlQuad2InEval(GATES.XOR));

// --- CMOS Smart Implementations ---
defineIC('CD4001', 'Quad 2-Input NOR', '4000-Series CMOS', cmosQuad2InLabels, cmosQuad2InEval(GATES.NOR));
defineIC('CD4011', 'Quad 2-Input NAND', '4000-Series CMOS', cmosQuad2InLabels, cmosQuad2InEval(GATES.NAND));
defineIC('CD4070', 'Quad 2-Input XOR', '4000-Series CMOS', cmosQuad2InLabels, cmosQuad2InEval(GATES.XOR));
defineIC('CD4071', 'Quad 2-Input OR', '4000-Series CMOS', cmosQuad2InLabels, cmosQuad2InEval(GATES.OR));
defineIC('CD4081', 'Quad 2-Input AND', '4000-Series CMOS', cmosQuad2InLabels, cmosQuad2InEval(GATES.AND));

// ==========================================
// 5. SEQUENTIAL / EDGE-TRIGGERED COMPONENTS
// ==========================================

const cd4027Labels: Record<number, string> = {
  1: "Q1", 2: "Q̄1", 3: "CLK1", 4: "R1", 5: "K1", 6: "J1", 7: "S1", 8: "VSS",
  9: "S2", 10: "J2", 11: "K2", 12: "R2", 13: "CLK2", 14: "Q̄2", 15: "Q2", 16: "VDD"
};

defineIC('CD4027', 'Dual JK Flip-Flop', '4000-Series CMOS', cd4027Labels, (pins, state) => {
  // ── Flip-Flop 1 ──────────────────────────────────────────────────────────
  const CLK1 = pins[3];
  const J1 = pins[6], K1 = pins[5], S1 = pins[7], R1 = pins[4];

  // Capture J & K while clock is LOW (setup-time isolation)
  if (CLK1 === 0) {
    state.capturedJ1 = J1;
    state.capturedK1 = K1;
  }

  let q1 = state.Q1 ?? 0;

  // Asynchronous overrides
  if (S1 === 1 && R1 === 1) {
    // Datasheet exact: S=1 and R=1 forces both outputs HIGH
    pins[1] = 1;
    pins[2] = 1;
  } else if (S1 === 1) {
    state.Q1 = 1;
    pins[1] = 1;
    pins[2] = 0;
  } else if (R1 === 1) {
    state.Q1 = 0;
    pins[1] = 0;
    pins[2] = 1;
  } else {
    // Synchronous Rising Edge execution
    if (CLK1 === 1 && state.prevCLK1 === 0) {
      const J = state.capturedJ1 ?? J1;
      const K = state.capturedK1 ?? K1;
      if (J === 0 && K === 1) { state.Q1 = 0; }
      else if (J === 1 && K === 0) { state.Q1 = 1; }
      else if (J === 1 && K === 1) { state.Q1 = state.Q1 === 0 ? 1 : 0; }
    }
    q1 = state.Q1 ?? 0;
    pins[1] = q1;
    pins[2] = q1 === 1 ? 0 : 1;
  }
  state.prevCLK1 = CLK1;

  // ── Flip-Flop 2 ──────────────────────────────────────────────────────────
  const CLK2 = pins[13];
  const J2 = pins[10], K2 = pins[11], S2 = pins[9], R2 = pins[12];

  if (CLK2 === 0) {
    state.capturedJ2 = J2;
    state.capturedK2 = K2;
  }

  let q2 = state.Q2 ?? 0;

  if (S2 === 1 && R2 === 1) {
    pins[15] = 1;
    pins[14] = 1;
  } else if (S2 === 1) {
    state.Q2 = 1;
    pins[15] = 1;
    pins[14] = 0;
  } else if (R2 === 1) {
    state.Q2 = 0;
    pins[15] = 0;
    pins[14] = 1;
  } else {
    if (CLK2 === 1 && state.prevCLK2 === 0) {
      const J = state.capturedJ2 ?? J2;
      const K = state.capturedK2 ?? K2;
      if (J === 0 && K === 1) { state.Q2 = 0; }
      else if (J === 1 && K === 0) { state.Q2 = 1; }
      else if (J === 1 && K === 1) { state.Q2 = state.Q2 === 0 ? 1 : 0; }
    }
    q2 = state.Q2 ?? 0;
    pins[15] = q2;
    pins[14] = q2 === 1 ? 0 : 1;
  }
  state.prevCLK2 = CLK2;
});

// ==========================================
// 6. OSCILLATORS & TIMING ICs
// ==========================================

const cd4047Labels: Record<number, string> = {
  1: "C−", 2: "RC", 3: "C+", 4: "/ASTR", 5: "ASTR", 6: "+TRG", 7: "VSS",
  8: "−TRG", 9: "EXT", 10: "Q", 11: "/Q", 12: "QNCH", 13: "OSC", 14: "VDD"
};

library['CD4047'] = {
  name: 'CD4047B Astable/Monostable Multivibrator',
  pins: 14,
  category: '4000-Series CMOS',
  pinLabels: cd4047Labels,
  eval: (pins, state, sysTick) => {
    // Astable mode requires: ASTABLE (pin5) = HIGH AND /ASTABLE (pin4) = LOW
    const astableEnabled = pins[5] === 1 && pins[4] === 0;

    if (!astableEnabled) {
      state.Q = 0;
      pins[10] = 0;  // Q
      pins[11] = 1;  // /Q
      pins[13] = 0;  // OSC_OUT
      return;
    }

    // Deterministic simulation via global sync (Removes dangerous Date.now() logic)
    const currentTick = sysTick ?? 0;

    // OSC_OUT runs at exactly 2x the frequency of Q and /Q
    const oscPhase = currentTick % 10;
    const qPhase = currentTick % 20;

    pins[13] = oscPhase < 5 ? 1 : 0;        // OSC_OUT toggles every 5 ticks
    pins[10] = qPhase < 10 ? 1 : 0;         // Q toggles every 10 ticks
    pins[11] = qPhase < 10 ? 0 : 1;         // /Q is the inverse
  }
};

// ==========================================
// 7. PASSIVES & OUTPUTS
// ==========================================
const createSimple = (name: string, pins: number, category: string): ComponentDef => ({
  name, pins, category, eval: () => { }
});

library['NE555'] = createSimple('NE555 Timer', 8, 'Passives & ICs');
library['SPST'] = createSimple('SPST Push Button', 4, 'Passives & ICs');
library['RESISTOR'] = createSimple('Resistor', 2, 'Passives');
library['CAPACITOR'] = createSimple('Capacitor', 2, 'Passives');
library['7SEG'] = createSimple('Common Anode 7-Segment', 10, 'Outputs');
library['LED'] = createSimple('LED Indicator', 2, 'Outputs');

export const ComponentLibrary = library;