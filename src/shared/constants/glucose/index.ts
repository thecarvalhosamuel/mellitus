import type { GlucoseStatus, StatusFamily } from '@/shared/types/reading';

/** Limites de valor (mg/dL). */
export const GLUCOSE_LIMITS = {
  /** Stepper e digitação manual. */
  manualMin: 40,
  manualMax: 450,
  /** Aceito pelo banco (importação de glicosímetros). */
  storedMin: 20,
  storedMax: 600,
  /** Abaixo disso a hipo é sempre severa, independentemente do padrão. */
  severeHypo: 54,
} as const;

/** Escala visual fixa da barra de faixa glicêmica (DESIGN.md §4.6). */
export const RANGE_BAR_SCALE = { min: 40, max: 300 } as const;

/** Meta de tempo no alvo (TIR). */
export const TIR_GOAL = 0.7;

export type StatusDirection = 'up' | 'down' | 'none';

export type StatusPresentation = {
  label: string;
  family: StatusFamily;
  direction: StatusDirection;
  /** Halo de destaque para estados severos. */
  severe: boolean;
};

// Rótulos e semântica de cada status (DESIGN.md §2.2). Direção sempre por seta + texto.
export const GLUCOSE_STATUS: Record<GlucoseStatus, StatusPresentation> = {
  'severe-hypo': { label: 'Hipo Severa', family: 'danger', direction: 'down', severe: true },
  hypo: { label: 'Hipo Leve', family: 'danger', direction: 'down', severe: false },
  'below-target': { label: 'Abaixo da Meta', family: 'offTarget', direction: 'down', severe: false },
  'in-range': { label: 'No Alvo', family: 'inRange', direction: 'none', severe: false },
  'above-target': { label: 'Acima da Meta', family: 'offTarget', direction: 'up', severe: false },
  'severe-hyper': { label: 'Hiper Severa', family: 'danger', direction: 'up', severe: true },
};
