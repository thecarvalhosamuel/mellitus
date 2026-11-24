import { compareVersions, isNewerVersion, parseVersion, shouldPromptUpdate, toPlainNotes } from '.';

describe('parseVersion', () => {
  it('aceita prefixo v, partes faltando e sufixos', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion('1.4')).toEqual([1, 4, 0]);
    expect(parseVersion('2.0.1-beta.1')).toEqual([2, 0, 1]);
  });

  it('rejeita textos que não são versão', () => {
    expect(parseVersion('latest')).toBeNull();
    expect(parseVersion('')).toBeNull();
  });
});

describe('compareVersions / isNewerVersion', () => {
  it('compara numericamente, não como texto', () => {
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0);
    expect(compareVersions('v1.0.0', '1.0')).toBe(0);
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
  });

  it('só considera nova uma versão válida e maior', () => {
    expect(isNewerVersion('v1.1.0', '1.0.0')).toBe(true);
    expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);
    expect(isNewerVersion('0.9.0', '1.0.0')).toBe(false);
    expect(isNewerVersion('nightly', '1.0.0')).toBe(false);
  });
});

describe('shouldPromptUpdate', () => {
  it('mostra se nunca pulou', () => {
    expect(shouldPromptUpdate(undefined, '2026-11-24')).toBe(true);
  });

  it('não mostra no mesmo dia em que pulou', () => {
    expect(shouldPromptUpdate('2026-11-24', '2026-11-24')).toBe(false);
  });

  it('volta a mostrar em outro dia', () => {
    expect(shouldPromptUpdate('2026-11-23', '2026-11-24')).toBe(true);
  });
});

describe('toPlainNotes', () => {
  it('limpa Markdown comum', () => {
    const md = '## Novidades\r\n\r\n- **Gráfico** mais rápido\n* Veja [detalhes](https://x.y)\n\n\n\n`fix` no PDF';
    expect(toPlainNotes(md)).toBe('Novidades\n\n• Gráfico mais rápido\n• Veja detalhes\n\nfix no PDF');
  });

  it('corta textos longos', () => {
    expect(toPlainNotes('a'.repeat(20), 10)).toBe(`${'a'.repeat(10)}…`);
  });
});
