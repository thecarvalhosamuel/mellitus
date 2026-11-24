import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

// Laudo gerado no aparelho e compartilhado manualmente (WhatsApp, e-mail…).
// O arquivo temporário é apagado depois do compartilhamento (DESIGN.md §13.8).

/** A4 em pontos (72 dpi). */
const A4 = { width: 595, height: 842 };

export class SharingUnavailableError extends Error {
  constructor() {
    super('Compartilhamento indisponível neste aparelho.');
  }
}

/** Gera o PDF a partir do HTML, abre a folha de compartilhamento e limpa o arquivo. */
export async function sharePdfReport(html: string, fileName: string): Promise<void> {
  if (!(await isAvailableAsync())) throw new SharingUnavailableError();

  const { uri } = await printToFileAsync({ html, ...A4 });
  const printed = new File(uri);
  // Nome legível para quem recebe (ex.: mellitus-laudo-2024-10.pdf).
  const named = new File(Paths.cache, fileName);
  try {
    if (named.exists) named.delete();
    await printed.move(named);
    await shareAsync(named.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Compartilhar laudo',
    });
  } finally {
    for (const file of [printed, named]) {
      try {
        if (file.exists) file.delete();
      } catch {
        // Limpeza é melhor esforço: o sistema também limpa o cache.
      }
    }
  }
}
