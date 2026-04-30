'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { OnboardingTour } from './OnboardingTour';

interface HeaderProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onCompile: () => void;
  compileError: string | null;
}

export default function Header({ isRunning, onToggleSimulation, onCompile, compileError }: HeaderProps) {
  const { t, lang, setLang } = useI18n();
  const [tourOpen, setTourOpen] = useState(false);

  const copyAIPrompt = () => {
    // AI prompt is always in English for best AI model compatibility
    const prompt = `You are an Expert Electrical Engineering Assistant. I am building a highly advanced JSON-driven digital logic simulator. You will design physical breadboard circuits for me by generating strict JSON payloads.

Your generated JSON must perfectly match this schema and adhere to the physical realities of a breadboard.

### SCHEMATIC JSON STRUCTURE:
\`\`\`json
{
  "boards": 1,
  "chips": [
    { "id": "U1", "type": "74LS00", "board": 0, "col": 15 }
  ],
  "inputs": [
    { "id": "SW_A", "label": "Switch A", "board": 0, "col": 2, "state": 0 }
  ],
  "outputs": [
    { "id": "LED_1", "label": "Output 1", "board": 0, "col": 50 }
  ],
  "wires": [
    { "id": "w1", "from": "VCC", "to": "U1.14", "color": "#e84118" },
    { "id": "w2", "from": "GND", "to": "U1.7",  "color": "#2f3640" },
    { "id": "w3", "from": "SW_A", "to": "U1.1", "color": "#fd79a8" }
  ],
  "componentDefinitions": {
    "MY_CHIP": {
      "name": "Custom 2-Input AND",
      "pins": 8,
      "pinLabels": { "1": "A", "2": "B", "3": "Y", "4": "GND", "5": "NC", "6": "NC", "7": "NC", "8": "VCC" },
      "eval": "pins[3] = (pins[1] === 1 && pins[2] === 1) ? 1 : 0;"
    }
  }
}
\`\`\`

### STRICT RULES FOR CIRCUIT GENERATION:

1. **POWER DISTRIBUTION IS MANDATORY**: Every chip MUST have VCC and GND pins explicitly wired.
   - 74-series TTL 14-pin: VCC=pin14, GND=pin7.
   - CMOS 4000-series 14-pin: VDD=pin14, VSS=pin7.
   - 16-pin chips: VCC=pin16, GND=pin8.
   
2. **BREADBOARD LAYOUT**: 60 columns (0–59). Inputs left (col 1–10), chips center (col 15–45, 10-col spacing), outputs right (col 50+).

3. **WIRE COLORS**: Power=#e84118, GND=#2f3640, Inputs=#0984e3/#fd79a8, Internal=#e1b12c, Outputs=#4cd137.

4. **UNIQUE IDs**: Every wire needs a unique "id". Every chip, input, and output needs a unique "id".

5. **CUSTOM COMPONENTS via componentDefinitions**: For any chip not in the standard TTL/CMOS library, define it under "componentDefinitions" (keyed object, NOT an array).
   - "eval" is a JS string with access to 1-indexed "pins" array AND "state" object for persistent memory.
   - Always coerce outputs to exactly 1 or 0: (condition) ? 1 : 0.
   - For edge-triggered logic: use "state.prevCLK" to detect rising edges.

Output ONLY the raw JSON object. No markdown, no explanation. Just the JSON.`;
    navigator.clipboard.writeText(prompt);
    alert(lang === 'pt' ? 'Prompt IA copiado!' : 'AI Prompt copied!');
  };

  return (
    <>
      <header data-tour="header">
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
          {t.appTitle}
        </h1>

        <div className="controls">
          {/* Status indicator */}
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px',
            background: compileError ? 'rgba(214,48,49,0.2)' : isRunning ? 'rgba(0,184,148,0.2)' : 'rgba(255,255,255,0.1)',
            color: compileError ? '#ff7675' : isRunning ? '#55efc4' : '#b2bec3',
            border: `1px solid ${compileError ? '#d63031' : isRunning ? '#00b894' : 'rgba(255,255,255,0.1)'}`,
          }}>
            {compileError ? `${t.statusError}: ${compileError.slice(0, 30)}` : isRunning ? t.statusRunning : t.statusStopped}
          </span>

          <button id="btn-prompt" data-tour="btn-prompt" onClick={copyAIPrompt} style={{ background: '#6c5ce7', color: 'white' }}>
            {t.btnAIPrompt}
          </button>

          <button id="btn-compile" onClick={onCompile}>
            {t.btnCompile}
          </button>

          <button
            id="btn-play"
            className={isRunning ? 'active' : ''}
            onClick={onToggleSimulation}
          >
            {isRunning ? t.btnStop : t.btnRun}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            title="Toggle language / Alternar idioma"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: '6px',
              padding: '6px 10px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700,
            }}
          >
            {t.langToggle}
          </button>

          {/* Help button */}
          <button
            id="btn-help"
            onClick={() => setTourOpen(true)}
            title={t.btnHelp}
            style={{
              background: 'rgba(162,155,254,0.2)',
              border: '1px solid rgba(162,155,254,0.4)',
              color: '#a29bfe', borderRadius: '6px',
              padding: '6px 12px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
            }}
          >
            {t.btnHelp}
          </button>
        </div>
      </header>

      {/* Onboarding tour — forced open when user clicks Help */}
      {tourOpen && <OnboardingTour forceOpen onClose={() => setTourOpen(false)} />}

      {/* Auto-shown on first visit (forceOpen = false) */}
      {!tourOpen && <OnboardingTour />}
    </>
  );
}
