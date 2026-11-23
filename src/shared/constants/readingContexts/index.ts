import type { IconName } from '@/components/ui/icon';
import type { MealContext } from '@/shared/types/reading';

/** Qual faixa do padrão clínico vale para o momento da leitura. */
export type TargetKind = 'fasting' | 'postprandial' | 'bedtime';

export type ReadingContextInfo = {
  label: string;
  /** Rótulo curto em caixa alta para chips ("JEJUM", "2H PÓS-REFEIÇÃO"). */
  chip: string;
  icon: IconName;
  targetKind: TargetKind;
};

// "Outro / Lanche" usa a faixa de jejum/pré-prandial, a mais conservadora.
export const READING_CONTEXTS: Record<MealContext, ReadingContextInfo> = {
  fasting: { label: 'Jejum', chip: 'JEJUM', icon: 'wb-twilight', targetKind: 'fasting' },
  'pre-meal': { label: 'Pré-refeição', chip: 'PRÉ-REFEIÇÃO', icon: 'restaurant', targetKind: 'fasting' },
  'post-meal-1h': {
    label: '1h pós-refeição',
    chip: '1H PÓS-REFEIÇÃO',
    icon: 'restaurant',
    targetKind: 'postprandial',
  },
  'post-meal-2h': {
    label: '2h pós-refeição',
    chip: '2H PÓS-REFEIÇÃO',
    icon: 'restaurant',
    targetKind: 'postprandial',
  },
  'pre-dinner': { label: 'Pré-jantar', chip: 'PRÉ-JANTAR', icon: 'dinner-dining', targetKind: 'fasting' },
  'post-dinner': {
    label: 'Pós-jantar',
    chip: 'PÓS-JANTAR',
    icon: 'dinner-dining',
    targetKind: 'postprandial',
  },
  bedtime: { label: 'Ao deitar', chip: 'AO DEITAR', icon: 'bedtime', targetKind: 'bedtime' },
  overnight: { label: 'Madrugada', chip: 'MADRUGADA', icon: 'nights-stay', targetKind: 'bedtime' },
  other: { label: 'Outro', chip: 'OUTRO', icon: 'more-horiz', targetKind: 'fasting' },
};

export const MEAL_CONTEXTS = Object.keys(READING_CONTEXTS) as MealContext[];

export type ContextFilter = 'all' | 'fasting' | 'pre-meal' | 'post-meal' | 'night';

/** Filtros do histórico (DESIGN.md §5.2): agrupam momentos parecidos. "Outro" só aparece em Todos. */
export const CONTEXT_FILTERS: { value: ContextFilter; label: string; contexts: MealContext[] | 'all' }[] = [
  { value: 'all', label: 'Todos', contexts: 'all' },
  { value: 'fasting', label: 'Jejum', contexts: ['fasting'] },
  { value: 'pre-meal', label: 'Pré-prandial', contexts: ['pre-meal', 'pre-dinner'] },
  { value: 'post-meal', label: 'Pós-prandial', contexts: ['post-meal-1h', 'post-meal-2h', 'post-dinner'] },
  { value: 'night', label: 'Noturno', contexts: ['bedtime', 'overnight'] },
];
