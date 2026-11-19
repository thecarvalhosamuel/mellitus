import type { CycleDay, MealContext } from '@/shared/types/reading';
import type { FrequencySchedule, ScheduledMoment } from '@/shared/types/schedule';
import { daysBetween, minutesOfDay, timeToMinutes } from '@/shared/utils/date';

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Dia do ciclo alternado: dias pares desde o início = A, ímpares = B (DESIGN.md §6.1). */
export function getCycleDay(dateKey: string, cycleStart: string): CycleDay {
  return mod(daysBetween(cycleStart, dateKey), 2) === 0 ? 'A' : 'B';
}

/** Momentos previstos para o dia, conforme a frequência escolhida. Lista vazia = dia de descanso. */
export function getDayMoments(schedule: FrequencySchedule, dateKey: string): ScheduledMoment[] {
  const dayA = schedule.dayA?.moments ?? [];
  const dayB = schedule.dayB?.moments ?? [];
  const offset = daysBetween(schedule.cycleStart, dateKey);

  switch (schedule.mode) {
    case '3x':
      return dayA;
    case '1x':
      return dayB;
    case 'alternating':
      return getCycleDay(dateKey, schedule.cycleStart) === 'A' ? dayA : dayB;
    case 'every-other-day':
      return mod(offset, 2) === 0 ? dayA : [];
    case 'every-72h':
      return mod(offset, 3) === 0 ? dayB : [];
    case 'custom':
      return (schedule.customMoments ?? []).map((context) => ({ context }));
  }
}

/** Dia A/B só existe no ciclo alternado. */
export function getScheduleCycleDay(schedule: FrequencySchedule, dateKey: string): CycleDay | undefined {
  return schedule.mode === 'alternating' ? getCycleDay(dateKey, schedule.cycleStart) : undefined;
}

export type MomentProgress = ScheduledMoment & { done: boolean };

export type DayProgress = {
  done: number;
  total: number;
  moments: MomentProgress[];
};

/**
 * Progresso do dia (ex.: 1/3). Cada momento previsto conta como feito se houver
 * uma leitura daquele contexto no dia; cada leitura cumpre no máximo um momento.
 */
export function getDayProgress(moments: ScheduledMoment[], dayContexts: MealContext[]): DayProgress {
  const remaining = [...dayContexts];
  const withStatus = moments.map((moment) => {
    const index = remaining.indexOf(moment.context);
    if (index >= 0) remaining.splice(index, 1);
    return { ...moment, done: index >= 0 };
  });
  return {
    done: withStatus.filter((m) => m.done).length,
    total: moments.length,
    moments: withStatus,
  };
}

// Faixas de horário para sugerir o momento quando a rotina não decide.
const TIME_WINDOWS: [number, MealContext][] = [
  [4 * 60, 'overnight'],
  [10 * 60, 'fasting'],
  [12 * 60, 'pre-meal'],
  [16 * 60, 'post-meal-2h'],
  [19 * 60, 'pre-dinner'],
  [22 * 60, 'post-dinner'],
  [24 * 60, 'bedtime'],
];

/** Até quanto tempo de distância um momento agendado é sugerido. */
const SCHEDULE_TOLERANCE_MIN = 90;

/**
 * Sugere o momento da leitura: primeiro o momento pendente da rotina mais próximo
 * do horário (até 90 min); senão, pela faixa de horário do dia.
 */
export function suggestReadingContext(
  now: Date,
  pendingMoments: ScheduledMoment[] = [],
): MealContext {
  const nowMin = minutesOfDay(now);
  const closest = pendingMoments
    .filter((m): m is Required<ScheduledMoment> => m.time !== undefined)
    .map((m) => ({ context: m.context, distance: Math.abs(timeToMinutes(m.time) - nowMin) }))
    .filter((m) => m.distance <= SCHEDULE_TOLERANCE_MIN)
    .sort((a, b) => a.distance - b.distance)[0];
  if (closest) return closest.context;

  return TIME_WINDOWS.find(([until]) => nowMin < until)![1];
}
