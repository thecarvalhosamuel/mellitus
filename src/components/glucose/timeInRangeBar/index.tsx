import { Text, View } from 'react-native';

import type { StatusFamily } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { formatPercent } from '@/shared/utils/format';
import type { TimeInRange } from '@/shared/utils/stats';

type TimeInRangeBarProps = { tir: TimeInRange };

const SEGMENTS: { key: keyof TimeInRange; label: string; family: StatusFamily }[] = [
  { key: 'below', label: 'Abaixo', family: 'offTarget' },
  { key: 'inRange', label: 'No alvo', family: 'inRange' },
  { key: 'above', label: 'Acima', family: 'offTarget' },
];

const bar: Record<StatusFamily, string> = {
  inRange: 'bg-status-in-range-base',
  offTarget: 'bg-status-off-target-base',
  danger: 'bg-status-danger-base',
};

const text: Record<StatusFamily, string> = {
  inRange: 'text-status-in-range-fg',
  offTarget: 'text-status-off-target-fg',
  danger: 'text-status-danger-fg',
};

/** Distribuição abaixo / no alvo / acima do período, com as porcentagens embaixo. */
export function TimeInRangeBar({ tir }: TimeInRangeBarProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Tempo no alvo: ${SEGMENTS.map((s) => `${s.label} ${formatPercent(tir[s.key])}`).join(', ')}`}
      className="gap-sm">
      <View className="h-2.5 flex-row overflow-hidden rounded-full bg-track">
        {SEGMENTS.map((segment) => (
          <View
            key={segment.key}
            className={cn('h-full', bar[segment.family], segment.key !== 'inRange' && 'opacity-80')}
            style={{ flex: tir[segment.key] }}
          />
        ))}
      </View>
      <View className="flex-row justify-between">
        {SEGMENTS.map((segment) => (
          <View key={segment.key} className="items-center">
            <Text className={cn('font-bold text-label-md tabular-nums', text[segment.family])}>
              {formatPercent(tir[segment.key])}
            </Text>
            <Text className="font-medium text-label-sm text-text-muted">{segment.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
