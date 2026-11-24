import { toUpdateInfo } from '.';

const release = {
  tag_name: 'v1.2.0',
  body: '- Gráfico mais rápido',
  html_url: 'https://github.com/x/y/releases/tag/v1.2.0',
  published_at: '2026-11-20T12:00:00Z',
  assets: [
    { name: 'notes.txt', browser_download_url: 'https://x/notes.txt' },
    { name: 'mellitus-1.2.0.APK', browser_download_url: 'https://x/mellitus.apk' },
  ],
};

describe('toUpdateInfo', () => {
  it('usa o APK anexado quando a versão é mais nova', () => {
    expect(toUpdateInfo(release, '1.0.0')).toEqual({
      version: '1.2.0',
      notes: '• Gráfico mais rápido',
      downloadUrl: 'https://x/mellitus.apk',
      publishedAt: '2026-11-20T12:00:00Z',
    });
  });

  it('cai na página da release se não houver APK', () => {
    expect(toUpdateInfo({ ...release, assets: [] }, '1.0.0')?.downloadUrl).toBe(release.html_url);
  });

  it('ignora versão igual ou mais antiga, rascunho e pré-release', () => {
    expect(toUpdateInfo(release, '1.2.0')).toBeNull();
    expect(toUpdateInfo(release, '2.0.0')).toBeNull();
    expect(toUpdateInfo({ ...release, draft: true }, '1.0.0')).toBeNull();
    expect(toUpdateInfo({ ...release, prerelease: true }, '1.0.0')).toBeNull();
  });
});
