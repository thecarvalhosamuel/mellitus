import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { MEAL_CONTEXTS, READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { MealContext } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';

type ReadingContextPickerProps = {
  value: MealContext;
  onChange: (context: MealContext) => void;
  options?: MealContext[];
};

/** Grid 2 colunas de momentos da leitura, seleção única com check (DESIGN.md §5.1 e §10.4). */
export function ReadingContextPicker({ value, onChange, options = MEAL_CONTEXTS }: ReadingContextPickerProps) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Momento da leitura" className="flex-row flex-wrap gap-sm">
      {options.map((context) => {
        const selected = context === value;
        const { label, icon } = READING_CONTEXTS[context];
        return (
          <Pressable
            key={context}
            onPress={() => onChange(context)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            className={cn(
              'min-h-control grow basis-[45%] flex-row items-center gap-sm rounded-cta border px-3',
              selected ? 'border-primary-tint-border bg-primary-tint' : 'border-control-border bg-control',
            )}>
            <Icon name={selected ? 'check' : icon} size={18} color={selected ? colors.onPrimaryTint : colors.textMuted} />
            <Text
              numberOfLines={1}
              className={cn('flex-1 text-label-md', selected ? 'font-bold text-on-primary-tint' : 'font-semibold text-text-secondary')}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
