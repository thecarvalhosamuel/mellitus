import type { ExportReminders } from '@/shared/types/settings';
import { timeToMinutes } from '@/shared/utils/date';
import { formatMonthYear } from '@/shared/utils/format';

// Lembretes de exportação (DESIGN.md §5.5, passo 3): o toque gera o arquivo do
// período que acabou de fechar e abre a folha de compartilhamento.

export type ExportReminderKind = 'export-weekly' | 'export-monthly';

/** Laudo mensal: dia 1º às 08:00, com o mês anterior. */
export const MONTHLY_EXPORT = { day: 1, time: '08:00' } as const;

export type ExportReminderPlanItem = {
  id: ExportReminderKind;
  title: string;
  body: string;
  /** Semanal: weekday 0–6 (domingo = 0, como Date.getDay). */
  repeat: { every: 'week'; weekday: number; hour: number; minute: number } | { every: 'month'; day: number; hour: number; minute: number };
};

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const clock = (time: string) => {
  const minutes = timeToMinutes(time);
  return { hour: Math.floor(minutes / 60), minute: minutes % 60 };
};

/** "toda segunda às 08:00" */
export function describeWeekly(weekly: ExportReminders['weeklyXlsx']): string {
  return `toda ${WEEKDAYS[weekly.weekday] ?? 'segunda'} às ${weekly.time}`;
}

/** Notificações repetidas que devem existir com as configurações atuais. */
export function buildExportReminderPlan(settings: ExportReminders): ExportReminderPlanItem[] {
  const plan: ExportReminderPlanItem[] = [];
  if (settings.weeklyXlsx.enabled) {
    plan.push({
      id: 'export-weekly',
      title: 'Planilha da semana',
      body: 'Toque para gerar a planilha dos últimos 7 dias e escolher com quem compartilhar.',
      repeat: { every: 'week', weekday: settings.weeklyXlsx.weekday, ...clock(settings.weeklyXlsx.time) },
    });
  }
  if (settings.monthlyPdf.enabled) {
    plan.push({
      id: 'export-monthly',
      title: 'Laudo do mês',
      body: 'Toque para gerar o laudo do mês que passou e levar à consulta.',
      repeat: { every: 'month', day: MONTHLY_EXPORT.day, ...clock(MONTHLY_EXPORT.time) },
    });
  }
  return plan;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export type ExportPeriod = { from: Date; to: Date; label: string; fileKey: string };

/** Os 7 dias completos antes de hoje: [hoje − 7, hoje), em horário local. */
export function previousWeekPeriod(now: Date): ExportPeriod {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 7);
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate() - 1);
  const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  return { from, to, label: `${short(from)} a ${short(last)}`, fileKey: `${dayKey(from)}_a_${dayKey(last)}` };
}

/** O mês anterior ao de `now` (month = 1–12). */
export function previousMonth(now: Date): { year: number; month: number; label: string } {
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = first.getFullYear();
  const month = first.getMonth() + 1;
  return { year, month, label: formatMonthYear(year, month) };
}
