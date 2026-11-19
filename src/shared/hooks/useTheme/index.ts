import { useContext } from 'react';

import { ThemeContext, type Theme } from '@/shared/theme';

/**
 * Cores e gradientes do tema efetivo, para onde `className` não se aplica
 * (SVG, expo-linear-gradient, expo-blur, navegação, Reanimated).
 */
export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  return theme;
}
