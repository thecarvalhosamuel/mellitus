import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';

import { type SheetMatrix, readSpreadsheet } from './workbook';

/** Planilhas maiores que isso travariam a leitura no aparelho. */
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/comma-separated-values',
  'text/plain',
  'application/csv',
];

export class ImportFileError extends Error {}

export type PickedSpreadsheet = SheetMatrix & { fileName: string };

const isCsv = (name: string, mimeType?: string) =>
  /\.(csv|txt)$/i.test(name) || (mimeType !== undefined && /csv|text\/plain/.test(mimeType));

/** Abre o seletor de arquivos e lê a planilha (.xlsx, .xls ou .csv). `null` se o usuário cancelar. */
export async function pickSpreadsheet(): Promise<PickedSpreadsheet | null> {
  const result = await getDocumentAsync({ type: ACCEPTED_TYPES, copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size ?? 0) > MAX_FILE_BYTES) {
      throw new ImportFileError('A planilha é grande demais (máximo de 5 MB).');
    }
    const csv = isCsv(asset.name, asset.mimeType);
    if (!csv && !/\.(xlsx|xls)$/i.test(asset.name)) {
      throw new ImportFileError('Escolha um arquivo .xlsx, .xls ou .csv.');
    }
    try {
      const sheet = readSpreadsheet(csv ? { kind: 'csv', text: await file.text() } : { kind: 'binary', bytes: await file.bytes() });
      return { ...sheet, fileName: asset.name };
    } catch {
      throw new ImportFileError('Não conseguimos ler esta planilha. Confira se o arquivo não está corrompido.');
    }
  } finally {
    // A cópia no cache não é mais necessária depois de lida.
    try {
      if (file.exists) file.delete();
    } catch {
      // Melhor esforço.
    }
  }
}
