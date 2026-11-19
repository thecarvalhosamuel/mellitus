// Modelo de leitura (DESIGN.md §6). Identificadores em inglês; rótulos em constants.

export type MealContext =
  | 'fasting'
  | 'pre-meal'
  | 'post-meal-1h'
  | 'post-meal-2h'
  | 'pre-dinner'
  | 'post-dinner'
  | 'bedtime'
  | 'overnight'
  | 'other';

export type GlucoseStatus =
  | 'severe-hypo'
  | 'hypo'
  | 'below-target'
  | 'in-range'
  | 'above-target'
  | 'severe-hyper';

/** Família de cor do status: mesma semântica nos dois temas. */
export type StatusFamily = 'inRange' | 'offTarget' | 'danger';

export type TargetRange = { min?: number; max?: number };

export type CycleDay = 'A' | 'B';

export type ReadingSource = 'manual' | 'import';

export type GlucoseReading = {
  id: string;
  /** mg/dL. Entrada manual 40–450; importação 20–600. */
  value: number;
  /** ISO 8601 com fuso. */
  timestamp: string;
  context: MealContext;
  note?: string;
  insulinUnits?: number;
  isCorrection?: boolean;
  cycleDay?: CycleDay;
  cycleSlot?: { index: number; total: number };
  /** Padrão ativo no momento da leitura. */
  patternId?: string;
  /** Meta vigente no momento da leitura (snapshot: trocar de padrão não reescreve o histórico). */
  target?: TargetRange;
  status: GlucoseStatus;
  source: ReadingSource;
};
