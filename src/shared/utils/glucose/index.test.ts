import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';

import {
  clampManualValue,
  classifyGlucose,
  classifyReading,
  getRangePosition,
  getRangeZones,
  getStatusFamily,
  getTargetForContext,
  isValidManualValue,
} from '.';

const [standard, gestational] = DEFAULT_PATTERNS;
const alerts = { hypo: 70, hyper: 200 };
const fastingTarget = { min: 80, max: 130 };

describe('classifyGlucose', () => {
  it.each([
    [40, 'severe-hypo'],
    [53, 'severe-hypo'],
    [54, 'hypo'],
    [69, 'hypo'],
    [70, 'below-target'],
    [79, 'below-target'],
    [80, 'in-range'],
    [104, 'in-range'],
    [130, 'in-range'],
    [131, 'above-target'],
    [200, 'above-target'],
    [201, 'severe-hyper'],
    [450, 'severe-hyper'],
  ])('%i mg/dL em jejum (80–130) → %s', (value, expected) => {
    expect(classifyGlucose(value, fastingTarget, alerts)).toBe(expected);
  });

  it('meta só com máximo: abaixo do alerta de hipo continua hipo', () => {
    const target = { max: 180 };
    expect(classifyGlucose(75, target, alerts)).toBe('in-range');
    expect(classifyGlucose(65, target, alerts)).toBe('hypo');
    expect(classifyGlucose(181, target, alerts)).toBe('above-target');
  });

  it('perigo tem precedência quando o mínimo da meta é menor que o alerta de hipo', () => {
    expect(classifyGlucose(65, { min: 60, max: 120 }, alerts)).toBe('hypo');
  });

  it('respeita alertas personalizados', () => {
    expect(classifyGlucose(190, { min: 80, max: 140 }, { hypo: 75, hyper: 180 })).toBe('severe-hyper');
    expect(classifyGlucose(72, { min: 80, max: 140 }, { hypo: 75, hyper: 180 })).toBe('hypo');
  });
});

describe('getTargetForContext', () => {
  it('mapeia cada momento para a faixa do padrão', () => {
    expect(getTargetForContext(standard, 'fasting')).toEqual({ min: 80, max: 130 });
    expect(getTargetForContext(standard, 'pre-dinner')).toEqual({ min: 80, max: 130 });
    expect(getTargetForContext(standard, 'post-meal-2h')).toEqual({ max: 180 });
    expect(getTargetForContext(standard, 'post-dinner')).toEqual({ max: 180 });
    expect(getTargetForContext(standard, 'bedtime')).toEqual({ min: 100, max: 140 });
    expect(getTargetForContext(standard, 'overnight')).toEqual({ min: 100, max: 140 });
    expect(getTargetForContext(standard, 'other')).toEqual({ min: 80, max: 130 });
  });

  it('usa a faixa de jejum quando o padrão não tem meta para o contexto', () => {
    expect(getTargetForContext(gestational, 'bedtime')).toEqual({ min: 70, max: 95 });
  });
});

describe('classifyReading', () => {
  it('devolve status e o snapshot da meta usada', () => {
    expect(classifyReading(150, 'post-meal-2h', standard)).toEqual({
      status: 'in-range',
      target: { max: 180 },
    });
    expect(classifyReading(150, 'post-meal-1h', gestational)).toEqual({
      status: 'above-target',
      target: { max: 140 },
    });
  });
});

describe('getStatusFamily', () => {
  it('agrupa em verde, âmbar e crimson', () => {
    expect(getStatusFamily('in-range')).toBe('inRange');
    expect(getStatusFamily('below-target')).toBe('offTarget');
    expect(getStatusFamily('above-target')).toBe('offTarget');
    expect(getStatusFamily('hypo')).toBe('danger');
    expect(getStatusFamily('severe-hypo')).toBe('danger');
    expect(getStatusFamily('severe-hyper')).toBe('danger');
  });
});

describe('valor manual', () => {
  it('aceita só inteiros de 40 a 450', () => {
    expect(isValidManualValue(40)).toBe(true);
    expect(isValidManualValue(450)).toBe(true);
    expect(isValidManualValue(39)).toBe(false);
    expect(isValidManualValue(451)).toBe(false);
    expect(isValidManualValue(100.5)).toBe(false);
  });

  it('limita e arredonda', () => {
    expect(clampManualValue(10)).toBe(40);
    expect(clampManualValue(999)).toBe(450);
    expect(clampManualValue(104.6)).toBe(105);
  });
});

describe('barra de faixa glicêmica', () => {
  it('gera 5 zonas proporcionais à escala 40–300', () => {
    const zones = getRangeZones(fastingTarget, alerts);
    expect(zones.map((z) => [z.family, z.from, z.to])).toEqual([
      ['danger', 40, 70],
      ['offTarget', 70, 80],
      ['inRange', 80, 130],
      ['offTarget', 130, 200],
      ['danger', 200, 300],
    ]);
    expect(zones.reduce((sum, z) => sum + z.width, 0)).toBeCloseTo(1);
    expect(zones[2].width).toBeCloseTo(50 / 260);
  });

  it('omite a zona "abaixo da meta" quando a meta não tem mínimo', () => {
    const zones = getRangeZones({ max: 180 }, alerts);
    expect(zones.map((z) => z.family)).toEqual(['danger', 'inRange', 'offTarget', 'danger']);
  });

  it('posiciona o pip e limita aos extremos', () => {
    expect(getRangePosition(40)).toBe(0);
    expect(getRangePosition(300)).toBe(1);
    expect(getRangePosition(500)).toBe(1);
    expect(getRangePosition(170)).toBeCloseTo(0.5);
  });
});
