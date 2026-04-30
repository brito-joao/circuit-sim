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
  ikeaBuildMode: '🔧 Montagem Passo a Passo',
  ikea_intro: 'Siga os fios um de cada vez, como as instruções de montagem.',
  ikea_current: 'Liga agora:',
  ikea_done: 'Todos os fios colocados! ✅',
  ikea_wireOf: 'Fio',
  ikea_of: 'de',
  btnIkeaStart: '▶ Iniciar Montagem',
  btnIkeaNext: 'Próximo Fio →',
  btnIkeaShowAll: '👀 Ver Todos os Fios',
  btnIkeaCheat: '⚡ Ligar Tudo (Saltar)',

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

  // ── Onboarding Tour — Guia de Uso com IA (7 passos)
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
  tourStep5Title: 'Modo de Montagem Passo a Passo 🔧',
  tourStep5Body: 'Depois de carregar um circuito da IA, podes aprender a montá-lo tu próprio. Usa o painel "🔧 Montagem Passo a Passo" no canto inferior direito para ver cada fio um de cada vez.',
  tourStep6Title: 'Como usar a Montagem 🔧',
  tourStep6Body: 'Clica em "▶ Iniciar Montagem" para começar. O simulador mostra apenas o primeiro fio. Clica "Próximo Fio" para revelar o seguinte, como uma instrução IKEA. Clica "👀 Ver Tudo" quando terminares!',
  tourBtnNext: 'Próximo →',
  tourBtnSkip: 'Pular',
  tourBtnDone: 'Entendido! Vamos lá 🚀',
  tourProgress: 'de',
};
