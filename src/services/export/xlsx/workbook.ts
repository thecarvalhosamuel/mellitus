import { utils, write } from 'xlsx';

import type { SpreadsheetCell } from '@/shared/utils/spreadsheet';

/** Pasta de trabalho .xlsx com uma aba, em bytes. */
export function buildWorkbookBytes(
  rows: SpreadsheetCell[][],
  sheetName: string,
  columnWidths: number[] = [],
): Uint8Array {
  const sheet = utils.aoa_to_sheet(rows);
  sheet['!cols'] = columnWidths.map((wch) => ({ wch }));
  // Filtro no cabeçalho, para ordenar/filtrar no Excel/Sheets.
  sheet['!autofilter'] = rows.length > 0 ? { ref: sheet['!ref'] ?? 'A1' } : undefined;

  const book = utils.book_new();
  // Nome de aba: até 31 caracteres e sem : \ / ? * [ ].
  utils.book_append_sheet(book, sheet, sheetName.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31));
  const buffer: ArrayBuffer = write(book, { bookType: 'xlsx', type: 'array', compression: true });
  return new Uint8Array(buffer);
}
