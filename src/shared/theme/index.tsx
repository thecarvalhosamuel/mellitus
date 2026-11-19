import { useColorScheme, vars } from 'nativewind';
import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  colorsByScheme,
  gradientsByScheme,
  type ColorScheme,
  type ThemeColors,
  type ThemeGradients,
} from './colors';
import { toCssVariables } from './cssVars';

export type Appearance = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  gradients: ThemeGradients;
};

export const ThemeContext = createContext<Theme | null>(null);

// Calculado uma vez: cada tema vira um conjunto de variáveis CSS do NativeWind.
const cssVarsByScheme = {
  light: vars(toCssVariables(colorsByScheme.light)),
  dark: vars(toCssVariables(colorsByScheme.dark)),
};

type ThemeProviderProps = {
  /** Preferência do usuário (`settings.appearance`). Persistência chega com o banco (etapa 4). */
  appearance?: Appearance;
  children: ReactNode;
};

export function ThemeProvider({ appearance = 'system', children }: ThemeProviderProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(appearance);
  }, [appearance, setColorScheme]);

  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';

  const theme = useMemo<Theme>(
    () => ({ scheme, colors: colorsByScheme[scheme], gradients: gradientsByScheme[scheme] }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <View style={[{ flex: 1 }, cssVarsByScheme[scheme]]}>{children}</View>
    </ThemeContext.Provider>
  );
}
