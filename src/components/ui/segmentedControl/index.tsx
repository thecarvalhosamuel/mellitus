import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

export type SegmentOption<T extends string | number> = { value: T; label: string };

type SegmentedControlProps<T extends string | number> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Trilho com opções exclusivas (DESIGN.md §4.4): ativa com fundo de card, texto primary e check. */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-xs rounded-button border border-control-border bg-control p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            className={cn(
              'min-h-touch flex-1 flex-row items-center justify-center gap-xs rounded px-sm',
              selected && 'border border-primary-tint-border bg-card',
            )}>
            {selected && <Icon name="done" size={16} color={colors.primary} />}
            <Text
              numberOfLines={2}
              className={cn(
                'text-center text-label-md',
                selected ? 'font-bold text-primary' : 'font-semibold text-text-muted',
              )}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
