import { read, utils } from 'xlsx';

import { type Cell, detectCsvDelimiter } from '@/shared/utils/importSheet';

export type SpreadsheetData = { kind: 'csv'; text: string } | { kind: 'binary'; bytes: Uint8Array };

export type SheetMatrix = { matrix: Cell[][]; firstRowNumber: number };

/**
 * Primeira aba com dados como matriz de células cruas. No CSV, nada é
 * convertido automaticamente (o SheetJS leria "05/01" no padrão americano).
 */
export function readSpreadsheet(data: SpreadsheetData): SheetMatrix {
  const book =
    data.kind === 'csv'
      ? read(data.text.replace(/^﻿/, ''), { type: 'string', raw: true, FS: detectCsvDelimiter(data.text) })
      : read(data.bytes, { type: 'array' });

  for (const name of book.SheetNames) {
    const sheet = book.Sheets[name];
    if (!sheet?.['!ref']) continue;
    const matrix = utils.sheet_to_json<Cell[]>(sheet, { header: 1, raw: true, defval: null, blankrows: true });
    if (matrix.length === 0) continue;
    return { matrix, firstRowNumber: utils.decode_range(sheet['!ref']).s.r + 1 };
  }
  return { matrix: [], firstRowNumber: 1 };
}
