import { Text, View } from 'react-native';

import { CycleDayTag } from '@/components/glucose/cycleDayTag';
import { GlucoseValue } from '@/components/glucose/glucoseValue';
import { StatusBadge } from '@/components/glucose/statusBadge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { SubBlock } from '@/components/ui/subBlock';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatInsulin, formatReadingMoment, formatTargetRange } from '@/shared/utils/format';

type RecentReadingCardProps = { reading: GlucoseReading };

/** Ícone + momento + hora + dia do ciclo; meta; valor e status; nota (DESIGN.md §4.6). */
export function RecentReadingCard({ reading }: RecentReadingCardProps) {
  const { colors } = useTheme();
  const context = READING_CONTEXTS[reading.context];
  const target = formatTargetRange(reading.target);
  const hasInsulin = reading.insulinUnits !== undefined;

  return (
    <Card>
      <View className="flex-row items-start gap-sm">
        <View className="h-9 w-9 items-center justify-center rounded-full border border-status-in-range-border bg-status-in-range-bg">
          <Icon name={context.icon} size={18} color={colors.status.inRange.fg} />
        </View>
        <View className="flex-1 gap-xs">
          <Text className="font-semibold text-label-lg text-text-strong">{context.label}</Text>
          <Text className="font-regular text-body-sm text-text-muted">{formatReadingMoment(reading.timestamp)}</Text>
          {reading.cycleDay && <CycleDayTag day={reading.cycleDay} slot={reading.cycleSlot} />}
        </View>
        <View className="items-end gap-xs">
          <GlucoseValue value={reading.value} status={reading.status} size="md" />
          <StatusBadge status={reading.status} />
        </View>
      </View>
      {target !== '' && <Text className="font-regular text-body-sm text-text-secondary">Meta: {target} mg/dL</Text>}
      {(reading.note || hasInsulin) && (
        <SubBlock>
          {reading.note && <Text className="font-regular text-body-sm text-text-secondary">{reading.note}</Text>}
          {hasInsulin && (
            <Text className="font-semibold text-label-md text-text-secondary">
              {formatInsulin(reading.insulinUnits, reading.isCorrection)}
            </Text>
          )}
        </SubBlock>
      )}
    </Card>
  );
}
