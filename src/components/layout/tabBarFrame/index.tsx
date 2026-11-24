import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/shared/theme/tokens';

type Measurable = { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void };
type TabBarFrame = { top: number | null; setTop: (top: number) => void };

const TabBarFrameContext = createContext<TabBarFrame>({ top: null, setTop: () => {} });

/** Guarda o topo real da tab bar (coordenadas da janela) para as telas das abas. */
export function TabBarFrameProvider({ children }: { children: ReactNode }) {
  const [top, setTopState] = useState<number | null>(null);
  const setTop = useCallback((y: number) => setTopState((prev) => (prev === y ? prev : y)), []);
  const value = useMemo(() => ({ top, setTop }), [top, setTop]);
  return <TabBarFrameContext.Provider value={value}>{children}</TabBarFrameContext.Provider>;
}

/** Usado pela tab bar: mede o próprio topo na janela e publica no contexto. */
export function useReportTabBarTop() {
  const { setTop } = useContext(TabBarFrameContext);
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      (e.currentTarget as unknown as Measurable).measureInWindow((_x, y) => setTop(y));
    },
    [setTop],
  );
  return onLayout;
}

/**
 * Quanto a tab bar cobre do fundo da área medida. Mede em vez de estimar,
 * porque o tamanho da área da tela muda conforme o aparelho (barra de navegação,
 * edge-to-edge). Antes da medição, usa a estimativa safe area + tab bar.
 */
export function useTabBarOverlap() {
  const insets = useSafeAreaInsets();
  const { top } = useContext(TabBarFrameContext);
  const [bottom, setBottom] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    (e.currentTarget as unknown as Measurable).measureInWindow((_x, y, _w, h) => setBottom(y + h));
  }, []);

  const overlap = top !== null && bottom !== null ? Math.max(0, bottom - top) : insets.bottom + layout.tabBarHeight;
  return { onLayout, overlap };
}
