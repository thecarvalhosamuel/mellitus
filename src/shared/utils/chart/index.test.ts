import { glucoseDomain, linearScale, monotonePath, pickTickIndexes } from '.';

describe('linearScale', () => {
  it('mapeia o domínio para a faixa, inclusive invertida (eixo Y do SVG)', () => {
    const y = linearScale([60, 200], [160, 0]);
    expect(y(60)).toBe(160);
    expect(y(200)).toBe(0);
    expect(y(130)).toBe(80);
  });

  it('domínio de um único valor cai no meio', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(50);
  });
});

describe('glucoseDomain', () => {
  it('inclui a faixa-alvo e as leituras com folga', () => {
    expect(glucoseDomain([104, 99, 152], { min: 80, max: 130 })).toEqual([60, 200]);
  });

  it('abre espaço para hipo e hiper', () => {
    expect(glucoseDomain([45, 320], { min: 80, max: 130 })).toEqual([30, 340]);
  });

  it('sem leituras ainda mostra a faixa padrão', () => {
    expect(glucoseDomain([], {})).toEqual([60, 200]);
  });
});

describe('monotonePath', () => {
  it('casos triviais', () => {
    expect(monotonePath([])).toBe('');
    expect(monotonePath([{ x: 0, y: 10 }])).toBe('M0,10');
  });

  it('gera uma curva cúbica por segmento passando por todos os pontos', () => {
    const d = monotonePath([
      { x: 0, y: 100 },
      { x: 10, y: 50 },
      { x: 20, y: 80 },
    ]);
    expect(d.startsWith('M0,100')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d.endsWith('20,80')).toBe(true);
  });

  it('não ultrapassa um pico (tangente zero no extremo local)', () => {
    const d = monotonePath([
      { x: 0, y: 100 },
      { x: 10, y: 50 },
      { x: 20, y: 100 },
    ]);
    // Os pontos de controle ao redor do vale ficam na mesma altura do vale.
    expect(d).toContain('6.67,50 10,50');
    expect(d).toContain('C13.33,50');
  });
});

describe('pickTickIndexes', () => {
  it('escolhe índices espaçados incluindo o primeiro e o último', () => {
    expect(pickTickIndexes(10, 4)).toEqual([0, 3, 6, 9]);
    expect(pickTickIndexes(3, 4)).toEqual([0, 1, 2]);
    expect(pickTickIndexes(0)).toEqual([]);
  });
});
