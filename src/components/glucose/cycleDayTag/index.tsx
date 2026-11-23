import { Text, View } from 'react-native';

import type { CycleDay } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';

type CycleDayTagProps = {
  day: CycleDay;
  slot?: { index: number; total: number };
};

/** "Dia A (1 de 3)" em tint primary; "Dia B" neutro (DESIGN.md §4.2 e §10.4). */
export function CycleDayTag({ day, slot }: CycleDayTagProps) {
  const label = slot ? `Dia ${day} (${slot.index} de ${slot.total})` : `Dia ${day}`;
  const isA = day === 'A';

  return (
    <View
      className={cn(
        'self-start rounded-sm border px-1.5 py-0.5',
        isA ? 'border-primary-tint-border bg-primary-tint' : 'border-status-context-border bg-status-context-bg',
      )}>
      <Text className={cn('font-bold text-label-sm', isA ? 'text-on-primary-tint' : 'text-status-context-fg')}>{label}</Text>
    </View>
  );
}
