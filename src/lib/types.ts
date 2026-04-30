export interface Chip {
  id: string;
  type: string;
  board: number;
  col: number;
}

// Inline component definition (used in JSON `componentDefinitions` root key)
export interface ComponentDefinitionEntry {
  name?: string;
  pins: number;
  eval: string; // Raw JS string: (pins, state) => void
  pinLabels?: Record<number, string>;
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
