export interface Chip {
  id: string;
  type: string;
  board: number;
  col: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Schema-Driven UI (visualTemplate)
// ──────────────────────────────────────────────────────────────────────────────

/** Bind an SVG element's fill colour to a live pin state. */
export interface VisualBindState {
  pin: number;          // 1-indexed pin number on this chip
  activeFill: string;   // CSS colour when pin === 1 (HIGH)
  inactiveFill: string; // CSS colour when pin === 0 (LOW)
}

export interface VisualRect {
  type: 'rect';
  id?: string;
  x: number; y: number; w: number; h: number;
  fill?: string; rx?: number;
  bindState?: VisualBindState;
}

export interface VisualCircle {
  type: 'circle';
  id?: string;
  cx: number; cy: number; r: number;
  fill?: string;
  bindState?: VisualBindState;
}

export interface VisualPath {
  type: 'path';
  id?: string;
  d: string;
  fill?: string;
  bindState?: VisualBindState;
}

export interface VisualText {
  type: 'text';
  id?: string;
  x: number; y: number;
  text: string;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  textAnchor?: string;
  bindState?: VisualBindState;
}

export type VisualElement = VisualRect | VisualCircle | VisualPath | VisualText;

export interface VisualTemplate {
  /** SVG viewport width in breadboard-space pixels */
  width: number;
  /** SVG viewport height in breadboard-space pixels */
  height: number;
  elements: VisualElement[];
}

// ──────────────────────────────────────────────────────────────────────────────

// Inline component definition (used in JSON `componentDefinitions` root key)
export interface ComponentDefinitionEntry {
  name?: string;
  pins: number;
  eval: string; // Raw JS string: (pins, state, sysTick) => void
  pinLabels?: Record<number, string>;
  /**
   * Optional: if present, the breadboard renders this SVG template instead of
   * the standard black DIP rectangle. Elements can react to live pin states
   * via their `bindState` property.
   */
  visualTemplate?: VisualTemplate;
}

// Legacy inline definition (used in JSON `customComponents` array)
export interface CustomComponentDef {
  type: string;
  name?: string;
  pins: number;
  eval: string;
  pinLabels?: Record<number, string>;
}

export interface InputComponent {
  id: string;
  label: string;
  board: number;
  col: number;
  state: number;
}

export interface OutputComponent {
  id: string;
  label: string;
  board: number;
  col: number;
}

export interface Wire {
  id: string;
  from: string;
  to: string;
  color?: string;
}

export interface CircuitData {
  boards: number;
  chips?: Chip[];
  // New: keyed object, highest priority in engine lookup
  componentDefinitions?: Record<string, ComponentDefinitionEntry>;
  // Legacy: array form, still supported
  customComponents?: CustomComponentDef[];
  inputs?: InputComponent[];
  outputs?: OutputComponent[];
  wires?: Wire[];
  truthTable?: Array<{ inputs: Record<string, number>, outputs: Record<string, number> }>;
}

export type PinStates = Record<string, number>;

// Chip internal state object type (used for edge-triggered components)
export type ChipStateMap = Record<string, Record<string, any>>;
