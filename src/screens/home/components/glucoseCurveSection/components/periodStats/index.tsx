import { Text, View } from 'react-native';

import { SubBlock } from '@/components/ui/subBlock';
import type { GlucoseReading, StatusFamily } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { formatGlucose, formatShortDate, formatVariability } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';
import type { Extreme, PeriodStats } from '@/shared/utils/stats';

type PeriodStatsGridProps = { stats: PeriodStats; readings: GlucoseReading[] };

const valueColor: Record<StatusFamily, string> = {
  inRange: 'text-text-strong',
  offTarget: 'text-status-off-target-value',
  danger: 'text-status-danger-value',
};

/** Mínima e Máxima (com o dia, na cor do status) e Variabilidade (DESIGN.md §5.1). */
export function PeriodStatsGrid({ stats, readings }: PeriodStatsGridProps) {
  const familyOf = (extreme: Extreme | null) => {
    const reading = extreme && readings.find((r) => r.timestamp === extreme.timestamp && r.value === extreme.value);
    return reading ? getStatusFamily(reading.status) : 'inRange';
  };

  const cell = (label: string, value: string, caption: string, family: StatusFamily = 'inRange') => (
    <SubBlock className="flex-1 items-center">
      <Text className="font-semibold text-label-sm text-text-muted">{label}</Text>
      <Text className={cn('font-bold text-headline-sm tabular-nums', valueColor[family])}>{value}</Text>
      <Text className="font-regular text-body-sm text-text-muted">{caption}</Text>
    </SubBlock>
  );

  return (
    <View className="flex-row gap-sm">
      {cell('Mínima', stats.min ? formatGlucose(stats.min.value) : '—', stats.min ? formatShortDate(stats.min.timestamp) : '', familyOf(stats.min))}
      {cell('Máxima', stats.max ? formatGlucose(stats.max.value) : '—', stats.max ? formatShortDate(stats.max.timestamp) : '', familyOf(stats.max))}
      {cell('Variabilidade', stats.sd !== null ? formatVariability(stats.sd) : '—', 'mg/dL')}
    </View>
  );
}
