import type { MealContext } from '@/shared/types/reading';
import type { FrequencyMode } from '@/shared/types/schedule';

/** Horário padrão de lembrete para momentos sem horário (modo personalizado). */
export const DEFAULT_MOMENT_TIMES: Record<MealContext, string | undefined> = {
  fasting: '07:00',
  'pre-meal': '11:30',
  'post-meal-1h': '13:00',
  'post-meal-2h': '14:00',
  'pre-dinner': '18:30',
  'post-dinner': '21:00',
  bedtime: '22:00',
  overnight: '03:00',
  other: undefined,
};

/** Rótulos das frequências de medição (DESIGN.md §5.5). */
export const FREQUENCY_LABELS: Record<FrequencyMode, string> = {
  '3x': '3x ao dia',
  '1x': '1x ao dia',
  alternating: 'Ciclo Alternado',
  'every-other-day': 'Dia sim, dia não',
  'every-72h': 'Espaçado (72h)',
  custom: 'Personalizado',
};
