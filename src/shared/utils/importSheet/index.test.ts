import { buildReadingRows } from '@/shared/utils/spreadsheet';
import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';
import { buildReading } from '@/shared/utils/reading';

import {
  detectColumns,
  detectCsvDelimiter,
  missingRequired,
  parseContextCell,
  parseDateCell,
  parseImportTable,
  parseNumberCell,
  parseTimeCell,
  readingKey,
  toImportTable,
} from '.';

const now = new Date(2024, 9, 31, 12, 0);

describe('células', () => {
  it('datas no padrão brasileiro, ISO e série do Excel', () => {
    expect(parseDateCell('05/01/2024')).toEqual({ d: 5, m: 1, y: 2024 });
    expect(parseDateCell('5/1/24 07:30')).toEqual({ d: 5, m: 1, y: 2024, h: 7, min: 30 });
    expect(parseDateCell('2024-10-24T20:15')).toEqual({ y: 2024, m: 10, d: 24, h: 20, min: 15 });
    expect(parseDateCell(45589.3125)).toEqual({ y: 2024, m: 10, d: 24, h: 7, min: 30 });
    expect(parseDateCell('31/02/2024')).toBeNull();
    expect(parseDateCell('ontem')).toBeNull();
    expect(parseDateCell(null)).toBeNull();
  });

  it('hora em texto ou fração de dia', () => {
    expect(parseTimeCell('07:30')).toEqual({ h: 7, min: 30 });
    expect(parseTimeCell('7h05')).toEqual({ h: 7, min: 5 });
    expect(parseTimeCell(0.8125)).toEqual({ h: 19, min: 30 });
    expect(parseTimeCell('25:00')).toBeNull();
  });

  it('números com vírgula e unidade', () => {
    expect(parseNumberCell('104 mg/dL')).toBe(104);
    expect(parseNumberCell('1,5')).toBe(1.5);
    expect(parseNumberCell('HI')).toBeNull();
    expect(parseNumberCell('')).toBeNull();
  });

  it('momento por rótulo, identificador ou palavras comuns', () => {
    expect(parseContextCell('Jejum')).toBe('fasting');
    expect(parseContextCell('2h pós-refeição')).toBe('post-meal-2h');
    expect(parseContextCell('post-meal-1h')).toBe('post-meal-1h');
    expect(parseContextCell('Antes do almoço')).toBe('pre-meal');
    expect(parseContextCell('1h após almoço')).toBe('post-meal-1h');
    expect(parseContextCell('Depois do jantar')).toBe('post-dinner');
    expect(parseContextCell('Antes de dormir')).toBe('bedtime');
    expect(parseContextCell('Lanche')).toBe('other');
    expect(parseContextCell(null)).toBe('other');
  });
});

describe('detectColumns', () => {
  it('reconhece o cabeçalho exportado pelo Mellitus', () => {
    const [headers] = buildReadingRows([]);
    expect(detectColumns(headers as string[])).toEqual({
      date: 0, time: 1, context: 2, value: 3, insulin: 7, correction: 8, cycleDay: 9, note: 10,
    });
  });

  it('reconhece cabeçalhos comuns de glicosímetros', () => {
    expect(detectColumns(['Data/Hora', 'Glicose (mg/dL)', 'Evento', 'Observações'])).toEqual({
      date: 0, value: 1, context: 2, note: 3,
    });
    expect(missingRequired(detectColumns(['Hora', 'Nota']))).toEqual(['date', 'value']);
  });
});

describe('parseImportTable', () => {
  const table = toImportTable(
    [
      [null, null, null],
      ['Data', 'Hora', 'Glicemia', 'Momento', 'Insulina', 'Correção'],
      ['24/10/2024', '07:30', '104', 'Jejum', null, null],
      ['24/10/2024', '07:30', 104, 'Jejum', null, null],
      ['24/10/2024', '20:00', 188, '2h pós-refeição', '1,5', 'Sim'],
      [null, null, null],
      ['32/10/2024', '08:00', 100],
      ['25/10/2024', '08:00', 'HI'],
      ['25/10/2024', '08:00', 15],
      ['10/12/2024', '08:00', 100],
    ],
    1,
  );
  const result = parseImportTable(table, detectColumns(table.headers), now);

  it('aceita linhas válidas e descarta repetições do próprio arquivo', () => {
    expect(result.candidates).toHaveLength(2);
    expect(result.duplicatesInFile).toBe(1);
    expect(result.candidates[1]).toEqual({
      row: 5,
      key: readingKey(new Date(2024, 9, 24, 20, 0).toISOString(), 188),
      input: {
        value: 188,
        timestamp: new Date(2024, 9, 24, 20, 0).toISOString(),
        context: 'post-meal-2h',
        insulinUnits: 1.5,
        isCorrection: true,
        source: 'import',
      },
    });
  });

  it('aponta linhas inválidas com o número da linha na planilha', () => {
    expect(result.issues).toEqual([
      { row: 7, reason: 'Data inválida ou vazia' },
      { row: 8, reason: 'Glicemia vazia ou não numérica' },
      { row: 9, reason: 'Glicemia fora de 20–600 mg/dL' },
      { row: 10, reason: 'Data no futuro' },
    ]);
  });

  it('reimportar a própria exportação gera as mesmas chaves (sem segundos)', () => {
    const original = buildReading(
      'x',
      { value: 120, context: 'bedtime', timestamp: new Date(2024, 9, 20, 22, 10, 42).toISOString() },
      DEFAULT_PATTERNS[0],
    );
    const exported = toImportTable(buildReadingRows([original]));
    const [candidate] = parseImportTable(exported, detectColumns(exported.headers), now).candidates;
    expect(candidate.key).toBe(readingKey(original.timestamp, original.value));
    expect(candidate.input.context).toBe('bedtime');
  });
});

describe('detectCsvDelimiter', () => {
  it('escolhe o separador mais frequente na primeira linha', () => {
    expect(detectCsvDelimiter('Data;Hora;Glicemia\n24/10/2024;07:30;104')).toBe(';');
    expect(detectCsvDelimiter('Data,Hora\n')).toBe(',');
    expect(detectCsvDelimiter('Data\tHora')).toBe('\t');
  });
});
