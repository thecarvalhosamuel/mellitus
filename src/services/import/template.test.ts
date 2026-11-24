import { read, utils } from 'xlsx';

import { buildSheetsWorkbookBytes } from '@/services/export/xlsx/workbook';
import {
  IMPORT_FIELDS,
  detectColumns,
  detectCsvDelimiter,
  missingRequired,
  parseImportTable,
  toImportTable,
  type Cell,
} from '@/shared/utils/importSheet';
import { TEMPLATE_HEADERS, buildImportTemplateCsv, buildImportTemplateSheets } from '@/shared/utils/importTemplate';

import { readSpreadsheet } from './workbook';

// O modelo que o app gera (Histórico → Importar → Baixar modelo) precisa ser
// reconhecido pelo importador. docs/ guarda uma cópia para enviar por fora do app.
// Para regerar as cópias (.xlsx e .csv): $env:UPDATE_TEMPLATE='1'; npx jest template

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs') as {
  readFileSync: ((path: string) => Uint8Array) & ((path: string, encoding: 'utf8') => string);
  writeFileSync: (path: string, data: Uint8Array | string) => void;
};
const DOCS_COPY = `${process.cwd()}/docs/modelo-importacao-leituras.xlsx`;
const DOCS_CSV_COPY = `${process.cwd()}/docs/modelo-importacao-leituras.csv`;

const bytes = buildSheetsWorkbookBytes(buildImportTemplateSheets());
const csv = buildImportTemplateCsv();
if (process.env.UPDATE_TEMPLATE === '1') {
  fs.writeFileSync(DOCS_COPY, bytes);
  fs.writeFileSync(DOCS_CSV_COPY, csv);
}

const sheetValues = (data: Uint8Array) => {
  const book = read(data, { type: 'array' });
  return book.SheetNames.map((name) => ({
    name,
    rows: utils.sheet_to_json<Cell[]>(book.Sheets[name], { header: 1, raw: true, defval: null }),
  }));
};

describe('modelo de importação', () => {
  it('a primeira aba tem só o cabeçalho e todas as colunas são reconhecidas', () => {
    const table = toImportTable(readSpreadsheet({ kind: 'binary', bytes }).matrix);
    expect(table.rows).toEqual([]);
    const mapping = detectColumns(table.headers);
    expect(missingRequired(mapping)).toEqual([]);
    expect(Object.keys(mapping).sort()).toEqual(IMPORT_FIELDS.map((f) => f.field).sort());
  });

  it('o exemplo da aba Instruções, colado na aba Leituras, vira leituras válidas', () => {
    const rows = sheetValues(bytes)[1].rows;
    const start = rows.findIndex((r) => r[0] === 'date' && r[1] === 'time');
    const table = toImportTable(rows.slice(start));
    const result = parseImportTable(table, detectColumns(table.headers), new Date(2025, 0, 1));
    expect(result.issues).toEqual([]);
    expect(result.candidates.map((c) => [c.input.value, c.input.context])).toEqual([
      [104, 'fasting'],
      [162, 'post-meal-2h'],
      [118, 'bedtime'],
      [96, 'fasting'],
    ]);
    expect(result.candidates[1].input).toMatchObject({ insulinUnits: 2, isCorrection: true, cycleDay: 'A' });
  });

  it('o modelo CSV usa ";" e tem só o cabeçalho, com todas as colunas reconhecidas', () => {
    expect(detectCsvDelimiter(csv)).toBe(';');
    const table = toImportTable(readSpreadsheet({ kind: 'csv', text: csv }).matrix);
    expect(table.headers).toEqual(TEMPLATE_HEADERS);
    expect(table.rows).toEqual([]);
    expect(Object.keys(detectColumns(table.headers)).sort()).toEqual(IMPORT_FIELDS.map((f) => f.field).sort());
  });

  it('as cópias em docs/ são iguais aos modelos do app', () => {
    expect(sheetValues(fs.readFileSync(DOCS_COPY))).toEqual(sheetValues(bytes));
    // Compara o conteúdo, não os bytes: o Git pode trocar CRLF por LF no checkout.
    const docsCsv = readSpreadsheet({ kind: 'csv', text: fs.readFileSync(DOCS_CSV_COPY, 'utf8') }).matrix;
    expect(docsCsv).toEqual(readSpreadsheet({ kind: 'csv', text: csv }).matrix);
  });
});
