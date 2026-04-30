export const en = {
  // ── App
  appTitle: 'Digital Logic Simulator',

  // ── Header
  statusRunning: 'Running...',
  statusStopped: 'Stopped',
  statusError: 'JSON Error',
  btnAIPrompt: '🤖 AI Prompt',
  btnCompile: 'Compile JSON',
  btnRun: '▶ Run Simulation',
  btnStop: '⏸ Stop Simulation',
  btnHelp: '❓ Help',
  langToggle: '🇵🇹 PT',

  // ── Breadboard Controls
  btnZoomIn: '+',
  btnZoomOut: '−',
  btnReset: 'Reset',
  btnXRayOn: '🔍 X-Ray ON',
  btnXRayOff: '🔍 X-Ray OFF',
  btnEditOn: '✏️ Edit Mode ON',
  btnEditOff: '✏️ Edit Mode OFF',
  btnDebugOn: '🐛 Debug ON',
  btnDebugOff: '🐛 Debug Mode',
  btnExecuteTick: '⏭ Execute Tick',

  // ── JSON Editor
  editorTitle: 'Circuit Blueprint (JSON)',
  btnFormat: 'Format',
  btnCopy: '📋 Copy',
  btnPaste: '📥 Paste',
  btnPasteFromAI: '📥 PASTE FROM AI',
  btnPasteFromAIHint: 'Paste the JSON from your AI chatbot here',
  msgCopied: '✅ Copied!',
  msgPasted: '📋 Pasted!',
  msgPasteDenied: '⚠️ Paste denied — use the editor directly',
  invalidJson: 'Invalid JSON',

  // ── Breadboard overlays
  btnCopyLabTable: '📋 Copy Lab Table',
  ikeaBuildMode: 'IKEA Build Mode',
  btnStart: 'Start',
  btnNextWire: 'Next Wire',
  btnShowAll: 'Show All',
  btnAutoWire: '⚡ Auto-Wire Cheat',

  // ── I/O Panel
  ioTitle: 'I/O Channels (Static I/O)',
  ioInputs: 'Inputs',
  ioOutputs: 'Outputs',
  ioBtnAddInput: '+ Add Input',
  ioBtnAddOutput: '+ Add Output',

  // ── Test Bench
  testBenchTitle: '🧪 Automated Test Bench',
  testBenchSubtitle: 'Diff Engine v2',
  testBenchPasteLabel: 'Paste Expected Truth Table (Markdown or CSV):',
  testBenchPastePlaceholder: '| A | B | Output |\n|---|---|---|\n| 0 | 0 | 0 |',
  btnRunDiff: '▶ Run Diff',
  btnCopyDebug: '🤖 Copy Debug for AI',
  testBenchResults: 'Results',
  testBenchRowsPassing: 'rows passing',
  btnTestBenchOpen: '🧪 Test Bench',
  colStatus: 'Status',
  colExpected: 'Expected',
  colActual: 'Actual',

  // ── Mobile Tabs
  tabBoard: '🔌 Board',
  tabIO: '⚡ I/O',
  tabJSON: '📄 JSON',
  mobileJsonTitle: 'Circuit JSON',

  // ── Onboarding Tour — AI Workflow Guide
  tourStep1Title: 'Welcome! 👋',
  tourStep1Body: 'This simulator builds circuits from JSON code. Don\'t worry — an AI will write all the code for you. This guide shows you exactly how.',
  tourStep2Title: 'Step 1: Copy the AI Instructions 📋',
  tourStep2Body: 'Click the "🤖 AI Prompt" button at the top of the page. This copies a set of instructions to your clipboard that tells the AI exactly how to build circuits for this simulator.',
  tourStep3Title: 'Step 2: Ask the AI 🤖',
  tourStep3Body: 'Open ChatGPT, Claude, or any AI chatbot. Paste what you copied (Ctrl+V) and then describe the circuit you want. Example: "Build me an SR latch using two NAND gates."',
  tourStep4Title: 'Step 3: Copy the AI\'s Answer 📄',
  tourStep4Body: 'The AI will reply with a block of JSON code. Select all of it and copy it (Ctrl+A, then Ctrl+C). It will look like { "boards": 1, "chips": [...], "wires": [...] }',
  tourStep5Title: 'Step 4: Paste & Run! ⚡',
  tourStep5Body: 'Click the big green "📥 PASTE FROM AI" button on the right panel. Your circuit will instantly appear on the breadboard. Then click "▶ Run Simulation" to bring it to life!',
  tourBtnNext: 'Next →',
  tourBtnSkip: 'Skip',
  tourBtnDone: 'Got it! Let\'s go 🚀',
  tourProgress: 'of',
};

export type TranslationKeys = typeof en;
