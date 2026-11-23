import { CONTEXT_FILTERS, type ContextFilter } from '@/shared/constants/readingContexts';
import type { GlucoseReading } from '@/shared/types/reading';
import { toDateKey } from '@/shared/utils/date';

export type SortOrder = 'desc' | 'asc';

export function matchesFilter(reading: Pick<GlucoseReading, 'context'>, filter: ContextFilter): boolean {
  const contexts = CONTEXT_FILTERS.find((f) => f.value === filter)?.contexts ?? 'all';
  return contexts === 'all' || contexts.includes(reading.context);
}

/** Quantas leituras cada filtro mostraria (rótulos "Todos (42)", "Jejum (12)"…). */
export function countByFilter(readings: Pick<GlucoseReading, 'context'>[]): Record<ContextFilter, number> {
  return Object.fromEntries(
    CONTEXT_FILTERS.map((f) => [f.value, readings.filter((r) => matchesFilter(r, f.value)).length]),
  ) as Record<ContextFilter, number>;
}

export type DayGroup = {
  /** "YYYY-MM-DD" local. */
  dateKey: string;
  readings: GlucoseReading[];
};

/** Agrupa por dia local, com dias e leituras na mesma ordem escolhida. */
export function groupByDay(readings: GlucoseReading[], order: SortOrder = 'desc'): DayGroup[] {
  const sign = order === 'desc' ? -1 : 1;
  const sorted = [...readings].sort((a, b) => sign * (Date.parse(a.timestamp) - Date.parse(b.timestamp)));
  const groups: DayGroup[] = [];
  for (const reading of sorted) {
    const dateKey = toDateKey(reading.timestamp);
    const last = groups[groups.length - 1];
    if (last?.dateKey === dateKey) last.readings.push(reading);
    else groups.push({ dateKey, readings: [reading] });
  }
  return groups;
}

export type MonthKey = { year: number; month: number };

export const monthKeyOf = (date: Date): MonthKey => ({ year: date.getFullYear(), month: date.getMonth() + 1 });

export const monthKeyToString = ({ year, month }: MonthKey) => `${year}-${String(month).padStart(2, '0')}`;

export function parseMonthKey(key: string): MonthKey {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

/**
 * Opções do seletor de mês: o mês atual sempre aparece (mesmo vazio), seguido
 * dos meses com leituras, do mais recente ao mais antigo.
 */
export function buildMonthOptions(
  counts: { month: string; total: number }[],
  now: Date = new Date(),
): { key: string; total: number; isCurrent: boolean }[] {
  const current = monthKeyToString(monthKeyOf(now));
  const byKey = new Map(counts.map((c) => [c.month, c.total]));
  if (!byKey.has(current)) byKey.set(current, 0);
  return [...byKey.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, total]) => ({ key, total, isCurrent: key === current }));
}
