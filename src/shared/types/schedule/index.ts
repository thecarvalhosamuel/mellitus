import type { MealContext } from '../reading';

export type FrequencyMode = '3x' | '1x' | 'alternating' | 'every-other-day' | 'every-72h' | 'custom';

export type ScheduledMoment = {
  context: MealContext;
  /** "HH:mm". Opcional no modo personalizado, que define só os momentos. */
  time?: string;
};

export type DayPlan = {
  label: string;
  moments: ScheduledMoment[];
};

export type FrequencySchedule = {
  mode: FrequencyMode;
  /** Dia intensivo (3x). Também é a rotina do modo '3x'. */
  dayA?: DayPlan;
  /** Dia basal (1x jejum). Também é a rotina dos modos '1x' e 'every-72h'. */
  dayB?: DayPlan;
  /** "YYYY-MM-DD": data em que o ciclo começa com o Dia A. */
  cycleStart: string;
  customCount?: 2 | 4 | 6 | 'free';
  customMoments?: MealContext[];
};
