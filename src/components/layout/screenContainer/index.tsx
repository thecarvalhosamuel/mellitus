import type { ReactNode } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarOverlap } from '@/components/layout/tabBarFrame';
import { layout } from '@/shared/theme/tokens';

type ScreenContainerProps = {
  children: ReactNode;
  /** Espaço extra no fim para um elemento flutuante acima da tab bar. */
  bottomInset?: number;
  /** `plain`: tela sem header e sem tab bar (ex.: onboarding). */
  variant?: 'tabs' | 'plain';
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Elemento fixo logo acima da tab bar (ex.: CTA da Início). */
  floating?: ReactNode;
};

const FLOATING_GAP = 12;

/** Conteúdo rolável que respeita a safe area, o header e a tab bar fixos. */
export function ScreenContainer({
  children,
  bottomInset = 0,
  variant = 'tabs',
  onScroll,
  floating,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const chrome = variant === 'tabs';
  const tabBar = useTabBarOverlap();
  const bottomChrome = chrome ? tabBar.overlap : insets.bottom;

  return (
    <View onLayout={tabBar.onLayout} className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-md px-margin"
        contentContainerStyle={{
          paddingTop: insets.top + (chrome ? layout.headerHeight : 0) + 16,
          paddingBottom: bottomChrome + 24 + bottomInset,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {floating && (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 px-margin"
          style={{ bottom: bottomChrome + FLOATING_GAP }}>
          {floating}
        </View>
      )}
      {/* Sem header: faixa sólida sob a status bar para o conteúdo rolado não aparecer atrás dela. */}
      {!chrome && <View pointerEvents="none" className="absolute inset-x-0 top-0 bg-bg" style={{ height: insets.top }} />}
    </View>
  );
}
