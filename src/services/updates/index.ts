import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { UPDATE_CHECK_TIMEOUT_MS, UPDATE_RELEASES_URL } from '@/shared/constants/updates';
import type { UpdateInfo } from '@/shared/types/update';
import { isNewerVersion, toPlainNotes } from '@/shared/utils/version';

type GithubRelease = {
  tag_name?: string;
  name?: string;
  body?: string | null;
  html_url?: string;
  published_at?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: { name?: string; browser_download_url?: string }[];
};

/** Versão instalada (do app.json embutido no build). */
export function currentAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/** Converte a release do GitHub em `UpdateInfo` se ela for mais nova que `current`. */
export function toUpdateInfo(release: GithubRelease, current: string): UpdateInfo | null {
  if (release.draft || release.prerelease) return null;
  const version = (release.tag_name ?? release.name ?? '').replace(/^v/i, '');
  if (!isNewerVersion(version, current)) return null;
  const apk = release.assets?.find((a) => a.name?.toLowerCase().endsWith('.apk'))?.browser_download_url;
  const downloadUrl = apk ?? release.html_url;
  if (!downloadUrl) return null;
  return {
    version,
    notes: toPlainNotes(release.body ?? ''),
    downloadUrl,
    publishedAt: release.published_at ?? null,
  };
}

/** Atualização fictícia para testar a tela em desenvolvimento. */
export function simulatedUpdate(): UpdateInfo {
  return {
    version: '9.9.0',
    notes: toPlainNotes(
      '## Novidades\n- Gráfico de glicemia mais rápido\n- Laudo em PDF com o período escolhido\n- Correções de pequenos erros',
    ),
    downloadUrl: 'https://github.com/thecarvalhosamuel/mellitus/releases',
    publishedAt: new Date().toISOString(),
  };
}

/**
 * Busca a última release publicada. Só no Android (o app é distribuído como APK).
 * Sem internet, sem release ou com qualquer falha, devolve `null`: a verificação nunca atrapalha o uso.
 * Em desenvolvimento, `EXPO_PUBLIC_FORCE_UPDATE=1` devolve uma atualização fictícia (qualquer plataforma).
 */
export async function fetchAvailableUpdate(): Promise<UpdateInfo | null> {
  if (__DEV__ && process.env.EXPO_PUBLIC_FORCE_UPDATE === '1') return simulatedUpdate();
  if (Platform.OS !== 'android' || __DEV__) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS);
  try {
    const response = await fetch(UPDATE_RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return toUpdateInfo((await response.json()) as GithubRelease, currentAppVersion());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
