import type { TranslationKeys } from './en';

export const pt: TranslationKeys = {
  // ── App
  appTitle: 'Simulador de Lógica Digital',

  // ── Header
  statusRunning: 'Simulando...',
  statusStopped: 'Parado',
  statusError: 'Erro JSON',
  btnAIPrompt: '🤖 Prompt IA',
  btnCompile: 'Compilar JSON',
  btnRun: '▶ Iniciar Simulação',
  btnStop: '⏸ Parar Simulação',
  btnHelp: '❓ Ajuda',
  langToggle: '🇺🇸 EN',

  // ── Breadboard Controls
  btnZoomIn: '+',
  btnZoomOut: '−',
  btnReset: 'Resetar',
  btnXRayOn: '🔍 Raio-X LIGADO',
  btnXRayOff: '🔍 Raio-X DESLIGADO',
  btnEditOn: '✏️ Edição LIGADA',
  btnEditOff: '✏️ Modo Edição',
  btnDebugOn: '🐛 Debug LIGADO',
  btnDebugOff: '🐛 Modo Debug',
  btnExecuteTick: '⏭ Executar Tick',

  // ── JSON Editor
  editorTitle: 'Blueprint do Circuito (JSON)',
  btnFormat: 'Formatar',
  btnCopy: '📋 Copiar',
  btnPaste: '📥 Colar',
  btnPasteFromAI: '📥 COLAR DA IA',
  btnPasteFromAIHint: 'Cole aqui o JSON gerado pelo ChatGPT ou outra IA',
  msgCopied: '✅ Copiado!',
  msgPasted: '📋 Colado!',
  msgPasteDenied: '⚠️ Colagem negada — use o editor diretamente',
  invalidJson: 'JSON inválido',

  // ── Breadboard overlays
  btnCopyLabTable: '📋 Copiar Tabela',
  ikeaBuildMode: 'Modo Montagem',
  btnStart: 'Iniciar',
  btnNextWire: 'Próximo Fio',
  btnShowAll: 'Mostrar Tudo',
  btnAutoWire: '⚡ Ligar Automaticamente',

  // ── I/O Panel
  ioTitle: 'Canais I/O (Entradas/Saídas)',
  ioInputs: 'Entradas',
  ioOutputs: 'Saídas',
  ioBtnAddInput: '+ Entrada',
  ioBtnAddOutput: '+ Saída',

  // ── Test Bench
  testBenchTitle: '🧪 Bancada de Testes Automática',
  testBenchSubtitle: 'Motor de Comparação v2',
  testBenchPasteLabel: 'Cole a Tabela Verdade Esperada (Markdown ou CSV):',
  testBenchPastePlaceholder: '| A | B | Saída |\n|---|---|---|\n| 0 | 0 | 0 |',
  btnRunDiff: '▶ Executar Comparação',
  btnCopyDebug: '🤖 Copiar Dados de Debug para IA',
  testBenchResults: 'Resultados',
  testBenchRowsPassing: 'linhas corretas',
  btnTestBenchOpen: '🧪 Bancada de Testes',
  colStatus: 'Estado',
  colExpected: 'Esperado',
  colActual: 'Obtido',

  // ── Mobile Tabs
  tabBoard: '🔌 Placa',
  tabIO: '⚡ E/S',
  tabJSON: '📄 JSON',
  mobileJsonTitle: 'JSON do Circuito',

  // ── Onboarding Tour — Guia de Uso com IA
  tourStep1Title: 'Bem-vindo! 👋',
  tourStep1Body: 'Este simulador constrói circuitos a partir de código JSON. Não se preocupe — uma IA vai escrever todo o código por você. Este guia mostra exatamente como fazer.',
  tourStep2Title: 'Passo 1: Copie as Instruções para a IA 📋',
  tourStep2Body: 'Clique no botão "🤖 Prompt IA" no topo da página. Isso copia um conjunto de instruções para a sua área de transferência que diz à IA exatamente como montar circuitos para este simulador.',
  tourStep3Title: 'Passo 2: Pergunte à IA 🤖',
  tourStep3Body: 'Abra o ChatGPT, Claude ou qualquer chatbot de IA. Cole o que você copiou (Ctrl+V) e descreva o circuito que quer. Exemplo: "Monte um latch SR usando dois NAND gates."',
  tourStep4Title: 'Passo 3: Copie a Resposta da IA 📄',
  tourStep4Body: 'A IA vai responder com um bloco de código JSON. Selecione tudo e copie (Ctrl+A, depois Ctrl+C). Vai parecer com isso: { "boards": 1, "chips": [...], "wires": [...] }',
  tourStep5Title: 'Passo 4: Cole e Execute! ⚡',
  tourStep5Body: 'Clique no botão verde grande "📥 COLAR DA IA" no painel direito. Seu circuito aparecerá instantaneamente na protoboard. Depois clique "▶ Iniciar Simulação" para dar vida a ele!',
  tourBtnNext: 'Próximo →',
  tourBtnSkip: 'Pular',
  tourBtnDone: 'Entendi! Vamos lá 🚀',
  tourProgress: 'de',
};
