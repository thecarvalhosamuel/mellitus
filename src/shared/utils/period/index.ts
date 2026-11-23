import { formatMonthYear } from '@/shared/utils/format';

export type ChartPeriod = 'current-month' | 'previous-month' | 'last-30' | 'last-7';

export const CHART_PERIODS: ChartPeriod[] = ['current-month', 'previous-month', 'last-30', 'last-7'];

/** Intervalo local [from, to) do período, terminando no fim de hoje para os "últimos N dias". */
export function getPeriodRange(period: ChartPeriod, now: Date = new Date()): { from: Date; to: Date } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const tomorrow = new Date(y, m, now.getDate() + 1);
  switch (period) {
    case 'current-month':
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 1) };
    case 'previous-month':
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 1) };
    case 'last-30':
      return { from: new Date(y, m, now.getDate() - 29), to: tomorrow };
    case 'last-7':
      return { from: new Date(y, m, now.getDate() - 6), to: tomorrow };
  }
}

/** "Outubro 2024", "Setembro 2024", "Últimos 30 Dias", "Últimos 7 Dias" (DESIGN.md §5.1). */
export function getPeriodLabel(period: ChartPeriod, now: Date = new Date()): string {
  const { from } = getPeriodRange(period, now);
  switch (period) {
    case 'current-month':
    case 'previous-month':
      return formatMonthYear(from.getFullYear(), from.getMonth() + 1);
    case 'last-30':
      return 'Últimos 30 Dias';
    case 'last-7':
      return 'Últimos 7 Dias';
  }
}
