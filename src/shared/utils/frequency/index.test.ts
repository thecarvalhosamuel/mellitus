import { DEFAULT_SETTINGS } from '@/shared/constants/defaultSettings';
import { getCycleDay, getDayMoments } from '@/shared/utils/cycle';

import { cyclePeriod, cyclePosition, cycleStartFor, setMomentTime } from '.';

const base = { ...DEFAULT_SETTINGS.frequency, cycleStart: '2024-10-21' };
const today = '2024-10-24';

describe('ciclo', () => {
  it('período por modo', () => {
    expect(cyclePeriod('alternating')).toBe(2);
    expect(cyclePeriod('every-72h')).toBe(3);
    expect(cyclePeriod('3x')).toBeNull();
  });

  it('escolher "hoje é Dia B" ajusta o início e o ciclo confirma', () => {
    const frequency = { ...base, mode: 'alternating' as const, cycleStart: cycleStartFor(1, today) };
    expect(cyclePosition(frequency, today)).toBe(1);
    expect(getCycleDay(today, frequency.cycleStart)).toBe('B');
  });

  it('72h: "próxima medição amanhã" mede amanhã e não hoje', () => {
    const frequency = { ...base, mode: 'every-72h' as const, cycleStart: cycleStartFor(2, today) };
    expect(getDayMoments(frequency, today)).toEqual([]);
    expect(getDayMoments(frequency, '2024-10-25')).toHaveLength(1);
  });
});

describe('setMomentTime', () => {
  it('troca só o horário do momento escolhido', () => {
    const next = setMomentTime(base, 'dayA', 1, '13:30');
    expect(next.dayA?.moments.map((m) => m.time)).toEqual(['07:00', '13:30', '22:00']);
    expect(base.dayA?.moments[1].time).toBe('14:00');
  });
});
