// Fonte única das cores (DESIGN.md §2, §10.2, §10.3, §10.7).
// Daqui saem as variáveis CSS do NativeWind e os valores do useTheme().
// Mantenha este módulo puro (sem react-native): o tailwind.config o importa.

type ColorShape<T> = { [K in keyof T]: T[K] extends string ? string : ColorShape<T[K]> };

export type ColorScheme = 'light' | 'dark';

export const lightColors = {
  bg: '#FAF8FF',
  header: 'rgba(250,248,255,0.80)',
  headerBorder: 'transparent',
  tabBar: 'rgba(250,248,255,0.85)',
  tabBarBorder: 'transparent',

  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardHighlight: '#E2E7FF',
  inset: '#F2F3FF',
  insetBorder: 'transparent',
  recessed: 'rgba(255,255,255,0.70)',
  control: '#EAEDFF',
  controlBorder: 'transparent',
  controlPressed: '#E2E7FF',
  track: '#EAEDFF',
  ringTrack: '#DAE2FD',
  grid: '#EAEDFF',
  sheet: '#FFFFFF',
  overlay: 'rgba(40,48,68,0.40)',
  divider: '#F1F5F9',

  textStrong: '#131B2E',
  text: '#131B2E',
  textSecondary: '#3D4947',
  textMuted: '#6D7A77',

  primary: '#00685F',
  onPrimary: '#FFFFFF',
  primaryFixed: '#89F5E7',
  primaryTint: 'rgba(0,104,95,0.10)',
  primaryTintBorder: 'rgba(0,104,95,0.25)',
  onPrimaryTint: '#005049',
  cta: '#00685F',
  ctaPressed: '#008378',
  onCta: '#FFFFFF',

  inverseSurface: '#283044',
  onInverseSurface: '#EEF0FF',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',

  // Status glicêmico: mesmas 3 famílias nos dois temas (DESIGN.md §2.2).
  status: {
    inRange: {
      base: '#10B981',
      bg: '#ECFDF5',
      border: 'rgba(16,185,129,0.20)',
      fg: '#047857',
      value: '#131B2E',
      dot: '#10B981',
    },
    offTarget: {
      base: '#F59E0B',
      bg: '#FFFBEB',
      border: 'rgba(245,158,11,0.20)',
      fg: '#B45309',
      value: '#B45309',
      dot: '#F59E0B',
    },
    danger: {
      base: '#E11D48',
      bg: '#FFF1F2',
      border: 'rgba(225,29,72,0.20)',
      fg: '#BE123C',
      value: '#BE123C',
      dot: '#E11D48',
    },
    context: {
      bg: '#F1F5F9',
      border: '#E2E8F0',
      fg: '#475569',
    },
  },
};

export type ThemeColors = ColorShape<typeof lightColors>;

export const darkColors: ThemeColors = {
  bg: '#051424',
  header: 'rgba(5,20,36,0.85)',
  headerBorder: '#16273C',
  tabBar: 'rgba(11,19,32,0.90)',
  tabBarBorder: '#1E293B',

  card: '#0D1C2D',
  cardBorder: '#1E334A',
  cardHighlight: '#0D1C2D',
  inset: '#081726',
  insetBorder: '#1B2C3E',
  recessed: 'rgba(6,18,31,0.90)',
  control: '#122131',
  controlBorder: '#1F3146',
  controlPressed: '#1A2E44',
  track: '#081523',
  ringTrack: '#16273C',
  grid: '#1E2F42',
  sheet: '#0D1C2D',
  overlay: 'rgba(1,15,31,0.80)',
  divider: 'rgba(148,163,184,0.12)',

  textStrong: '#F8FAFC',
  text: '#D4E4FA',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',

  primary: '#4FDBC8',
  onPrimary: '#003731',
  primaryFixed: '#71F8E4',
  primaryTint: 'rgba(79,219,200,0.20)',
  primaryTintBorder: 'rgba(79,219,200,0.40)',
  onPrimaryTint: '#71F8E4',
  cta: '#0D9488',
  ctaPressed: '#0F766E',
  onCta: '#051424', // nunca branco: contraste do gradiente (DESIGN.md §10.4)

  inverseSurface: '#D4E4FA',
  onInverseSurface: '#233143',
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  status: {
    inRange: {
      base: '#10B981',
      bg: 'rgba(2,44,34,0.70)',
      border: '#065F46',
      fg: '#6EE7B7',
      value: '#FFFFFF',
      dot: '#34D399',
    },
    offTarget: {
      base: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.30)',
      fg: '#FBBF24',
      value: '#FBBF24',
      dot: '#F59E0B',
    },
    danger: {
      base: '#F43F5E',
      bg: 'rgba(244,63,94,0.12)',
      border: 'rgba(244,63,94,0.30)',
      fg: '#FB7185',
      value: '#FB7185',
      dot: '#F43F5E',
    },
    context: {
      bg: '#16273C',
      border: '#233852',
      fg: '#CBD5E1',
    },
  },
};

export const colorsByScheme: Record<ColorScheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

// Gradientes só existem via useTheme() (expo-linear-gradient não aceita className).
export type ThemeGradients = {
  cta: readonly [string, string];
  ctaPressed: readonly [string, string];
  cardHighlight: readonly [string, string];
};

export const gradientsByScheme: Record<ColorScheme, ThemeGradients> = {
  light: {
    cta: ['#00685F', '#00685F'], // claro: CTA sólido
    ctaPressed: ['#008378', '#008378'],
    cardHighlight: ['#E2E7FF', '#E2E7FF'],
  },
  dark: {
    cta: ['#0D9488', '#14B8A6'],
    ctaPressed: ['#0F766E', '#0D9488'],
    cardHighlight: ['#0D1C2D', '#122131'],
  },
};
