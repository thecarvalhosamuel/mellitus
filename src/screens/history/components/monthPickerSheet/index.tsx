import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatReadingCount } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

type MonthOption = { key: string; label: string; total: number; isCurrent: boolean };

type MonthPickerSheetProps = {
  visible: boolean;
  options: MonthOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

/** "Outubro 2024 (Mês Atual) ✓ · Setembro 2024 · 88 registros" (DESIGN.md §5.2). */
export function MonthPickerSheet({ visible, options, selectedKey, onSelect, onClose }: MonthPickerSheetProps) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Escolher mês">
      <ScrollView style={{ maxHeight: height * 0.5 }} contentContainerClassName="gap-xs">
        {options.map((option) => {
          const selected = option.key === selectedKey;
          return (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={cn(
                'min-h-control flex-row items-center justify-between gap-sm rounded-cta px-3',
                selected ? 'bg-primary-tint' : 'active:bg-control',
              )}>
              <View className="flex-1">
                <Text className={cn('text-label-lg', selected ? 'font-bold text-on-primary-tint' : 'font-semibold text-text-strong')}>
                  {option.label}
                  {option.isCurrent ? ' (Mês Atual)' : ''}
                </Text>
                <Text className="font-regular text-body-sm text-text-muted">{formatReadingCount(option.total)}</Text>
              </View>
              {selected && <Icon name="check" size={20} color={colors.onPrimaryTint} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}
