import { Text, View } from 'react-native';

import type { GlucoseReading } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { toDateKey } from '@/shared/utils/date';
import { formatDayHeader, formatReadingCount } from '@/shared/utils/format';

import { ReadingRow } from './components/readingRow';

type ReadingDayGroupProps = {
  dateKey: string;
  readings: GlucoseReading[];
  onPressReading: (id: string) => void;
};

/** Cabeçalho do dia (dot primary para hoje) + linhas de registro (DESIGN.md §5.2). */
export function ReadingDayGroup({ dateKey, readings, onPressReading }: ReadingDayGroupProps) {
  const isToday = dateKey === toDateKey(new Date());
  const [y, m, d] = dateKey.split('-').map(Number);

  return (
    <View className="gap-sm">
      <View className="flex-row items-center gap-sm" accessibilityRole="header">
        <View className={cn('h-2 w-2 rounded-full', isToday ? 'bg-primary' : 'bg-status-context-border')} />
        <Text className="flex-1 font-bold text-label-lg text-text-strong">{formatDayHeader(new Date(y, m - 1, d))}</Text>
        <Text className="font-medium text-body-sm text-text-muted">{formatReadingCount(readings.length)}</Text>
      </View>
      {readings.map((reading) => (
        <ReadingRow key={reading.id} reading={reading} onPress={() => onPressReading(reading.id)} />
      ))}
    </View>
  );
}
