import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';
import { buildReading } from '@/shared/utils/reading';

import { READING_COLUMNS, buildReadingRows, formatSheetDate } from '.';

const pattern = DEFAULT_PATTERNS[0];
const at = (day: number, h: number) => new Date(2024, 9, day, h, 30).toISOString();

describe('formatSheetDate', () => {
  it('usa dd/mm/aaaa no horário local', () => {
    expect(formatSheetDate(new Date(2024, 0, 5, 23, 59))).toBe('05/01/2024');
  });
});

describe('buildReadingRows', () => {
  const rows = buildReadingRows([
    buildReading('a', { value: 104, context: 'fasting', timestamp: at(24, 7), note: '  Café  ' }, pattern),
    buildReading('b', { value: 188, context: 'post-meal-2h', timestamp: at(22, 20), insulinUnits: 1.5, isCorrection: true }, pattern),
  ]);

  it('começa pelo cabeçalho com todas as colunas', () => {
    expect(rows[0]).toEqual(READING_COLUMNS.map((c) => c.header));
    expect(rows.every((row) => row.length === READING_COLUMNS.length)).toBe(true);
  });

  it('ordena por data e mantém números como número', () => {
    expect(rows[1]).toEqual([
      '22/10/2024', '20:30', '2h pós-refeição', 188, null, 180, 'Acima da Meta', 1.5, 'Sim', null, null, 'Manual',
    ]);
    expect(rows[2]).toEqual([
      '24/10/2024', '07:30', 'Jejum', 104, 80, 130, 'No Alvo', null, null, null, 'Café', 'Manual',
    ]);
  });

  it('período vazio gera só o cabeçalho', () => {
    expect(buildReadingRows([])).toHaveLength(1);
  });
});
