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
  ikeaBuildMode: '🔧 Step-by-Step Build Mode',
  ikea_intro: 'Follow the wires one at a time, like assembly instructions.',
  ikea_current: 'Now connect:',
  ikea_done: 'All wires placed! ✅',
  ikea_wireOf: 'Wire',
  ikea_of: 'of',
  btnIkeaStart: '▶ Start Building',
  btnIkeaNext: 'Next Wire →',
  btnIkeaShowAll: '👀 Show All Wires',
  btnIkeaCheat: '⚡ Auto-Wire (Skip)',

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

  // ── Onboarding Tour — AI Workflow Guide (7 steps)
  // Step 0: Welcome + two paths
  tourStep0Title: 'Bem-vindo! O que é isto? 👋',
  tourStep0Body: 'Este simulador ensina-te a montar circuitos eletrónicos digitais de duas formas: com a ajuda de uma IA que escreve o circuito por ti, ou passo a passo como as instruções de uma caixa de LEGO.',
  tourStep1Title: 'Passo 1: Copia as Instruções para a IA 📋',
  tourStep1Body: 'Clica no botão "🤖 Prompt IA" no topo da página. Isso copia um conjunto de instruções para a tua área de transferência que diz à IA exatamente como montar circuitos para este simulador.',
  tourStep2Title: 'Passo 2: Pergunta à IA 🤖',
  tourStep2Body: 'Abre o ChatGPT, Claude ou qualquer chatbot de IA. Cola o que copiaste (Ctrl+V) e descreve o circuito que queres. Exemplo: "Monta um latch SR com dois NAND gates."',
  tourStep3Title: 'Passo 3: Copia a Resposta da IA 📄',
  tourStep3Body: 'A IA vai responder com um bloco de código JSON. Seleciona tudo e copia (Ctrl+A, depois Ctrl+C). Vai parecer assim: { "boards": 1, "chips": [...], "wires": [...] }',
  tourStep4Title: 'Passo 4: Cola e Executa! ⚡',
  tourStep4Body: 'Clica no botão verde grande "📥 COLAR DA IA" no painel direito. O teu circuito aparecerá imediatamente na protoboard. Depois clica "▶ Iniciar Simulação"!',
  // Step 5-6: IKEA Build Mode
  tourStep5Title: 'Modo de Montagem Passo a Passo 🔧',
  tourStep5Body: 'Depois de carregar um circuito da IA, podes aprender a montá-lo tú próprio. Usa o painel "🔧 Montagem Passo a Passo" no canto inferior direito para ver cada fio um de cada vez.',
  tourStep6Title: 'Como usar a Montagem 🔧',
  tourStep6Body: 'Clica em "▶ Iniciar Montagem" para começar. O simulador mostra apenas o primeiro fio. Clica "Próximo Fio" para revelar o seguinte, como uma instrução IKEA. Clica "👀 Ver Tudo" quando terminares!',
  tourBtnNext: 'Próximo →',
  tourBtnSkip: 'Pular',
  tourBtnDone: 'Entendido! Vamos lá 🚀',
  tourProgress: 'de',
};

export type TranslationKeys = typeof en;
