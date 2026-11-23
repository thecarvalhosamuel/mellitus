import type { Config } from 'tailwindcss';

import { lightColors } from './src/shared/theme/colors';
import { toTailwindColors } from './src/shared/theme/cssVars';
import { fontFamilyNames, radius, sizes, spacing, textTokens } from './src/shared/theme/tokens';

const px = (value: number) => `${value}px`;
const mapPx = <T extends Record<string, number>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, px(v)]));

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // O tema é aplicado pelo ThemeProvider (variáveis CSS); `dark:` segue a preferência do app.
  darkMode: 'class',
  theme: {
    // Só cores semânticas: sem paleta padrão do Tailwind (nada de `bg-teal-600`).
    colors: {
      transparent: 'transparent',
      ...toTailwindColors(lightColors),
    },
    // Fontes customizadas no RN carregam o peso no nome da família, então
    // `font-bold` aponta para a família e os utilitários de fontWeight ficam desligados.
    fontFamily: Object.fromEntries(
      Object.entries(fontFamilyNames).map(([key, family]) => [key, [family]]),
    ),
    fontWeight: {},
    fontSize: Object.fromEntries(
      Object.entries(textTokens).map(([key, token]) => [
        key,
        [
          px(token.fontSize),
          {
            lineHeight: px(token.lineHeight),
            ...('letterSpacing' in token ? { letterSpacing: px(token.letterSpacing) } : {}),
          },
        ],
      ]),
    ),
    extend: {
      spacing: mapPx({ ...spacing, ...sizes }),
      borderRadius: {
        ...mapPx({ sm: radius.sm, md: radius.md, lg: radius.lg, xl: radius.xl }),
        DEFAULT: px(radius.base),
        input: px(radius.base),
        button: px(radius.base),
        cta: px(radius.md),
        card: px(radius.lg),
        sheet: px(radius.xl),
      },
    },
  },
  plugins: [],
} satisfies Config;
