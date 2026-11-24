import { DEFAULT_MOMENT_TIMES } from '@/shared/constants/frequency';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { MealContext } from '@/shared/types/reading';
import type { FrequencySchedule, ScheduledMoment } from '@/shared/types/schedule';
import type { ReminderSettings } from '@/shared/types/settings';
import { getCycleDay, getDayMoments, getDayProgress } from '@/shared/utils/cycle';
import { addDays, timeToMinutes, toDateKey } from '@/shared/utils/date';

export type ReminderKind = 'moment' | 'gentle' | 'safety';

export type ReminderPlanItem = {
  id: string;
  kind: ReminderKind;
  date: Date;
  title: string;
  body: string;
  context?: MealContext;
};

type PlanInput = {
  frequency: FrequencySchedule;
  reminders: ReminderSettings;
  now: Date;
  /** Contextos já registrados hoje (não lembrar do que já foi feito). */
  todayContexts: MealContext[];
  /** Dias à frente (o iOS limita a 64 notificações pendentes). */
  days?: number;
};

const atTime = (dateKey: string, time: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const minutes = timeToMinutes(time);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
};

/** Dia leve da rotina: Dia B do ciclo alternado. */
const isRestDay = (frequency: FrequencySchedule, dateKey: string) =>
  frequency.mode === 'alternating' && getCycleDay(dateKey, frequency.cycleStart) === 'B';

function momentsFor(frequency: FrequencySchedule, reminders: ReminderSettings, dateKey: string): ScheduledMoment[] {
  // Sem lembretes adaptativos, o ciclo alternado lembra os momentos do Dia A todos os dias.
  if (frequency.mode === 'alternating' && !reminders.adaptiveToCycle) return frequency.dayA?.moments ?? [];
  return getDayMoments(frequency, dateKey);
}

/**
 * Notificações locais dos próximos dias (DESIGN.md §5.5 e §6.1): um lembrete por
 * momento previsto; no Dia B com "reduzir alertas", só o lembrete gentil de jejum;
 * aviso passivo de segurança no Dia B se nada for registrado até o horário.
 */
export function buildReminderPlan({ frequency, reminders, now, todayContexts, days = 7 }: PlanInput): ReminderPlanItem[] {
  if (!reminders.alarmsEnabled) return [];
  const todayKey = toDateKey(now);
  const plan: ReminderPlanItem[] = [];

  for (let offset = 0; offset < days; offset++) {
    const dateKey = addDays(todayKey, offset);
    const isToday = offset === 0;
    const moments = momentsFor(frequency, reminders, dateKey);
    const rest = reminders.adaptiveToCycle && isRestDay(frequency, dateKey);

    if (rest && reminders.restDay.reduceAlerts) {
      const hasFasting = moments.some((m) => m.context === 'fasting');
      if (hasFasting && !(isToday && todayContexts.includes('fasting'))) {
        plan.push({
          id: `gentle-${dateKey}`,
          kind: 'gentle',
          date: atTime(dateKey, reminders.restDay.gentleFastingTime),
          title: 'Lembrete gentil de jejum',
          body: reminders.restDay.encouragement
            ? 'Dia leve de descanso: só uma medição em jejum hoje. Você está indo bem.'
            : 'Hoje é dia de descanso: só a medição em jejum.',
          context: 'fasting',
        });
      }
    } else {
      const pending = isToday ? getDayProgress(moments, todayContexts).moments : moments.map((m) => ({ ...m, done: false }));
      pending.forEach((moment, index) => {
        const time = moment.time ?? DEFAULT_MOMENT_TIMES[moment.context];
        if (moment.done || !time) return;
        const label = READING_CONTEXTS[moment.context].label;
        plan.push({
          id: `moment-${dateKey}-${index}`,
          kind: 'moment',
          date: atTime(dateKey, time),
          title: `Hora de medir: ${label}`,
          body: 'Registre sua glicemia em poucos segundos.',
          context: moment.context,
        });
      });
    }

    const safetyAt = reminders.restDay.passiveSafetyAlertAt;
    if (rest && safetyAt && moments.length > 0 && !(isToday && todayContexts.length > 0)) {
      plan.push({
        id: `safety-${dateKey}`,
        kind: 'safety',
        date: atTime(dateKey, safetyAt),
        title: 'Tudo bem por aí?',
        body: 'Ainda não há medição hoje. Quando puder, registre sua glicemia em jejum.',
      });
    }
  }

  return plan.filter((item) => item.date.getTime() > now.getTime()).sort((a, b) => a.date.getTime() - b.date.getTime());
}
