export interface Chip {
  id: string;
  type: string;
  board: number;
  col: number;
}

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
  customComponents?: CustomComponentDef[];
  inputs?: InputComponent[];
  outputs?: OutputComponent[];
  wires?: Wire[];
  truthTable?: Array<{ inputs: Record<string, number>, outputs: Record<string, number> }>;
}

export type PinStates = Record<string, number>;
