/** Versão publicada mais nova que a instalada. */
export type UpdateInfo = {
  version: string;
  /** Notas da release já em texto simples (pode ser vazio). */
  notes: string;
  /** Link do APK, ou da página da release quando não há APK anexado. */
  downloadUrl: string;
  publishedAt: string | null;
};
