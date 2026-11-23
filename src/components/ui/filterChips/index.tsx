import { Pressable, ScrollView, Text } from 'react-native';

import { cn } from '@/shared/utils/cn';

export type FilterChipOption<T extends string> = { value: T; label: string };

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Pills roláveis na horizontal, sem scrollbar, encostando nas bordas (DESIGN.md §4.2). */
export function FilterChips<T extends string>({ options, value, onChange, accessibilityLabel }: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="-mx-margin"
      contentContainerClassName="gap-sm px-margin">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            className={cn(
              'min-h-touch items-center justify-center rounded-full border px-3.5',
              selected ? 'border-primary bg-primary' : 'border-control-border bg-control',
            )}>
            <Text className={cn('text-label-md', selected ? 'font-bold text-on-primary' : 'font-semibold text-text-secondary')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
