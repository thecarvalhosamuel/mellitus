import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SegmentedControl } from '@/components/ui/segmentedControl';
import { MEAL_CONTEXTS, READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { MealContext } from '@/shared/types/reading';
import type { FrequencySchedule } from '@/shared/types/schedule';
import { cn } from '@/shared/utils/cn';

type CustomFrequencyBuilderProps = {
  count: FrequencySchedule['customCount'];
  moments: MealContext[];
  onCountChange: (count: NonNullable<FrequencySchedule['customCount']>) => void;
  onMomentsChange: (moments: MealContext[]) => void;
};

const COUNTS = [
  { value: '2', label: '2x' },
  { value: '4', label: '4x' },
  { value: '6', label: '6x' },
  { value: 'free', label: 'Livre' },
];

const OPTIONS = MEAL_CONTEXTS.filter((c) => c !== 'other');

/** Meta de medições/dia + momentos em multisseleção (DESIGN.md §5.5). */
export function CustomFrequencyBuilder({ count, moments, onCountChange, onMomentsChange }: CustomFrequencyBuilderProps) {
  const { colors } = useTheme();
  const limit = count === 'free' || count === undefined ? Infinity : count;

  const toggle = (context: MealContext) => {
    if (moments.includes(context)) onMomentsChange(moments.filter((m) => m !== context));
    else if (moments.length < limit) onMomentsChange(MEAL_CONTEXTS.filter((c) => c === context || moments.includes(c)));
  };

  return (
    <View className="gap-sm">
      <Text className="font-semibold text-label-md text-text-secondary">Medições por dia</Text>
      <SegmentedControl
        accessibilityLabel="Medições por dia"
        options={COUNTS}
        value={String(count ?? 'free')}
        onChange={(v) => {
          const next = v === 'free' ? 'free' : (Number(v) as 2 | 4 | 6);
          onCountChange(next);
          if (next !== 'free' && moments.length > next) onMomentsChange(moments.slice(0, next));
        }}
      />
      <Text className="font-semibold text-label-md text-text-secondary">
        Momentos ({moments.length}
        {limit !== Infinity ? ` de ${limit}` : ''})
      </Text>
      <View className="flex-row flex-wrap gap-sm">
        {OPTIONS.map((context) => {
          const selected = moments.includes(context);
          const blocked = !selected && moments.length >= limit;
          return (
            <Pressable
              key={context}
              onPress={() => toggle(context)}
              disabled={blocked}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled: blocked }}
              className={cn(
                'min-h-touch grow basis-[45%] flex-row items-center gap-xs rounded-cta border px-3',
                selected ? 'border-primary-tint-border bg-primary-tint' : 'border-control-border bg-control',
                blocked && 'opacity-50',
              )}>
              <Icon name={selected ? 'check' : READING_CONTEXTS[context].icon} size={16} color={selected ? colors.onPrimaryTint : colors.textMuted} />
              <Text className={cn('text-label-md', selected ? 'font-bold text-on-primary-tint' : 'font-semibold text-text-secondary')}>
                {READING_CONTEXTS[context].label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="font-regular text-body-sm text-text-muted">Os lembretes usam horários padrão para cada momento.</Text>
    </View>
  );
}
