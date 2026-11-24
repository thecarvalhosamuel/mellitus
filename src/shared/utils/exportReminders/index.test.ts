import { DEFAULT_SETTINGS } from '@/shared/constants/defaultSettings';

import { buildExportReminderPlan, describeWeekly, previousMonth, previousWeekPeriod } from '.';

const settings = DEFAULT_SETTINGS.exportReminders;

describe('buildExportReminderPlan', () => {
  it('nada agendado com os dois desligados (padrão)', () => {
    expect(buildExportReminderPlan(settings)).toEqual([]);
  });

  it('semanal na segunda 08:00 e mensal no dia 1º 08:00', () => {
    const plan = buildExportReminderPlan({
      weeklyXlsx: { ...settings.weeklyXlsx, enabled: true },
      monthlyPdf: { enabled: true },
    });
    expect(plan.map((p) => [p.id, p.repeat])).toEqual([
      ['export-weekly', { every: 'week', weekday: 1, hour: 8, minute: 0 }],
      ['export-monthly', { every: 'month', day: 1, hour: 8, minute: 0 }],
    ]);
  });

  it('descreve o horário semanal', () => {
    expect(describeWeekly(settings.weeklyXlsx)).toBe('toda segunda às 08:00');
  });
});

describe('períodos', () => {
  it('semana: os 7 dias completos antes de hoje', () => {
    const period = previousWeekPeriod(new Date(2024, 10, 25, 8, 0)); // segunda
    expect(period.from).toEqual(new Date(2024, 10, 18));
    expect(period.to).toEqual(new Date(2024, 10, 25));
    expect(period.label).toBe('18/11 a 24/11');
    expect(period.fileKey).toBe('2024-11-18_a_2024-11-24');
  });

  it('mês anterior, atravessando o ano', () => {
    expect(previousMonth(new Date(2024, 10, 1, 8))).toEqual({ year: 2024, month: 10, label: 'Outubro 2024' });
    expect(previousMonth(new Date(2025, 0, 1, 8))).toEqual({ year: 2024, month: 12, label: 'Dezembro 2024' });
  });
});
