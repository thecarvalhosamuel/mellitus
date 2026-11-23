import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { elevation } from '@/shared/theme/tokens';
import { cn } from '@/shared/utils/cn';

type SelectableCardProps = {
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
};

/** Card inteiro clicável com indicador de rádio (DESIGN.md §4.4 e §10.6). */
export function SelectableCard({ selected, onPress, accessibilityLabel, children }: SelectableCardProps) {
  const { scheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'flex-row gap-sm rounded-card border bg-card p-md',
        selected ? 'border-2 border-primary' : 'border-card-border opacity-90',
      )}
      style={scheme === 'light' && selected ? elevation.card : undefined}>
      <View
        className={cn(
          'mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-switch-off bg-transparent',
        )}>
        {selected && <View className="h-2 w-2 rounded-full bg-on-primary" />}
      </View>
      <View className="flex-1 gap-sm">{children}</View>
    </Pressable>
  );
}
