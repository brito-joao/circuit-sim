# ⚡ Digital Logic Simulator

> A JSON-driven, browser-based digital breadboard simulator built with **Next.js 16 + React 19**. Design and simulate real TTL/CMOS circuits using an AI chatbot or step through your wiring one wire at a time — no hardware required.

**Live Demo:** [https://circuit-sim-xi.vercel.app/](https://circuit-sim-xi.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📺 What It Does

This simulator renders a **physical breadboard** on screen and evaluates every chip, wire, input switch, and LED output in real time. You describe the circuit in JSON — the engine wires everything up and starts propagating logic signals at 10 Hz (100 ms per tick).

Two workflows are supported:

| Workflow | Best For |
|---|---|
| **🤖 AI-Assisted** — copy the built-in prompt, paste to ChatGPT/Claude, paste the JSON back | Getting a working circuit in 60 seconds |
| **🔧 Step-by-Step Build** — place the AI-generated JSON and reveal wires one at a time | Learning how each connection contributes |

---

## 🚀 Getting Started

```bash
git clone https://github.com/brito-joao/circuit-sim.git
cd circuit-sim
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## 🗺️ Full Feature Reference

### 1. The Breadboard Canvas

The SVG canvas renders a physically accurate solderless breadboard with:

- **White hole grid** — columns 0–59, two bus rows (top/bottom) per board
- **Multi-board support** — the `boards` key in JSON stacks boards vertically; boards are separated by a visible padding gap
- **Chip DIP outlines** — chips are drawn as a black DIP rectangle centered over the hole columns they occupy, with the correct pin count per side (7-pin, 8-pin, 10-pin half depending on `pins` in the component definition)
- **Colour-coded wires** — every wire is an SVG quadratic Bézier curve; the colour is taken directly from the `color` field in JSON, falling back to `#9c88ff`

#### Canvas Interactions

| Action | How |
|---|---|
| **Pan** | Click-drag anywhere on the board |
| **Zoom** | Mouse-wheel (scroll) — zooms toward the cursor |
| **Zoom In / Out / Reset** | Toolbar buttons `+` `−` `Resetar` |
| **Drag wire endpoints** | Click and drag the round handle at either end of a wire — snaps to the nearest hole within 20 px on mouse-up, updating the live JSON |
| **Hover over a chip** | Shows a tooltip with the chip name and full pin number table |

---

### 2. The Simulation Engine (`useSimulation.ts`)

The engine is a two-stage pipeline running every 100 ms when the simulation is active.

#### Stage A — Global System Clock

A `simulationTick` integer increments in a `setInterval` (100 ms). This is the **only place time advances**. The interval fires `setSimulationTick(t + 1)`, which triggers a React `useEffect`, which calls `evaluateLogic()`.

This two-step design means every chip eval always reads the same frozen tick — **oscillator components cannot accumulate spurious counts** from the relaxation loop firing multiple times per tick.

#### Stage B — `simulateCircuit` (the core engine)

Called once per tick with the frozen `sysTick` value. It runs five steps:

```
1. Build Electrical Nets  (Union-Find)
2. Seed nets from inputs & previous pin states
3. Stable-State Relaxation Loop  (max 10 passes, double-buffered)
4. Map final net states to named wire targets
5. Return PinStates for React rendering
```

**Step 1 — Union-Find Net Solver**

Every `wire` in the JSON unions its `from` and `to` breadboard coordinates into an *equipotential net*. This is identical to real copper traces on a PCB: once two holes are connected, they are electrically the same node regardless of how they were reached. The engine uses path-compressed Union-Find, giving effectively O(1) net lookup.

**Step 3 — Stable-State Relaxation with Per-Pass Double Buffering**

This is the most important part of the engine. Digital hardware evaluates all chips *simultaneously* — no chip should read another chip's output that was written in the same clock cycle. The engine enforces this with:

```
while (!stable && iterations < 10) {
  passSnapshot = { ...netStates };   // ← FREEZE: every chip reads from here
  for each chip:
    GET pins[n]  →  passSnapshot[net_root]   (frozen)
    SET pins[n]  →  netStates[net_root]      (accumulator)
    stable = false  if write differs from passSnapshot
}
```

- **Combinational logic** (AND/OR/NAND chains) converges across multiple passes — one extra pass per gate depth, settling well within the 10-pass budget for any practical educational circuit.
- **Shift registers** (cascaded flip-flops) are safe: FF2 reads FF1's output from `passSnapshot` (old value), not from `netStates` (new value written in this pass). This matches real hardware.
- **SR Latches** work because the cross-coupled feedback resolves across passes, not within one.

**Sequential Logic — `sysTick` injection**

Every chip's `eval` function receives three arguments:

```typescript
eval(pins, state, sysTick)
```

| Argument | Description |
|---|---|
| `pins` | Proxy over the double-buffered net states |
| `state` | Persistent per-chip memory object (survives across ticks, reset on recompile) |
| `sysTick` | Frozen global clock integer — same value for all chips, all passes of this tick |

Oscillator components read `sysTick` to produce a square wave without mutating any counter:

```javascript
// 555 Timer / custom astable oscillator:
pins[3] = (pins[4] === 0) ? 0 : ((sysTick % 4 < 2) ? 1 : 0);
```

**CD4027 — Master-Slave JK Race Fix**

The built-in CD4027 dual JK flip-flop implements the real master-slave capture pattern:

1. While CLK = LOW → sample J and K into `state.capturedJ/K`
2. On the **rising edge** (CLK: 0→1) → use the *captured* values, not the live pin values
3. Always drive Q/Q̄ from committed `state.Q`

This means cascaded flip-flops in a shift register correctly see only last-tick's outputs — even before the double-buffer was in place.

---

### 3. Circuit Description Language (JSON Schema)

A complete circuit is described as a single JSON object:

```jsonc
{
  "boards": 1,                     // Number of stacked breadboards (integer)

  "chips": [
    {
      "id": "U1",                  // Unique identifier
      "type": "74LS00",            // Must match a key in ComponentLibrary or componentDefinitions
      "board": 0,                  // Which board (0-indexed)
      "col": 15                    // Left-most column where the chip sits (0–59)
    }
  ],

  "inputs": [
    {
      "id": "SW_A",               // Unique identifier (used in wire "from"/"to")
      "label": "Switch A",        // Human-readable label shown in I/O panel
      "board": 0, "col": 2,       // Breadboard position
      "state": 0                  // Initial state: 0 (LOW) or 1 (HIGH)
    }
  ],

  "outputs": [
    { "id": "LED_1", "label": "Output 1", "board": 0, "col": 50 }
  ],

  "wires": [
    {
      "id": "w1",                 // Unique identifier (used for drag-to-reroute)
      "from": "VCC",              // Source: "VCC", "GND", input ID, or "U1.14"
      "to": "U1.14",              // Destination: same format as "from"
      "color": "#e84118"          // Optional CSS color
    }
  ],

  // Optional: inline custom component definitions (highest priority in engine)
  "componentDefinitions": {
    "MY_DFF": {
      "name": "D Flip-Flop",
      "pins": 8,
      "pinLabels": { "1": "CLK", "2": "D", "3": "Q", "4": "GND",
                     "5": "NC", "6": "NC", "7": "NC", "8": "VCC" },
      "eval": "if (pins[1] === 1 && state.prevCLK === 0) { state.Q = pins[2]; } pins[3] = state.Q ?? 0; state.prevCLK = pins[1];"
    }
  }
}
```

#### Wire Addressing

Wires can connect any of the following target types:

| Target Format | Example | Meaning |
|---|---|---|
| `VCC` / `GND` | `"from": "VCC"` | Power / ground rail |
| Input/Output ID | `"from": "SW_A"` | A named input switch or output LED |
| `ChipId.PinNumber` | `"to": "U1.14"` | Physical pin on a chip (1-indexed) |
| Breadboard coordinate | `"B0_C12_T"` | Board 0, Column 12, Top row |

The engine maps every chip pin to a breadboard coordinate using this formula:

- Pins 1 to N/2 → **bottom row**: `B{board}_C{col + pin - 1}_B`
- Pins N/2+1 to N → **top row**: `B{board}_C{col + (N - pin)}_T`

---

### 4. Built-in Component Library

#### 74-Series TTL — Fully Simulated (Smart Logic)

| Part | Function | Pins |
|---|---|---|
| **74LS00** | Quad 2-Input NAND | 14 |
| **74LS02** | Quad 2-Input NOR (reversed pinout) | 14 |
| **74LS04** | Hex Inverter (NOT) | 14 |
| **74LS08** | Quad 2-Input AND | 14 |
| **74LS32** | Quad 2-Input OR | 14 |
| **74LS86** | Quad 2-Input XOR | 14 |

#### 74-Series TTL — Placeholder (geometry only, no logic)

7402 · 7403 · 7404 · 7405 · 7410 · 7411 · 7414 · 7420 · 7421 · 7432 · 7474 · 7486 · 74107 · 74112 · 74125A · 74126A · 74132 · 7442 · 7447 · 7454 · 7485 · 7490 · 7495B · 74123 · 74138 · 74139 · 74148 · 74151 · 74161 · 74173 · 74191 · 74253 · 74257 · 74393 · 74670 · 74283A · 74273 · 74299 · 74373 · 74374

#### 4000-Series CMOS — Fully Simulated

| Part | Function | Pins |
|---|---|---|
| **CD4001** | Quad 2-Input NOR | 14 |
| **CD4011** | Quad 2-Input NAND | 14 |
| **CD4027** | Dual JK Flip-Flop (rising edge, master-slave) | 16 |
| **CD4047B** | Astable/Monostable Multivibrator | 14 |
| **CD4070** | Quad 2-Input XOR | 14 |
| **CD4071** | Quad 2-Input OR | 14 |
| **CD4081** | Quad 2-Input AND | 14 |

#### 4000-Series CMOS — Placeholder

CD4012 · CD4013 · CD4014 · CD4017 · CD4022 · CD4023 · CD4028 · CD4029 · CD4030 · CD4035 · CD4040 · CD4049 · CD4050 · CD4051 · CD4066 · CD4072 · CD4075 · CD4077 · CD4093 · CD40106 · CD4503 · CD4511 · CD4512

#### Passives & Discrete

`NE555` (8-pin, placeholder) · `SPST` push button · `RESISTOR` · `CAPACITOR` · `7SEG` 7-segment display · `LED` indicator

---

### 5. Custom Component Definitions

Any circuit JSON can include an optional `componentDefinitions` object to define new chip types entirely in JavaScript. The eval string receives:

```javascript
(pins, state, sysTick) => { /* your logic here */ }
```

**Rules for safe eval strings:**

1. Always coerce outputs to `0` or `1` using ternary: `(condition) ? 1 : 0`
2. Use `state.prevCLK` to detect rising/falling edges
3. Never mutate your own tick counter — read `sysTick` instead
4. Input pins are **read-only by convention**; only write to output pins

**Example — D Flip-Flop:**

```javascript
"eval": "if (pins[1] === 1 && state.prevCLK === 0) { state.Q = pins[2]; } pins[3] = state.Q ?? 0; state.prevCLK = pins[1];"
```

**Example — Astable 555 Timer (square wave at sysTick % N):**

```javascript
"eval": "pins[3] = (pins[4] === 0) ? 0 : ((sysTick % 4 < 2) ? 1 : 0);"
```

---

### 6. AI Prompt Workflow

The header contains a **🤖 Prompt IA** button. Clicking it copies a structured system prompt to your clipboard. The prompt tells any LLM exactly how to generate valid circuit JSON for this simulator, including:

- All mandatory power wiring rules per chip family
- Breadboard column layout conventions (inputs left → chips center → outputs right)
- Wire colour conventions
- How to define custom components via `componentDefinitions`
- Instruction to output **raw JSON only** (no markdown fences)

**Full workflow:**

```
1. Click "🤖 Prompt IA"  →  system prompt copied to clipboard
2. Open ChatGPT / Claude / Gemini
3. Paste (Ctrl+V) the prompt, then describe your circuit
4. The AI responds with valid JSON
5. Copy the JSON (Ctrl+A, Ctrl+C)
6. Click the big green "📥 COLAR DA IA" button in the right panel
7. The circuit loads instantly — click "▶ Iniciar Simulação"
```

---

### 7. JSON Editor (Monaco)

The right panel hosts a full **Monaco editor** (the same engine as VS Code) with:

- JSON syntax highlighting and red-squiggle error marking
- Auto-recompile on every keystroke (debounced through `compileCircuit`)
- **Format** button — pretty-prints the JSON with 2-space indentation
- **📋 Copy** — copies the current JSON to clipboard
- **📥 COLAR DA IA / PASTE FROM AI** — the dominant full-width green button; reads from clipboard and immediately recompiles the circuit

On **mobile**, the JSON panel is a plain `<textarea>` for maximum compatibility, with the same prominent paste button at the top.

---

### 8. I/O Channels Panel

Located below the breadboard on desktop, or on the **⚡ E/S** tab on mobile. Shows up to 8 configurable channels plus any additional inputs/outputs from the loaded JSON.

Each channel card has:

- **Mode selector** — None / Button (In) / LED (Out)
- **Label field** — editable name shown on the breadboard
- **State indicator** — a glowing red circle (input, clickable to toggle HIGH/LOW) or a glowing green LED (output, driven by simulation)

Channel changes propagate immediately into the live JSON and trigger a recompile.

---

### 9. Step-by-Step Build Mode (🔧 Montagem Passo a Passo)

Located in the bottom-right overlay of the breadboard. Designed to teach students *how* a circuit is wired, one connection at a time.

| Button | Action |
|---|---|
| **▶ Iniciar Montagem** | Shows only wire #0, hides the rest |
| **→ Próximo Fio** | Reveals the next wire (disabled until started) |
| **👀 Ver Todos os Fios** | Shows all wires at once (exits step mode) |
| **⚡ Ligar Tudo** | Animates through all wires at 100 ms per wire (auto-complete) |

A **progress bar** and **wire counter** (`Fio X de Y`) are shown while in step mode. The currently active wire is labelled: `⚡ Liga: U1.3 → U2.6`.

---

### 10. Debug Mode & Wire Flash

Click **🐛 Modo Debug** in the breadboard toolbar to:

1. **Pause** the 100 ms auto-tick interval
2. Show a pulsing **⏭ Executar Tick** button
3. Each click of Execute Tick:
   - Advances `simulationTick` by 1 (so oscillators step correctly)
   - Runs one full `evaluateLogic()` pass
   - Any wire whose signal **changed** flashes **amber/orange** for 700 ms via the `debugFlash` CSS keyframe animation

This lets you trace logic propagation through complex circuits frame by frame.

---

### 11. Automated Test Bench (🧪)

Located top-left of the breadboard. Provides automated truth-table verification:

1. Paste your **expected truth table** in Markdown or CSV format into the textarea
2. Click **▶ Run Diff** — the engine exhaustively enumerates all `2^N` input combinations (N = number of inputs), runs 3 relaxation ticks per row to let latches settle, and produces the actual truth table
3. Results are shown row-by-row with ✅ / ❌ and per-column mismatch highlighting
4. Click **🤖 Copy Debug for AI** — copies a structured debugging payload including:
   - The expected table
   - The actual table
   - The current full circuit JSON
   - A task instruction asking the AI to diagnose and fix the wiring

---

### 12. X-Ray Mode (🔍 Raio-X)

Toggle from the breadboard toolbar. When active, every chip DIP outline shows its full pin label map inside the chip body — e.g., `1A`, `1B`, `1Y`, `GND`, `VCC`. This lets you verify pin assignments without counting holes.

---

### 13. Interactive Onboarding Tour

A 7-step guided modal appears automatically on the **first visit** (stored in `localStorage` as `logic_sim_onboarding_v3`). Re-open it any time via **❓ Ajuda** in the header.

| Step | Content |
|---|---|
| 0 | Welcome — introduces both learning paths (AI vs. Step-by-Step) |
| 1 | How to copy the AI Prompt (highlights the button with a pulsing ring) |
| 2 | How to talk to the AI and describe a circuit |
| 3 | How to copy the JSON from the AI's response |
| 4 | How to paste the JSON (highlights the big green paste button) |
| 5 | Introduces the Step-by-Step Build Mode panel |
| 6 | Explains all four build mode buttons with a visual key |

Steps 5–6 use a green gradient to visually distinguish the "learning" phase from the "AI" phase.

---

### 14. Internationalisation (i18n)

The app ships with full **English** and **Portuguese** translations covering every visible string. Default language is **Portuguese**. Toggle with the `🇺🇸 EN` / `🇵🇹 PT` button in the header.

The translation system is a zero-dependency React Context (`useI18n()`) backed by `en.ts` and `pt.ts` dictionaries. The AI Prompt is always generated in English for best AI model compatibility regardless of UI language.

---

### 15. Responsive / Mobile Layout

On screens narrower than 768 px, the layout switches to a **three-tab interface**:

| Tab | Content |
|---|---|
| 🔌 Placa | Full-screen interactive breadboard |
| ⚡ E/S | I/O Channels panel (scrollable) |
| 📄 JSON | Big paste button + raw textarea editor |

Touch pan/zoom is supported on the breadboard canvas via standard pointer events.

---

## 🏗️ Project Architecture

```
src/
├── app/
│   ├── layout.tsx          — Root layout: wraps app in LanguageProvider
│   └── page.tsx            — Main page: desktop panel layout + mobile tab layout
│
├── hooks/
│   └── useSimulation.ts    — Engine core: simulateCircuit(), generateTruthTable(),
│                             useSimulation() hook (tick clock, debug mode, pin flash)
│
├── lib/
│   ├── types.ts            — TypeScript interfaces: CircuitData, Wire, Chip, PinStates…
│   ├── componentLibrary.ts — Built-in IC definitions (TTL + CMOS) with eval functions
│   ├── i18n.tsx            — LanguageProvider + useI18n() hook
│   └── translations/
│       ├── en.ts           — English strings
│       └── pt.ts           — Portuguese strings
│
└── components/
    ├── Header.tsx           — App bar: title, status, AI prompt, compile/run, lang, help
    ├── JsonEditor.tsx       — Monaco editor panel with big paste CTA
    ├── OnboardingTour.tsx   — 7-step guided modal with visual illustrations
    │
    └── breadboard/
        ├── Breadboard.tsx         — SVG canvas orchestrator
        ├── useBreadboard.ts       — Pan/zoom, wire drag, theme, build step, auto-wire
        ├── BreadboardBoards.tsx   — Board background & hole grid renderer
        ├── BreadboardChips.tsx    — DIP outline + pin holes + X-Ray labels
        ├── BreadboardWires.tsx    — Bézier wire paths + flow animation + debug flash
        ├── BreadboardInputs.tsx   — Input switch markers on the board
        ├── BreadboardOutputs.tsx  — Output LED markers on the board
        ├── BreadboardControls.tsx — Floating toolbar (zoom, theme, X-ray, edit, debug)
        ├── BreadboardSidebar.tsx  — Side panel wrapper
        ├── BreadboardTooltip.tsx  — Hover tooltip overlay
        ├── DigitalIOPanel.tsx     — I/O channel configurator (below board)
        ├── ComponentPalette.tsx   — Drag-and-drop chip palette (edit mode)
        ├── TestBenchPanel.tsx     — Truth table diff engine + AI debug export
        ├── TruthTableValidator.tsx— Truth table display helper
        ├── LogicAnalyzer.tsx      — Logic analyser overlay (waveform viewer)
        ├── WaveformsOverlay.tsx   — SVG waveform renderer
        ├── breadboardThemes.ts    — Light/dark colour token sets
        └── breadboardUtils.ts     — Coordinate helpers, getCoords(), getAllTargets()
```

---

## 🔬 Engine Design Decisions

### Why Union-Find for nets?

Wires form *equipotential* nodes — if wire A connects pin 1 to hole 5, and wire B connects hole 5 to pin 3, then pin 1 and pin 3 are electrically the same. Union-Find merges these transitively in O(α(N)) ≈ O(1). This means wiring complexity is irrelevant to simulation speed.

### Why per-pass double buffering instead of tick-level?

Freezing nets once per tick would prevent combinational chains from converging (AND → OR → XOR needs to see intermediate values across passes). Freezing per-pass (per relaxation iteration) gives the best of both worlds: combinational logic converges in N passes (one per gate depth), while sequential flip-flops see only the previous pass's state — exactly matching real hardware's simultaneous evaluation model.

### Why `sysTick` instead of `state.tick++`?

If an oscillator component does `state.tick++` inside its eval string, it increments on *every relaxation pass* within a single tick — potentially 10 times per frame. `sysTick` is injected from outside the relaxation loop and is **frozen** for the entire duration of `simulateCircuit()`. Components can safely read it to produce stable, deterministic square waves.

### Why no external state management library?

The entire simulation state lives in a single `useSimulation()` hook using built-in React primitives (`useState`, `useRef`, `useCallback`, `useEffect`). `chipStatesRef` uses a Ref (not state) so edge-triggered flip-flop memory persists across renders without triggering unnecessary re-renders.

---

## 📐 Example Circuit — SR Latch (74LS00 NAND Gates)

```json
{
  "boards": 1,
  "chips": [{ "id": "U1", "type": "74LS00", "board": 0, "col": 15 }],
  "inputs": [
    { "id": "SW_S", "label": "Set (S)",   "board": 0, "col": 5,  "state": 0 },
    { "id": "SW_R", "label": "Reset (R)", "board": 0, "col": 8,  "state": 0 },
    { "id": "SW_EN","label": "Enable",    "board": 0, "col": 11, "state": 1 }
  ],
  "outputs": [
    { "id": "LED_QH", "label": "Q_High", "board": 0, "col": 35 },
    { "id": "LED_QL", "label": "Q_Low",  "board": 0, "col": 39 }
  ],
  "wires": [
    { "id": "w_vcc",      "from": "VCC",   "to": "U1.14",  "color": "#e84118" },
    { "id": "w_gnd",      "from": "GND",   "to": "U1.7",   "color": "#2f3640" },
    { "id": "w_s",        "from": "SW_S",  "to": "U1.9",   "color": "#fd79a8" },
    { "id": "w_r",        "from": "SW_R",  "to": "U1.13",  "color": "#00b894" },
    { "id": "w_en1",      "from": "SW_EN", "to": "U1.10",  "color": "#6c5ce7" },
    { "id": "w_en2",      "from": "SW_EN", "to": "U1.12",  "color": "#6c5ce7" },
    { "id": "w_internal1","from": "U1.8",  "to": "U1.1",   "color": "#e1b12c" },
    { "id": "w_internal2","from": "U1.11", "to": "U1.5",   "color": "#e1b12c" },
    { "id": "w_cross1",   "from": "U1.3",  "to": "U1.4",   "color": "#ffffff" },
    { "id": "w_cross2",   "from": "U1.6",  "to": "U1.2",   "color": "#00cec9" },
    { "id": "w_out1",     "from": "U1.3",  "to": "LED_QH", "color": "#4cd137" },
    { "id": "w_out2",     "from": "U1.6",  "to": "LED_QL", "color": "#0984e3" }
  ]
}
```

This is the default circuit loaded on startup. It demonstrates:
- Cross-coupled feedback (how the relaxation loop resolves memory)
- Power wiring conventions
- Named inputs and outputs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19 |
| Language | TypeScript 5 |
| Code editor | Monaco Editor (`@monaco-editor/react` 4.7) |
| Layout | `react-resizable-panels` 4.10 |
| Styling | Vanilla CSS + inline styles (no Tailwind in runtime) |
| Simulation | Pure TypeScript — zero runtime simulation deps |
| i18n | Zero-dep React Context (no `react-i18next`) |

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

*Built for electrical engineering students who want to understand digital logic without soldering a single component.*
