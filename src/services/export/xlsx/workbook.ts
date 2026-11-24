import { utils, write } from 'xlsx';

import type { SpreadsheetCell } from '@/shared/utils/spreadsheet';

export type WorkbookSheet = { name: string; rows: SpreadsheetCell[][]; widths?: number[]; filter?: boolean };

/** Nome de aba: até 31 caracteres e sem : \ / ? * [ ]. */
const sheetName = (name: string) => name.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31);

/** Pasta de trabalho .xlsx com uma ou mais abas, em bytes. */
export function buildSheetsWorkbookBytes(sheets: WorkbookSheet[]): Uint8Array {
  const book = utils.book_new();
  for (const { name, rows, widths = [], filter = false } of sheets) {
    const sheet = utils.aoa_to_sheet(rows);
    sheet['!cols'] = widths.map((wch) => ({ wch }));
    // Filtro no cabeçalho, para ordenar/filtrar no Excel/Sheets.
    if (filter && rows.length > 0) sheet['!autofilter'] = { ref: sheet['!ref'] ?? 'A1' };
    utils.book_append_sheet(book, sheet, sheetName(name));
  }
  const buffer: ArrayBuffer = write(book, { bookType: 'xlsx', type: 'array', compression: true });
  return new Uint8Array(buffer);
}

/** Pasta de trabalho .xlsx com uma aba, em bytes. */
export function buildWorkbookBytes(rows: SpreadsheetCell[][], name: string, columnWidths: number[] = []): Uint8Array {
  return buildSheetsWorkbookBytes([{ name, rows, widths: columnWidths, filter: true }]);
}
