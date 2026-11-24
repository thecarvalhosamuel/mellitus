import {
  buildImportTemplateCsv,
  buildImportTemplateSheets,
  TEMPLATE_FILE_NAMES,
  type TemplateFormat,
} from '@/shared/utils/importTemplate';
import { READING_COLUMNS, type SpreadsheetCell } from '@/shared/utils/spreadsheet';

import { assertSharingAvailable, cacheFile, shareAndCleanUp } from '../share';
import { buildSheetsWorkbookBytes, buildWorkbookBytes } from './workbook';

export { SharingUnavailableError } from '../share';

const XLSX_SHARE = {
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  UTI: 'org.openxmlformats.spreadsheetml.sheet',
};

const CSV_SHARE = { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' };

async function shareBytes(bytes: Uint8Array, fileName: string, dialogTitle: string): Promise<void> {
  const file = cacheFile(fileName);
  file.write(bytes);
  await shareAndCleanUp(file, { ...XLSX_SHARE, dialogTitle });
}

async function shareText(text: string, fileName: string, dialogTitle: string): Promise<void> {
  const file = cacheFile(fileName);
  file.write(text);
  await shareAndCleanUp(file, { ...CSV_SHARE, dialogTitle });
}

/** Grava a planilha de leituras no cache, compartilha e apaga o arquivo. */
export async function shareReadingsSpreadsheet(rows: SpreadsheetCell[][], sheetName: string, fileName: string): Promise<void> {
  await assertSharingAvailable();
  const bytes = buildWorkbookBytes(
    rows,
    sheetName,
    READING_COLUMNS.map((c) => c.width),
  );
  await shareBytes(bytes, fileName, 'Compartilhar planilha');
}

/** Modelo de planilha para importação: o usuário salva ou envia para preencher no computador. */
export async function shareImportTemplate(format: TemplateFormat): Promise<void> {
  await assertSharingAvailable();
  const title = 'Salvar modelo de planilha';
  if (format === 'csv') {
    await shareText(buildImportTemplateCsv(), TEMPLATE_FILE_NAMES.csv, title);
  } else {
    await shareBytes(buildSheetsWorkbookBytes(buildImportTemplateSheets()), TEMPLATE_FILE_NAMES.xlsx, title);
  }
}
