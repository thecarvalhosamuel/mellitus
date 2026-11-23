import type { FrequencyMode } from '@/shared/types/schedule';

/** Rótulos das frequências de medição (DESIGN.md §5.5). */
export const FREQUENCY_LABELS: Record<FrequencyMode, string> = {
  '3x': '3x ao dia',
  '1x': '1x ao dia',
  alternating: 'Ciclo Alternado',
  'every-other-day': 'Dia sim, dia não',
  'every-72h': 'Espaçado (72h)',
  custom: 'Personalizado',
};
