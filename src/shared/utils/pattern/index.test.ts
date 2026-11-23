import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';

import { simulateTimeInRange, validatePatternDraft, type PatternDraftValues } from '.';

const base: PatternDraftValues = { ...DEFAULT_PATTERNS[0], name: 'Plano Dr. Roberto' };

describe('validatePatternDraft', () => {
  it('padrão coerente não tem erros', () => {
    expect(validatePatternDraft(base)).toEqual({});
  });

  it('exige nome', () => {
    expect(validatePatternDraft({ ...base, name: '  ' }).name).toBeDefined();
  });

  it('faixas precisam de mínimo < máximo e valores de 40 a 450', () => {
    expect(validatePatternDraft({ ...base, fasting: { min: 130, max: 80 } }).fasting).toMatch(/maior/);
    expect(validatePatternDraft({ ...base, fasting: { min: 80 } }).fasting).toMatch(/máximo/);
    expect(validatePatternDraft({ ...base, postprandial: { windowHours: 2 } }).postprandial).toMatch(/máximo/);
    expect(validatePatternDraft({ ...base, bedtime: { min: 30, max: 140 } }).bedtime).toMatch(/40 e 450/);
  });

  it('ao deitar é opcional', () => {
    expect(validatePatternDraft({ ...base, bedtime: {} })).toEqual({});
  });

  it('alertas precisam ficar fora das metas', () => {
    expect(validatePatternDraft({ ...base, alerts: { ...base.alerts, hypo: 90 } }).hypo).toMatch(/abaixo/);
    expect(validatePatternDraft({ ...base, alerts: { ...base.alerts, hypo: 50 } }).hypo).toMatch(/54/);
    expect(validatePatternDraft({ ...base, alerts: { ...base.alerts, hyper: 170 } }).hyper).toMatch(/acima/);
  });
});

describe('simulateTimeInRange', () => {
  const readings = [
    { value: 125, context: 'fasting' as const, timestamp: '2024-10-01T10:00:00.000Z' },
    { value: 100, context: 'fasting' as const, timestamp: '2024-10-02T10:00:00.000Z' },
    { value: 170, context: 'post-meal-2h' as const, timestamp: '2024-10-03T10:00:00.000Z' },
    { value: 60, context: 'fasting' as const, timestamp: '2024-10-04T10:00:00.000Z' },
  ];

  it('reclassifica as leituras com as metas em edição', () => {
    expect(simulateTimeInRange(readings, base).tir).toEqual({ below: 0.25, inRange: 0.75, above: 0 });
    const strict = { ...base, fasting: { min: 70, max: 110 }, postprandial: { max: 140, windowHours: 2 as const } };
    expect(simulateTimeInRange(readings, strict).tir).toEqual({ below: 0.25, inRange: 0.25, above: 0.5 });
  });

  it('sem leituras, sem simulação', () => {
    expect(simulateTimeInRange([], base)).toEqual({ count: 0, tir: { below: 0, inRange: 0, above: 0 } });
  });
});
