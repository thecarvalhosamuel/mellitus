import { read, utils } from 'xlsx';

import { decodeText, parseCsv } from '@/shared/utils/csv';
import { type Cell, detectCsvDelimiter } from '@/shared/utils/importSheet';

/** CSV chega como texto (já decodificado) ou como bytes (decodificados aqui: UTF-8 ou Windows-1252). */
export type SpreadsheetData =
  | { kind: 'csv'; text: string }
  | { kind: 'csv-bytes'; bytes: Uint8Array }
  | { kind: 'binary'; bytes: Uint8Array };

export type SheetMatrix = { matrix: Cell[][]; firstRowNumber: number };

/**
 * Primeira aba com dados como matriz de células cruas. CSV usa o parser
 * próprio (nada é convertido: "05/01" continua texto, sem leitura americana);
 * .xlsx/.xls usam o SheetJS.
 */
export function readSpreadsheet(data: SpreadsheetData): SheetMatrix {
  if (data.kind !== 'binary') {
    const text = data.kind === 'csv' ? data.text.replace(/^﻿/, '') : decodeText(data.bytes);
    return { matrix: parseCsv(text, detectCsvDelimiter(text)), firstRowNumber: 1 };
  }

  const book = read(data.bytes, { type: 'array' });
  for (const name of book.SheetNames) {
    const sheet = book.Sheets[name];
    if (!sheet?.['!ref']) continue;
    const matrix = utils.sheet_to_json<Cell[]>(sheet, { header: 1, raw: true, defval: null, blankrows: true });
    if (matrix.length === 0) continue;
    return { matrix, firstRowNumber: utils.decode_range(sheet['!ref']).s.r + 1 };
  }
  return { matrix: [], firstRowNumber: 1 };
}
