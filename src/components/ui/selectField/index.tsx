import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type SelectFieldProps<T extends string> = {
  label: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
};

/** Campo de seleção que abre as opções num bottom sheet (DESIGN.md §4.3). */
export function SelectField<T extends string>({ label, value, options, onChange, placeholder = 'Selecione' }: SelectFieldProps<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View className="gap-xs">
      <Text className="font-semibold text-label-md text-text-secondary">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? placeholder}`}
        className="min-h-control flex-row items-center gap-sm rounded-input border-2 border-input-border bg-input px-3">
        <Text className={cn('flex-1 font-regular text-body-md', current ? 'text-text' : 'text-text-muted')}>
          {current?.label ?? placeholder}
        </Text>
        <Icon name="expand-more" size={22} color={colors.textMuted} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View className="gap-xs" accessibilityRole="radiogroup">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                className={cn('min-h-control flex-row items-center gap-sm rounded-cta px-3', selected ? 'bg-primary-tint' : 'active:bg-control')}>
                <Text className={cn('flex-1 text-label-lg', selected ? 'font-bold text-on-primary-tint' : 'font-semibold text-text-strong')}>
                  {option.label}
                </Text>
                {selected && <Icon name="check" size={20} color={colors.onPrimaryTint} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
