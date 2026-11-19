import { toCssVariables, toTailwindColors } from '../cssVars';
import { darkColors, gradientsByScheme, lightColors } from '.';

describe('cores do tema', () => {
  it('claro e escuro têm exatamente as mesmas chaves semânticas', () => {
    expect(Object.keys(toCssVariables(darkColors)).sort()).toEqual(
      Object.keys(toCssVariables(lightColors)).sort(),
    );
  });

  it('CTA do escuro usa texto escuro, nunca branco (contraste)', () => {
    expect(darkColors.onCta).toBe('#051424');
    expect(gradientsByScheme.dark.cta).toEqual(['#0D9488', '#14B8A6']);
  });
});

describe('cssVars', () => {
  it('gera variáveis em kebab-case a partir do caminho', () => {
    const vars = toCssVariables(lightColors);
    expect(vars['--color-card']).toBe('#FFFFFF');
    expect(vars['--color-text-muted']).toBe(lightColors.textMuted);
    expect(vars['--color-status-in-range-bg']).toBe(lightColors.status.inRange.bg);
  });

  it('mapeia classes do Tailwind para as mesmas variáveis', () => {
    const tw = toTailwindColors(lightColors) as Record<string, any>;
    expect(tw.card).toBe('var(--color-card)');
    expect(tw['text-muted']).toBe('var(--color-text-muted)');
    expect(tw.status['in-range'].bg).toBe('var(--color-status-in-range-bg)');
  });
});
