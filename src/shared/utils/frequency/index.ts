import type { DayPlan, FrequencySchedule } from '@/shared/types/schedule';
import { addDays, daysBetween } from '@/shared/utils/date';

/** Em ciclos (alternado, dia sim/dia não, 72h), quantos dias tem cada volta. */
export function cyclePeriod(mode: FrequencySchedule['mode']): number | null {
  if (mode === 'alternating' || mode === 'every-other-day') return 2;
  if (mode === 'every-72h') return 3;
  return null;
}

/**
 * Em que posição do ciclo está hoje (0 = Dia A / dia de medir). Usado para
 * mostrar e escolher "Hoje é Dia A", "Próxima medição: amanhã"…
 */
export function cyclePosition(frequency: FrequencySchedule, todayKey: string): number {
  const period = cyclePeriod(frequency.mode) ?? 1;
  return ((daysBetween(frequency.cycleStart, todayKey) % period) + period) % period;
}

/** Início do ciclo para que hoje fique na posição escolhida. */
export function cycleStartFor(position: number, todayKey: string): string {
  return addDays(todayKey, -position);
}

/** Troca o horário de um momento do Dia A ou B. */
export function setMomentTime(
  frequency: FrequencySchedule,
  day: 'dayA' | 'dayB',
  index: number,
  time: string,
): FrequencySchedule {
  const plan: DayPlan | undefined = frequency[day];
  if (!plan) return frequency;
  return {
    ...frequency,
    [day]: { ...plan, moments: plan.moments.map((m, i) => (i === index ? { ...m, time } : m)) },
  };
}
