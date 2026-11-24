import { READING_COLUMNS, type SpreadsheetCell } from '@/shared/utils/spreadsheet';

import { assertSharingAvailable, cacheFile, shareAndCleanUp } from '../share';
import { buildWorkbookBytes } from './workbook';

export { SharingUnavailableError } from '../share';

/** Grava a planilha de leituras no cache, compartilha e apaga o arquivo. */
export async function shareReadingsSpreadsheet(rows: SpreadsheetCell[][], sheetName: string, fileName: string): Promise<void> {
  await assertSharingAvailable();

  const bytes = buildWorkbookBytes(
    rows,
    sheetName,
    READING_COLUMNS.map((c) => c.width),
  );
  const file = cacheFile(fileName);
  file.write(bytes);
  await shareAndCleanUp(file, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: 'Compartilhar planilha',
  });
}
