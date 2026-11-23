import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/shared/theme/tokens';

type ScreenContainerProps = {
  children: ReactNode;
  /** Espaço extra no fim para um CTA fixo acima da tab bar. */
  bottomInset?: number;
};

/** Conteúdo rolável que respeita a safe area, o header e a tab bar translúcidos. */
export function ScreenContainer({ children, bottomInset = 0 }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-md px-margin"
      contentContainerStyle={{
        paddingTop: insets.top + layout.headerHeight + 16,
        paddingBottom: insets.bottom + layout.tabBarHeight + 24 + bottomInset,
      }}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
