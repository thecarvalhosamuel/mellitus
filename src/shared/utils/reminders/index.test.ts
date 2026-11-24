import { DEFAULT_SETTINGS } from '@/shared/constants/defaultSettings';
import type { FrequencySchedule } from '@/shared/types/schedule';
import type { ReminderSettings } from '@/shared/types/settings';

import { buildReminderPlan } from '.';

const reminders: ReminderSettings = DEFAULT_SETTINGS.reminders;
const base: FrequencySchedule = { ...DEFAULT_SETTINGS.frequency, cycleStart: '2024-10-21' };
// Segunda, 21/10 às 06:00 (Dia A no ciclo alternado).
const now = new Date(2024, 9, 21, 6, 0);

const summary = (plan: ReturnType<typeof buildReminderPlan>) =>
  plan.map((p) => `${p.kind} ${p.date.getDate()} ${String(p.date.getHours()).padStart(2, '0')}:${String(p.date.getMinutes()).padStart(2, '0')}`);

describe('buildReminderPlan', () => {
  it('alarmes desligados: nenhum lembrete', () => {
    expect(buildReminderPlan({ frequency: base, reminders: { ...reminders, alarmsEnabled: false }, now, todayContexts: [] })).toEqual([]);
  });

  it('3x ao dia: um lembrete por momento, só no futuro', () => {
    const plan = buildReminderPlan({ frequency: base, reminders, now: new Date(2024, 9, 21, 10, 0), todayContexts: [], days: 2 });
    expect(summary(plan)).toEqual(['moment 21 14:00', 'moment 21 22:00', 'moment 22 07:00', 'moment 22 14:00', 'moment 22 22:00']);
    expect(plan[0].title).toBe('Hora de medir: 2h pós-refeição');
  });

  it('não lembra do que já foi registrado hoje', () => {
    const plan = buildReminderPlan({ frequency: base, reminders, now, todayContexts: ['fasting'], days: 1 });
    expect(summary(plan)).toEqual(['moment 21 14:00', 'moment 21 22:00']);
  });

  it('ciclo alternado com Dia B leve: lembrete gentil e aviso de segurança', () => {
    const plan = buildReminderPlan({ frequency: { ...base, mode: 'alternating' }, reminders, now, todayContexts: [], days: 2 });
    expect(summary(plan)).toEqual([
      'moment 21 07:00',
      'moment 21 14:00',
      'moment 21 22:00',
      'gentle 22 08:00',
      'safety 22 10:00',
    ]);
    expect(plan[3].body).toMatch(/Você está indo bem/);
  });

  it('Dia B sem "reduzir alertas" usa os horários do Dia B', () => {
    const plan = buildReminderPlan({
      frequency: { ...base, mode: 'alternating' },
      reminders: { ...reminders, restDay: { ...reminders.restDay, reduceAlerts: false } },
      now: new Date(2024, 9, 22, 6, 0),
      todayContexts: [],
      days: 1,
    });
    expect(summary(plan)).toEqual(['moment 22 07:30', 'safety 22 10:00']);
  });

  it('aviso de segurança some se já houve medição no dia, e pode ser desligado', () => {
    const frequency = { ...base, mode: 'alternating' as const };
    const dayB = new Date(2024, 9, 22, 7, 0);
    expect(summary(buildReminderPlan({ frequency, reminders, now: dayB, todayContexts: ['fasting'], days: 1 }))).toEqual([]);
    const off = { ...reminders, restDay: { ...reminders.restDay, passiveSafetyAlertAt: '' } };
    expect(summary(buildReminderPlan({ frequency, reminders: off, now: dayB, todayContexts: [], days: 1 }))).toEqual(['gentle 22 08:00']);
  });

  it('sem lembretes adaptativos, o alternado lembra o Dia A todos os dias', () => {
    const plan = buildReminderPlan({
      frequency: { ...base, mode: 'alternating' },
      reminders: { ...reminders, adaptiveToCycle: false },
      now: new Date(2024, 9, 22, 6, 0),
      todayContexts: [],
      days: 1,
    });
    expect(summary(plan)).toEqual(['moment 22 07:00', 'moment 22 14:00', 'moment 22 22:00']);
  });

  it('personalizado usa horários padrão por momento', () => {
    const plan = buildReminderPlan({
      frequency: { ...base, mode: 'custom', customMoments: ['fasting', 'pre-dinner', 'other'] },
      reminders,
      now,
      todayContexts: [],
      days: 1,
    });
    expect(summary(plan)).toEqual(['moment 21 07:00', 'moment 21 18:30']);
  });

  it('espaçado: só nos dias de medição', () => {
    const plan = buildReminderPlan({ frequency: { ...base, mode: 'every-72h' }, reminders, now, todayContexts: [], days: 4 });
    expect(summary(plan)).toEqual(['moment 21 07:30', 'moment 24 07:30']);
  });
});
