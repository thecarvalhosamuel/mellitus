import { Directory, File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

// Arquivos gerados no aparelho e compartilhados manualmente (WhatsApp, e-mail…).
// O arquivo temporário é apagado depois do compartilhamento (DESIGN.md §13.8).

export class SharingUnavailableError extends Error {
  constructor() {
    super('Compartilhamento indisponível neste aparelho.');
  }
}

export type ShareOptions = { mimeType: string; UTI: string; dialogTitle: string };

export async function assertSharingAvailable(): Promise<void> {
  if (!(await isAvailableAsync())) throw new SharingUnavailableError();
}

/** Arquivo no cache com nome legível para quem recebe (ex.: mellitus-leituras-2024-10.xlsx). */
export function cacheFile(fileName: string): File {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  return file;
}

/** Apaga sobras de exportações no cache (arquivos "mellitus-…"), se alguma ficou. */
export function clearExportCache(): void {
  for (const entry of new Directory(Paths.cache).list()) {
    if (entry instanceof File && entry.name.startsWith('mellitus-')) {
      try {
        entry.delete();
      } catch {
        // Melhor esforço.
      }
    }
  }
}

/** Abre a folha de compartilhamento e apaga os arquivos temporários no fim. */
export async function shareAndCleanUp(file: File, options: ShareOptions, extraTemp: File[] = []): Promise<void> {
  try {
    await shareAsync(file.uri, options);
  } finally {
    for (const temp of [file, ...extraTemp]) {
      try {
        if (temp.exists) temp.delete();
      } catch {
        // Limpeza é melhor esforço: o sistema também limpa o cache.
      }
    }
  }
}
