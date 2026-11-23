import { Pressable, Text, View } from 'react-native';

import { ContextChip } from '@/components/glucose/contextChip';
import { GlucoseValue } from '@/components/glucose/glucoseValue';
import { StatusBadge } from '@/components/glucose/statusBadge';
import { Icon } from '@/components/ui/icon';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { formatInsulin, formatTargetRange, formatTime } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';

type ReadingRowProps = { reading: GlucoseReading; onPress: () => void };

const targetColor = {
  inRange: 'text-text-secondary',
  offTarget: 'text-status-off-target-fg',
  danger: 'text-status-danger-fg',
};

/** Hora + contexto + status; valor + meta; nota + insulina (DESIGN.md §4.6 "Record Row"). Toque para editar. */
export function ReadingRow({ reading, onPress }: ReadingRowProps) {
  const { colors } = useTheme();
  const target = formatTargetRange(reading.target);
  const family = getStatusFamily(reading.status);
  const hasInsulin = reading.insulinUnits !== undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Toque para editar ou excluir"
      className="gap-sm rounded-card border border-card-border bg-card p-md active:bg-control">
      <View className="flex-row items-center justify-between gap-sm">
        <View className="flex-1 flex-row items-center gap-sm">
          <Text className="font-semibold text-label-lg text-text-strong tabular-nums">{formatTime(reading.timestamp)}</Text>
          <ContextChip context={reading.context} />
        </View>
        <StatusBadge status={reading.status} />
      </View>
      <View className="flex-row items-end justify-between gap-sm">
        <GlucoseValue value={reading.value} status={reading.status} />
        {target !== '' && (
          <Text className={cn('mb-sm font-medium text-body-sm', targetColor[family])}>Meta: {target}</Text>
        )}
      </View>
      {(reading.note || hasInsulin) && (
        <View className="flex-row items-center gap-sm">
          <Icon name={reading.note ? 'notes' : READING_CONTEXTS[reading.context].icon} size={16} color={colors.textMuted} />
          <Text numberOfLines={1} className="flex-1 font-regular text-body-sm text-text-secondary">
            {reading.note ?? ''}
          </Text>
          {hasInsulin && (
            <View
              className={cn(
                'rounded-full border px-2 py-0.5',
                reading.isCorrection
                  ? 'border-status-off-target-border bg-status-off-target-bg'
                  : 'border-inset-border bg-inset',
              )}>
              <Text
                className={cn(
                  'font-semibold text-label-sm',
                  reading.isCorrection ? 'text-status-off-target-fg' : 'text-text-secondary',
                )}>
                {formatInsulin(reading.insulinUnits, reading.isCorrection)}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
