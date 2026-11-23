import { getPeriodLabel, getPeriodRange } from '.';

const now = new Date(2024, 9, 24, 15, 0);

describe('períodos do gráfico', () => {
  it('mês atual e anterior em limites de mês local', () => {
    expect(getPeriodRange('current-month', now)).toEqual({ from: new Date(2024, 9, 1), to: new Date(2024, 10, 1) });
    expect(getPeriodRange('previous-month', now)).toEqual({ from: new Date(2024, 8, 1), to: new Date(2024, 9, 1) });
  });

  it('últimos N dias incluem hoje inteiro', () => {
    expect(getPeriodRange('last-7', now)).toEqual({ from: new Date(2024, 9, 18), to: new Date(2024, 9, 25) });
    expect(getPeriodRange('last-30', now).from).toEqual(new Date(2024, 8, 25));
  });

  it('janeiro volta para dezembro do ano anterior', () => {
    expect(getPeriodRange('previous-month', new Date(2025, 0, 10)).from).toEqual(new Date(2024, 11, 1));
  });

  it('rótulos', () => {
    expect(getPeriodLabel('current-month', now)).toBe('Outubro 2024');
    expect(getPeriodLabel('previous-month', now)).toBe('Setembro 2024');
    expect(getPeriodLabel('last-30', now)).toBe('Últimos 30 Dias');
  });
});
