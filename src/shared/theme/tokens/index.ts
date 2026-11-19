// Tokens de layout e tipografia (DESIGN.md §2.3–2.5). Módulo puro: usado pelo
// tailwind.config e por quem precisar do valor numérico via useTheme().

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, margin: 16 } as const;

export const radius = {
  sm: 4,
  base: 8, // inputs, botões, sub-blocos
  md: 12, // CTA, dropdown
  lg: 16, // cards
  xl: 24, // topo do bottom sheet
  full: 9999,
} as const;

type TextToken = { fontSize: number; lineHeight: number; letterSpacing?: number };

// letterSpacing em px (em × fontSize), como o React Native espera.
export const textTokens = {
  'display-numeric': { fontSize: 44, lineHeight: 48, letterSpacing: -0.88 },
  'display-numeric-lg': { fontSize: 56, lineHeight: 60, letterSpacing: -1.68 },
  'headline-lg': { fontSize: 26, lineHeight: 32, letterSpacing: -0.26 },
  'headline-md': { fontSize: 22, lineHeight: 28 },
  'headline-sm': { fontSize: 18, lineHeight: 24 },
  'body-lg': { fontSize: 16, lineHeight: 24 },
  'body-md': { fontSize: 14, lineHeight: 20 },
  'body-sm': { fontSize: 12, lineHeight: 16 },
  'label-lg': { fontSize: 14, lineHeight: 18, letterSpacing: 0.14 },
  'label-md': { fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  'label-sm': { fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },
} as const satisfies Record<string, TextToken>;

export const fontFamilyNames = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;
