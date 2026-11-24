import type { ReadingInput } from '@/shared/utils/reading';

import {
  type Cell,
  cellText,
  parseContextCell,
  parseCycleDayCell,
  parseDateCell,
  parseNumberCell,
  parseTimeCell,
  parseYesCell,
} from './cells';
import type { ColumnMapping } from './columns';

export * from './cells';
export * from './columns';

/** Faixa aceita pelo banco para leituras importadas (glicosímetros). */
export const IMPORT_VALUE_RANGE = { min: 20, max: 600 } as const;

export type ImportTable = {
  headers: string[];
  /** Linhas de dados com o número da linha na planilha (para apontar problemas). */
  rows: { number: number; cells: Cell[] }[];
};

export type ImportCandidate = { row: number; key: string; input: ReadingInput };
export type ImportIssue = { row: number; reason: string };
export type ImportParseResult = { candidates: ImportCandidate[]; issues: ImportIssue[]; duplicatesInFile: number };

const isEmptyRow = (cells: Cell[]) => cells.every((c) => cellText(c) === '');

/**
 * Separa cabeçalho e dados: o cabeçalho é a primeira linha não vazia.
 * `firstRowNumber` é o número (1-based) da primeira linha do intervalo lido.
 */
export function toImportTable(matrix: Cell[][], firstRowNumber = 1): ImportTable {
  const headerIndex = matrix.findIndex((cells) => !isEmptyRow(cells));
  if (headerIndex < 0) return { headers: [], rows: [] };
  const headers = matrix[headerIndex].map(cellText);
  const rows = matrix
    .map((cells, i) => ({ number: firstRowNumber + i, cells }))
    .slice(headerIndex + 1)
    .filter((row) => !isEmptyRow(row.cells));
  return { headers, rows };
}

/** Chave de duplicata: minuto em UTC + valor (a planilha exportada não tem segundos). */
export function readingKey(timestamp: string, value: number): string {
  return `${new Date(timestamp).toISOString().slice(0, 16)}|${value}`;
}

/** Tolerância para relógios levemente adiantados. */
const FUTURE_TOLERANCE_MS = 5 * 60_000;

function parseRow(cells: Cell[], mapping: ColumnMapping, now: Date): ReadingInput | string {
  const at = (field: keyof ColumnMapping) => (mapping[field] === undefined ? undefined : cells[mapping[field]]);

  const date = parseDateCell(at('date'));
  if (!date) return 'Data inválida ou vazia';
  let time = date.h !== undefined ? { h: date.h, min: date.min ?? 0 } : { h: 0, min: 0 };
  if (mapping.time !== undefined) {
    const parsed = parseTimeCell(at('time'));
    if (!parsed) return 'Hora inválida ou vazia';
    time = parsed;
  }
  const timestamp = new Date(date.y, date.m - 1, date.d, time.h, time.min);
  if (timestamp.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) return 'Data no futuro';

  const rawValue = parseNumberCell(at('value'));
  if (rawValue === null) return 'Glicemia vazia ou não numérica';
  const value = Math.round(rawValue);
  if (value < IMPORT_VALUE_RANGE.min || value > IMPORT_VALUE_RANGE.max) {
    return `Glicemia fora de ${IMPORT_VALUE_RANGE.min}–${IMPORT_VALUE_RANGE.max} mg/dL`;
  }

  const insulin = parseNumberCell(at('insulin'));
  const insulinUnits = insulin !== null && insulin >= 0 && insulin <= 100 ? insulin : undefined;
  const note = cellText(at('note'));
  const cycleDay = parseCycleDayCell(at('cycleDay'));
  return {
    value,
    timestamp: timestamp.toISOString(),
    context: parseContextCell(at('context')),
    ...(note && { note }),
    ...(insulinUnits !== undefined && { insulinUnits }),
    ...(insulinUnits !== undefined && parseYesCell(at('correction')) && { isCorrection: true }),
    ...(cycleDay && { cycleDay }),
    source: 'import',
  };
}

/** Valida cada linha com o mapeamento escolhido e descarta repetições dentro do arquivo. */
export function parseImportTable(table: ImportTable, mapping: ColumnMapping, now: Date = new Date()): ImportParseResult {
  const candidates: ImportCandidate[] = [];
  const issues: ImportIssue[] = [];
  const seen = new Set<string>();
  let duplicatesInFile = 0;

  for (const row of table.rows) {
    const result = parseRow(row.cells, mapping, now);
    if (typeof result === 'string') {
      issues.push({ row: row.number, reason: result });
      continue;
    }
    const key = readingKey(result.timestamp, result.value);
    if (seen.has(key)) {
      duplicatesInFile += 1;
      continue;
    }
    seen.add(key);
    candidates.push({ row: row.number, key, input: result });
  }
  return { candidates, issues, duplicatesInFile };
}

/** Delimitador de CSV pela primeira linha (planilhas em pt-BR costumam usar ";"). */
export function detectCsvDelimiter(text: string): ',' | ';' | '\t' {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const counts = ([',', ';', '\t'] as const).map((d) => ({ d, n: firstLine.split(d).length - 1 }));
  return counts.reduce((best, c) => (c.n > best.n ? c : best), { d: ',' as const, n: 0 } as (typeof counts)[number]).d;
}
