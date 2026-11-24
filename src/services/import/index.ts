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
  // Sem cópia: no Expo Go a cópia do seletor fica fora da área do app e não pode ser lida.
  // A URI original (content://) é lida direto e nunca é apagada (é o arquivo do usuário).
  const result = await getDocumentAsync({ type: ACCEPTED_TYPES, copyToCacheDirectory: false, multiple: false });
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  if ((asset.size ?? 0) > MAX_FILE_BYTES) {
    throw new ImportFileError('A planilha é grande demais (máximo de 5 MB).');
  }
  const csv = isCsv(asset.name, asset.mimeType);
  if (!csv && !/\.(xlsx|xls)$/i.test(asset.name)) {
    throw new ImportFileError('Escolha um arquivo .xlsx, .xls ou .csv.');
  }
  try {
    // Sempre bytes: o CSV é decodificado pelo app (UTF-8 ou Windows-1252 do Excel).
    const bytes = await new File(asset.uri).bytes();
    const sheet = readSpreadsheet(csv ? { kind: 'csv-bytes', bytes } : { kind: 'binary', bytes });
    return { ...sheet, fileName: asset.name };
  } catch (error) {
    console.warn('[import] falha ao ler a planilha', error);
    // Em desenvolvimento, o detalhe técnico ajuda a achar a causa.
    const detail = __DEV__ && error instanceof Error ? ` (${error.message})` : '';
    throw new ImportFileError(`Não conseguimos ler esta planilha. Confira se o arquivo não está corrompido.${detail}`);
  }
}
