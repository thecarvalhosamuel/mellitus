// Versões no formato "MAJOR.MINOR.PATCH" (aceita prefixo "v" e sufixos como "-beta", ignorados).

/** "v1.2.3" → [1, 2, 3]. `null` se não for uma versão reconhecível. */
export function parseVersion(raw: string): [number, number, number] | null {
  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/i.exec(raw.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

/** < 0 se `a` é mais antiga, 0 se iguais, > 0 se `a` é mais nova. Versões inválidas contam como 0.0.0. */
export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a) ?? [0, 0, 0];
  const vb = parseVersion(b) ?? [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    if (va[i] !== vb[i]) return va[i] - vb[i];
  }
  return 0;
}

/** A versão publicada é mais nova que a instalada? Versão publicada inválida nunca conta como nova. */
export function isNewerVersion(latest: string, current: string): boolean {
  return parseVersion(latest) !== null && compareVersions(latest, current) > 0;
}

/** Mostrar o aviso de atualização hoje? Quem pulou só volta a ver em outro dia. */
export function shouldPromptUpdate(skippedOn: string | undefined, todayKey: string): boolean {
  return skippedOn !== todayKey;
}

/** Notas da release (Markdown do GitHub) como texto simples e curto para a tela. */
export function toPlainNotes(markdown: string, maxLength = 600): string {
  const text = markdown
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}[ \t]*/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '• ')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
