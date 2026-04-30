'use client';

import React from 'react';

interface HeaderProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onCompile: () => void;
  compileError: string | null;
}

export default function Header({
  isRunning,
  onToggleSimulation,
  onCompile,
  compileError,
}: HeaderProps) {
  const copyAIPrompt = () => {
    const prompt = `You are an Expert Electrical Engineering Assistant. I am building a highly advanced JSON-driven digital logic simulator. You will design physical breadboard circuits for me by generating strict JSON payloads.

Your generated JSON must perfectly match this schema and adhere to the physical realities of a breadboard.

### SCHEMATIC JSON STRUCTURE:
\`\`\`json
{
  "boards": 1,
  "chips": [
    { "id": "U1", "type": "74LS00", "board": 0, "col": 5 }
  ],
  "inputs": [
    { "id": "SW_A", "label": "Switch A", "board": 0, "col": 0, "state": 0 }
  ],
  "outputs": [
    { "id": "LED_1", "label": "Output 1", "board": 0, "col": 30 }
  ],
  "wires": [
    { "id": "w1", "from": "VCC", "to": "U1.14", "color": "#e84118" },
    { "id": "w2", "from": "GND", "to": "U1.7", "color": "#2f3640" },
    { "id": "w3", "from": "SW_A", "to": "U1.1", "color": "#fd79a8" }
  ],
  "customComponents": [
    {
      "type": "CUSTOM_OR",
      "name": "Dual 2-Input OR",
      "pins": 8,
      "pinLabels": { "1": "1A", "2": "1B", "3": "1Y", "4": "GND", "5": "2A", "6": "2B", "7": "2Y", "8": "VCC" },
      "eval": "pins[3] = (pins[1] === 1 || pins[2] === 1) ? 1 : 0; pins[7] = (pins[5] === 1 || pins[6] === 1) ? 1 : 0;"
    }
  ]
}
\`\`\`

### STRICT RULES FOR CIRCUIT GENERATION:

1. **POWER DISTRIBUTION IS MANDATORY**: 
   - Every single chip MUST have its VCC and GND pins explicitly wired to the global "VCC" and "GND" networks. 
   - Example: If using a 14-pin 74-series TTL logic chip, you MUST include wires from "VCC" to "U1.14" and "GND" to "U1.7".

2. **BREADBOARD LAYOUT & SPACING**:
   - The breadboard has 60 columns (0 to 59).
   - Space your inputs, chips, and outputs logically! Do NOT put everything on \`"col": 0\`.
   - Put inputs on the left (\`col: 1-10\`), chips in the middle (\`col: 15-45\`), and outputs on the right (\`col: 50+\`).
   - If using multiple chips, leave at least 10 columns of space between them (e.g., U1 at \`col: 15\`, U2 at \`col: 25\`).

3. **WIRE IDENTIFIERS & COLORS**:
   - Every wire MUST have a unique \`"id"\` (e.g., "w1", "w2").
   - Use meaningful \`"color"\` hex codes to represent the wire's function: Power (#e84118), Ground (#2f3640), Inputs (#0984e3, #fd79a8), Internal Logic (#e1b12c), and Outputs (#4cd137).

4. **CUSTOM COMPONENTS STRICT REQUIREMENTS**:
   - If I ask for a component that isn't standard TTL/CMOS, you MUST define it in \`customComponents\`.
   - \`pins\`: Must be an EVEN number.
   - \`eval\`: A raw JavaScript string. It accesses a 1-indexed \`pins\` array. YOU MUST NEVER ASSIGN UNDEFINED OR NULL. ALWAYS strictly coerce values to \`1\` or \`0\`.
   - The engine handles floating inputs safely (unwired pins evaluate to \`0\`). Do not crash the eval string. Example: \`pins[3] = (pins[1] === 1 && pins[2] === 1) ? 1 : 0;\`

When I ask you to build a circuit, output ONLY the valid JSON payload. No markdown blocks, no conversational text. Just the JSON object.`;
    navigator.clipboard.writeText(prompt);
    alert('AI Builder Prompt copied to clipboard!');
  };

  return (
    <header>
      <h1>JSON-Driven Digital Simulator</h1>
      <div className="controls">
        <span
          id="status"
          style={{
            marginRight: '20px',
            color: compileError ? 'var(--danger)' : 'var(--success)',
            fontWeight: 600,
          }}
        >
          {compileError ? `JSON Error: ${compileError}` : isRunning ? 'Running...' : 'Stopped'}
        </span>
        <button id="btn-prompt" onClick={copyAIPrompt} style={{ background: '#6c5ce7', color: 'white', marginRight: '10px' }}>
          🤖 Copy AI Prompt
        </button>
        <button id="btn-compile" onClick={onCompile}>
          Compile JSON
        </button>
        <button
          id="btn-play"
          className={isRunning ? 'active' : ''}
          onClick={onToggleSimulation}
        >
          {isRunning ? '⏸ Stop Simulation' : '▶ Run Simulation'}
        </button>
      </div>
    </header>
  );
}
