import type { GlucoseStatus } from '@/shared/types/reading';

import { computeStats } from '.';

const reading = (value: number, status: GlucoseStatus, day: number) => ({
  value,
  status,
  timestamp: new Date(2024, 9, day, 7, 30).toISOString(),
});

describe('computeStats', () => {
  it('período vazio não inventa números', () => {
    const stats = computeStats([]);
    expect(stats.count).toBe(0);
    expect(stats.mean).toBeNull();
    expect(stats.min).toBeNull();
    expect(stats.tir).toEqual({ below: 0, inRange: 0, above: 0 });
  });

  it('calcula média, desvio, mínima e máxima com o dia', () => {
    const stats = computeStats([
      reading(100, 'in-range', 3),
      reading(120, 'in-range', 1),
      reading(80, 'in-range', 2),
    ]);
    expect(stats.count).toBe(3);
    expect(stats.mean).toBe(100);
    expect(stats.sd).toBeCloseTo(16.33, 2);
    expect(stats.cv).toBeCloseTo(0.1633, 3);
    expect(stats.min).toEqual({ value: 80, timestamp: new Date(2024, 9, 2, 7, 30).toISOString() });
    expect(stats.max?.value).toBe(120);
  });

  it('em empate, a mínima é a leitura mais antiga', () => {
    const stats = computeStats([reading(90, 'in-range', 5), reading(90, 'in-range', 2)]);
    expect(stats.min?.timestamp).toBe(new Date(2024, 9, 2, 7, 30).toISOString());
  });

  it('TIR, abaixo e acima somam 100%', () => {
    const stats = computeStats([
      reading(104, 'in-range', 1),
      reading(99, 'in-range', 2),
      reading(92, 'in-range', 3),
      reading(110, 'in-range', 4),
      reading(122, 'in-range', 5),
      reading(138, 'in-range', 6),
      reading(188, 'above-target', 7),
      reading(68, 'hypo', 8),
      reading(50, 'severe-hypo', 9),
      reading(250, 'severe-hyper', 10),
    ]);
    expect(stats.tir.inRange).toBeCloseTo(0.6);
    expect(stats.tir.below).toBeCloseTo(0.2);
    expect(stats.tir.above).toBeCloseTo(0.2);
    expect(stats.tir.below + stats.tir.inRange + stats.tir.above).toBeCloseTo(1);
    expect(stats.byStatus['severe-hypo']).toBe(1);
  });
});
