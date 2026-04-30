export interface ComponentDef {
  name: string;
  pins: number;
  category: string;
  pinLabels?: Record<number, string>;
  eval: (pins: number[]) => void;
}

// ==========================================
// 1. LOGIC GATE PRIMITIVES (Math Only)
// ==========================================
const GATES = {
  NAND: (a: number, b: number) => (a === 1 && b === 1 ? 0 : 1),
  AND: (a: number, b: number) => (a === 1 && b === 1 ? 1 : 0),
  OR: (a: number, b: number) => (a === 1 || b === 1 ? 1 : 0),
  NOR: (a: number, b: number) => (a === 1 || b === 1 ? 0 : 1),
  XOR: (a: number, b: number) => (a !== b ? 1 : 0),
  XNOR: (a: number, b: number) => (a === b ? 1 : 0),
  NOT: (a: number) => (a === 1 ? 0 : 1),
  BUF: (a: number) => a,
};

// ==========================================
// 2. PINOUT FACTORIES & LABELS
// ==========================================
// Note: The `pins` array passed to `eval` is 1-indexed. pins[1] is physical pin 1.

// Standard 74-Series Quad 2-Input (7400, 7408, 7432, 7486)
const ttlQuad2InLabels: Record<number, string> = {
  1: "1A", 2: "1B", 3: "1Y", 4: "2A", 5: "2B", 6: "2Y", 7: "GND",
  8: "3Y", 9: "3A", 10: "3B", 11: "4Y", 12: "4A", 13: "4B", 14: "VCC"
};
const ttlQuad2InEval = (gate: (a: number, b: number) => number) => (pins: number[]) => {
  pins[3] = gate(pins[1], pins[2]);
  pins[6] = gate(pins[4], pins[5]);
  pins[8] = gate(pins[9], pins[10]);
  pins[11] = gate(pins[12], pins[13]);
};

// 74LS02 Quad 2-Input NOR (Has a backwards pinout!)
const ttlQuad2InNorLabels: Record<number, string> = {
  1: "1Y", 2: "1A", 3: "1B", 4: "2Y", 5: "2A", 6: "2B", 7: "GND",
  8: "3A", 9: "3B", 10: "3Y", 11: "4A", 12: "4B", 13: "4Y", 14: "VCC"
};
const ttlQuad2InNorEval = (gate: (a: number, b: number) => number) => (pins: number[]) => {
  pins[1] = gate(pins[2], pins[3]);
  pins[4] = gate(pins[5], pins[6]);
  pins[10] = gate(pins[8], pins[9]);
  pins[13] = gate(pins[11], pins[12]);
};

// Standard 74-Series Hex 1-Input (7404 NOT, 7414)
const ttlHex1InLabels: Record<number, string> = {
  1: "1A", 2: "1Y", 3: "2A", 4: "2Y", 5: "3A", 6: "3Y", 7: "GND",
  8: "4Y", 9: "4A", 10: "5Y", 11: "5A", 12: "6Y", 13: "6A", 14: "VCC"
};
const ttlHex1InEval = (gate: (a: number) => number) => (pins: number[]) => {
  pins[2] = gate(pins[1]);
  pins[4] = gate(pins[3]);
  pins[6] = gate(pins[5]);
  pins[8] = gate(pins[9]);
  pins[10] = gate(pins[11]);
  pins[12] = gate(pins[13]);
};

// Standard CMOS 4000-Series Quad 2-Input (CD4011, CD4081, CD4071)
// CMOS uses a different physical layout than TTL!
const cmosQuad2InLabels: Record<number, string> = {
  1: "1A", 2: "1B", 3: "1Y", 4: "2Y", 5: "2A", 6: "2B", 7: "VSS",
  8: "3A", 9: "3B", 10: "3Y", 11: "4Y", 12: "4A", 13: "4B", 14: "VDD"
};
const cmosQuad2InEval = (gate: (a: number, b: number) => number) => (pins: number[]) => {
  pins[3] = gate(pins[1], pins[2]);
  pins[4] = gate(pins[5], pins[6]);
  pins[10] = gate(pins[8], pins[9]);
  pins[11] = gate(pins[12], pins[13]);
};

// ==========================================
// 3. INITIALIZE INVENTORY LISTS
// ==========================================
const TTL_14 = ['7400', '7402', '7403', '7404', '7405', '7408', '7410', '7411', '7414', '7420', '7421', '7432', '7474', '7486', '74107', '74112', '74125A', '74126A', '74132'];
const TTL_16 = ['7442', '7447', '7454', '7485', '7490', '7495B', '74123', '74138', '74139', '74148', '74151', '74161', '74173', '74191', '74253', '74257', '74393', '74670', '74283A'];
const TTL_20 = ['74273', '74299', '74373', '74374'];

const CMOS_14 = ['CD4001', 'CD4011', 'CD4012', 'CD4013', 'CD4023', 'CD4030', 'CD4049', 'CD4050', 'CD4066', 'CD4070', 'CD4071', 'CD4072', 'CD4075', 'CD4077', 'CD4081', 'CD4093', 'CD40106'];
const CMOS_16 = ['CD4014', 'CD4017', 'CD4022', 'CD4027', 'CD4028', 'CD4029', 'CD4035', 'CD4040', 'CD4047', 'CD4051', 'CD4503', 'CD4511', 'CD4512'];

const library: Record<string, ComponentDef> = {};

// Helper to quickly generate "dumb" placeholders for chips lacking internal logic yet
const generatePlaceholders = (prefix: string, ids: string[], pins: number, category: string) => {
  ids.forEach(id => {
    // Format 74xx to 74LSxx smoothly
    const formattedId = prefix === '74LS' ? `74LS${id.replace(/^74/, '')}` : id;
    library[formattedId] = {
      name: formattedId,
      pins,
      category,
      eval: () => { } // No-op placeholder
    };
  });
};

// Generate base placeholders
generatePlaceholders('74LS', TTL_14, 14, '74-Series TTL');
generatePlaceholders('74LS', TTL_16, 16, '74-Series TTL');
generatePlaceholders('74LS', TTL_20, 20, '74-Series TTL');
generatePlaceholders('', CMOS_14, 14, '4000-Series CMOS');
generatePlaceholders('', CMOS_16, 16, '4000-Series CMOS');

// ==========================================
// 4. INJECT SMART COMPONENTS
// ==========================================
// Helper to overwrite placeholders with fully functional, logic-aware components
const defineIC = (
  id: string,
  name: string,
  category: string,
  labels: Record<number, string>,
  evalFn: (pins: number[]) => void
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
// 5. PASSIVES & OUTPUTS
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

// Export the fully assembled dictionary
export const ComponentLibrary = library;