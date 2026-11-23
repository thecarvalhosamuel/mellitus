import type { GlucoseReading, MealContext } from '@/shared/types/reading';

import { buildMonthOptions, countByFilter, groupByDay, matchesFilter, parseMonthKey } from '.';

const reading = (id: string, day: number, hour: number, context: MealContext = 'fasting'): GlucoseReading => ({
  id,
  value: 100,
  timestamp: new Date(2024, 9, day, hour).toISOString(),
  context,
  status: 'in-range',
  source: 'manual',
});

describe('filtros por momento', () => {
  it('agrupa momentos parecidos e "Todos" inclui "Outro"', () => {
    expect(matchesFilter({ context: 'pre-dinner' }, 'pre-meal')).toBe(true);
    expect(matchesFilter({ context: 'post-dinner' }, 'post-meal')).toBe(true);
    expect(matchesFilter({ context: 'overnight' }, 'night')).toBe(true);
    expect(matchesFilter({ context: 'other' }, 'all')).toBe(true);
    expect(matchesFilter({ context: 'other' }, 'fasting')).toBe(false);
  });

  it('conta leituras por filtro', () => {
    const contexts: MealContext[] = ['fasting', 'fasting', 'post-meal-2h', 'bedtime', 'other'];
    expect(countByFilter(contexts.map((context) => ({ context })))).toEqual({
      all: 5,
      fasting: 2,
      'pre-meal': 0,
      'post-meal': 1,
      night: 1,
    });
  });
});

describe('groupByDay', () => {
  const readings = [reading('a', 22, 7), reading('b', 23, 22), reading('c', 23, 7), reading('d', 24, 7)];

  it('mais recente primeiro: dias e leituras em ordem decrescente', () => {
    const groups = groupByDay(readings, 'desc');
    expect(groups.map((g) => g.dateKey)).toEqual(['2024-10-24', '2024-10-23', '2024-10-22']);
    expect(groups[1].readings.map((r) => r.id)).toEqual(['b', 'c']);
  });

  it('mais antigo primeiro: ordem crescente', () => {
    const groups = groupByDay(readings, 'asc');
    expect(groups.map((g) => g.dateKey)).toEqual(['2024-10-22', '2024-10-23', '2024-10-24']);
    expect(groups[1].readings.map((r) => r.id)).toEqual(['c', 'b']);
  });

  it('lista vazia não gera grupos', () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe('meses', () => {
  it('mês atual sempre aparece, mesmo sem leituras, e a lista vem do mais recente', () => {
    const options = buildMonthOptions(
      [
        { month: '2024-09', total: 88 },
        { month: '2024-08', total: 92 },
      ],
      new Date(2024, 9, 24),
    );
    expect(options).toEqual([
      { key: '2024-10', total: 0, isCurrent: true },
      { key: '2024-09', total: 88, isCurrent: false },
      { key: '2024-08', total: 92, isCurrent: false },
    ]);
  });

  it('converte a chave do mês', () => {
    expect(parseMonthKey('2024-10')).toEqual({ year: 2024, month: 10 });
  });
});
