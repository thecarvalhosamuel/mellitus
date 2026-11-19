import type { FrequencySchedule } from '@/shared/types/schedule';
import { addDays, daysBetween, toDateKey } from '@/shared/utils/date';

import { getCycleDay, getDayMoments, getDayProgress, getScheduleCycleDay, suggestReadingContext } from '.';

const dayA = {
  label: 'Dia A',
  moments: [
    { context: 'fasting' as const, time: '07:00' },
    { context: 'post-meal-2h' as const, time: '14:00' },
    { context: 'bedtime' as const, time: '22:00' },
  ],
};
const dayB = { label: 'Dia B', moments: [{ context: 'fasting' as const, time: '07:30' }] };

const schedule = (mode: FrequencySchedule['mode'], extra: Partial<FrequencySchedule> = {}): FrequencySchedule => ({
  mode,
  dayA,
  dayB,
  cycleStart: '2024-10-21',
  ...extra,
});

describe('datas', () => {
  it('conta dias de calendário, inclusive atravessando meses', () => {
    expect(daysBetween('2024-10-21', '2024-10-24')).toBe(3);
    expect(daysBetween('2024-10-31', '2024-11-01')).toBe(1);
    expect(daysBetween('2024-10-24', '2024-10-21')).toBe(-3);
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
  });

  it('usa o dia local da data', () => {
    expect(toDateKey(new Date(2024, 9, 24, 23, 59))).toBe('2024-10-24');
  });
});

describe('getCycleDay', () => {
  it('alterna A e B a partir do início do ciclo', () => {
    expect(getCycleDay('2024-10-21', '2024-10-21')).toBe('A');
    expect(getCycleDay('2024-10-22', '2024-10-21')).toBe('B');
    expect(getCycleDay('2024-10-23', '2024-10-21')).toBe('A');
    expect(getCycleDay('2024-10-24', '2024-10-21')).toBe('B');
  });

  it('continua coerente antes do início e na virada do mês', () => {
    expect(getCycleDay('2024-10-20', '2024-10-21')).toBe('B');
    expect(getCycleDay('2024-10-19', '2024-10-21')).toBe('A');
    expect(getCycleDay('2024-11-01', '2024-10-31')).toBe('B');
  });
});

describe('getDayMoments', () => {
  it('3x e 1x usam sempre a mesma rotina', () => {
    expect(getDayMoments(schedule('3x'), '2024-10-22')).toHaveLength(3);
    expect(getDayMoments(schedule('1x'), '2024-10-21')).toEqual(dayB.moments);
  });

  it('ciclo alternado: Dia A 3x, Dia B 1x', () => {
    expect(getDayMoments(schedule('alternating'), '2024-10-23')).toEqual(dayA.moments);
    expect(getDayMoments(schedule('alternating'), '2024-10-24')).toEqual(dayB.moments);
    expect(getScheduleCycleDay(schedule('alternating'), '2024-10-24')).toBe('B');
    expect(getScheduleCycleDay(schedule('3x'), '2024-10-24')).toBeUndefined();
  });

  it('dia sim, dia não: 3x no dia ativo e descanso no seguinte', () => {
    expect(getDayMoments(schedule('every-other-day'), '2024-10-21')).toHaveLength(3);
    expect(getDayMoments(schedule('every-other-day'), '2024-10-22')).toEqual([]);
  });

  it('espaçado: 1x em jejum a cada 72h', () => {
    const s = schedule('every-72h');
    expect(['2024-10-21', '2024-10-22', '2024-10-23', '2024-10-24'].map((d) => getDayMoments(s, d).length)).toEqual([
      1, 0, 0, 1,
    ]);
  });

  it('personalizado usa os momentos escolhidos, sem horário', () => {
    const s = schedule('custom', { customMoments: ['fasting', 'pre-dinner'] });
    expect(getDayMoments(s, '2024-10-22')).toEqual([{ context: 'fasting' }, { context: 'pre-dinner' }]);
  });
});

describe('getDayProgress', () => {
  it('conta momentos feitos por contexto (ex.: 1/3)', () => {
    const progress = getDayProgress(dayA.moments, ['fasting']);
    expect(progress.done).toBe(1);
    expect(progress.total).toBe(3);
    expect(progress.moments.map((m) => m.done)).toEqual([true, false, false]);
  });

  it('uma leitura cumpre só um momento, e leituras extras não passam do total', () => {
    const moments = [
      { context: 'fasting' as const },
      { context: 'fasting' as const },
    ];
    expect(getDayProgress(moments, ['fasting']).done).toBe(1);
    expect(getDayProgress(dayB.moments, ['fasting', 'fasting', 'bedtime']).done).toBe(1);
  });

  it('dia de descanso tem 0/0', () => {
    expect(getDayProgress([], ['fasting'])).toEqual({ done: 0, total: 0, moments: [] });
  });
});

describe('suggestReadingContext', () => {
  const at = (h: number, m = 0) => new Date(2024, 9, 24, h, m);

  it('prefere o momento pendente da rotina mais próximo (até 90 min)', () => {
    expect(suggestReadingContext(at(13, 20), dayA.moments)).toBe('post-meal-2h');
    expect(suggestReadingContext(at(21, 0), dayA.moments)).toBe('bedtime');
  });

  it('usa a faixa de horário quando nenhum momento está perto', () => {
    expect(suggestReadingContext(at(7, 30))).toBe('fasting');
    expect(suggestReadingContext(at(11, 0))).toBe('pre-meal');
    expect(suggestReadingContext(at(14, 0))).toBe('post-meal-2h');
    expect(suggestReadingContext(at(18, 0))).toBe('pre-dinner');
    expect(suggestReadingContext(at(20, 30))).toBe('post-dinner');
    expect(suggestReadingContext(at(23, 0))).toBe('bedtime');
    expect(suggestReadingContext(at(3, 0))).toBe('overnight');
    expect(suggestReadingContext(at(10, 0), [{ context: 'bedtime', time: '22:00' }])).toBe('pre-meal');
  });
});
