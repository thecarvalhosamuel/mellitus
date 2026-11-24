import { File } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';

import { assertSharingAvailable, cacheFile, shareAndCleanUp } from '../share';

export { SharingUnavailableError } from '../share';

/** A4 em pontos (72 dpi). */
const A4 = { width: 595, height: 842 };

/** Gera o PDF a partir do HTML, abre a folha de compartilhamento e limpa o arquivo. */
export async function sharePdfReport(html: string, fileName: string): Promise<void> {
  await assertSharingAvailable();

  const { uri } = await printToFileAsync({ html, ...A4 });
  const printed = new File(uri);
  const named = cacheFile(fileName);
  try {
    printed.move(named);
  } catch (error) {
    if (printed.exists) printed.delete();
    throw error;
  }
  await shareAndCleanUp(named, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Compartilhar laudo' }, [
    printed,
  ]);
}
