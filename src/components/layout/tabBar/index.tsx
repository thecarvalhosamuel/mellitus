import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReportTabBarTop } from '@/components/layout/tabBarFrame';
import { useTheme } from '@/shared/hooks/useTheme';
import { layout } from '@/shared/theme/tokens';
import { cn } from '@/shared/utils/cn';

/**
 * Tab bar fixa e sólida (DESIGN.md §3.1); se estende sob a barra de navegação do sistema
 * na mesma cor do app. Ícone e rótulo vêm das options
 * de cada aba (`tabBarIcon`, `title`); ativa em primary + bold.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const onTabBarLayout = useReportTabBarTop();

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-tab-bar-border bg-tab-bar"
      style={{ paddingBottom: insets.bottom }}>
      <View
        onLayout={onTabBarLayout}
        accessibilityRole="tablist"
        className="flex-row"
        style={{ height: layout.tabBarHeight }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if ((options as { href?: unknown }).href === null) return null;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const color = focused ? colors.primary : colors.textSecondary;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              className="flex-1 items-center justify-center gap-xs">
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text
                className={cn(
                  'text-label-sm',
                  focused ? 'font-bold text-primary' : 'font-semibold text-text-secondary',
                )}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
