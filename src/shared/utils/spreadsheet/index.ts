import { GLUCOSE_STATUS } from '@/shared/constants/glucose';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatTime } from '@/shared/utils/format';

export type SpreadsheetCell = string | number | null;

/** Colunas da planilha de leituras (cabeçalho em pt-BR, ordem fixa). */
export const READING_COLUMNS = [
  { header: 'Data', width: 12 },
  { header: 'Hora', width: 7 },
  { header: 'Momento', width: 18 },
  { header: 'Glicemia (mg/dL)', width: 16 },
  { header: 'Meta mín (mg/dL)', width: 16 },
  { header: 'Meta máx (mg/dL)', width: 16 },
  { header: 'Status', width: 15 },
  { header: 'Insulina (UI)', width: 13 },
  { header: 'Correção', width: 10 },
  { header: 'Dia do ciclo', width: 12 },
  { header: 'Nota', width: 40 },
  { header: 'Origem', width: 11 },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** "24/10/2024" no horário local do aparelho. */
export function formatSheetDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Leituras em linhas (cabeçalho incluso), em ordem cronológica. Números ficam
 * como número (o Excel/Sheets calcula em cima); vazio é célula vazia.
 */
export function buildReadingRows(readings: GlucoseReading[]): SpreadsheetCell[][] {
  const sorted = [...readings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  const rows = sorted.map((r): SpreadsheetCell[] => [
    formatSheetDate(r.timestamp),
    formatTime(r.timestamp),
    READING_CONTEXTS[r.context].label,
    r.value,
    r.target?.min ?? null,
    r.target?.max ?? null,
    GLUCOSE_STATUS[r.status].label,
    r.insulinUnits ?? null,
    r.insulinUnits !== undefined ? (r.isCorrection ? 'Sim' : 'Não') : null,
    r.cycleDay ?? null,
    r.note?.trim() || null,
    r.source === 'import' ? 'Importada' : 'Manual',
  ]);
  return [READING_COLUMNS.map((c) => c.header), ...rows];
}
