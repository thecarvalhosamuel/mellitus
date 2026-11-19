import {
  formatDayHeader,
  formatGlucose,
  formatInsulin,
  formatLongDate,
  formatMonthYear,
  formatNumber,
  formatPercent,
  formatReadingCount,
  formatReadingMoment,
  formatShortDate,
  formatTargetRange,
  formatTime,
  formatVariability,
} from '.';

const now = new Date(2024, 9, 24, 12, 0); // quinta-feira, 24/10/2024

describe('números', () => {
  it('usa vírgula decimal e remove zeros à direita', () => {
    expect(formatNumber(1.5, 1)).toBe('1,5');
    expect(formatNumber(2, 1)).toBe('2');
    expect(formatNumber(104.4)).toBe('104');
  });

  it('formata glicemia, porcentagem e variabilidade', () => {
    expect(formatGlucose(104.4)).toBe('104');
    expect(formatPercent(0.876)).toBe('88%');
    expect(formatVariability(18.4)).toBe('±18');
  });

  it('formata a meta vinda do padrão', () => {
    expect(formatTargetRange({ min: 80, max: 130 })).toBe('80–130');
    expect(formatTargetRange({ max: 180 })).toBe('máx 180');
    expect(formatTargetRange({ min: 70 })).toBe('mín 70');
    expect(formatTargetRange({})).toBe('');
    expect(formatTargetRange(undefined)).toBe('');
  });

  it('formata insulina e correção', () => {
    expect(formatInsulin(undefined)).toBe('0 UI');
    expect(formatInsulin(4)).toBe('4 UI');
    expect(formatInsulin(1.5)).toBe('1,5 UI');
    expect(formatInsulin(1, true)).toBe('Correção +1 UI');
  });
});

describe('datas', () => {
  it('formata hora e datas por extenso', () => {
    expect(formatTime(new Date(2024, 9, 24, 7, 5))).toBe('07:05');
    expect(formatLongDate(now)).toBe('Quinta-feira, 24 de Outubro');
    expect(formatShortDate(new Date(2024, 9, 21))).toBe('21 Out');
    expect(formatMonthYear(2024, 10)).toBe('Outubro 2024');
  });

  it('cabeçalho do dia com Hoje e Ontem', () => {
    expect(formatDayHeader(new Date(2024, 9, 24, 7, 30), now)).toBe('Hoje, 24 de Outubro');
    expect(formatDayHeader(new Date(2024, 9, 23, 22, 15), now)).toBe('Ontem, 23 de Outubro');
    expect(formatDayHeader(new Date(2024, 9, 22, 20, 30), now)).toBe('Terça-feira, 22 de Outubro');
  });

  it('momento da leitura relativo a hoje', () => {
    expect(formatReadingMoment(new Date(2024, 9, 24, 7, 30), now)).toBe('Hoje às 07:30');
    expect(formatReadingMoment(new Date(2024, 9, 23, 22, 15), now)).toBe('Ontem às 22:15');
    expect(formatReadingMoment(new Date(2024, 9, 22, 20, 30), now)).toBe('22/10 às 20:30');
  });

  it('contagem de registros no singular e plural', () => {
    expect(formatReadingCount(1)).toBe('1 registro');
    expect(formatReadingCount(3)).toBe('3 registros');
  });
});
