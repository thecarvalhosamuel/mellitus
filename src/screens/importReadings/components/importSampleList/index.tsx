import { Text, View } from 'react-native';

import { GlucoseValue } from '@/components/glucose/glucoseValue';
import { StatusBadge } from '@/components/glucose/statusBadge';
import { Card } from '@/components/ui/card';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatShortDate, formatTime } from '@/shared/utils/format';

type ImportSampleListProps = { readings: GlucoseReading[]; total: number };

/** Amostra das primeiras leituras como vão aparecer no histórico. */
export function ImportSampleList({ readings, total }: ImportSampleListProps) {
  if (readings.length === 0) return null;

  return (
    <Card>
      <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
        Prévia {total > readings.length ? `(${readings.length} de ${total})` : ''}
      </Text>
      {readings.map((r) => (
        <View key={r.id} className="flex-row items-center gap-sm border-b border-inset-border pb-sm">
          <View className="flex-1 gap-xs">
            <Text className="font-semibold text-label-lg text-text-strong">{READING_CONTEXTS[r.context].label}</Text>
            <Text className="font-regular text-body-sm text-text-muted tabular-nums">
              {formatShortDate(r.timestamp)} · {formatTime(r.timestamp)}
            </Text>
          </View>
          <View className="items-end gap-xs">
            <GlucoseValue value={r.value} status={r.status} size="md" />
            <StatusBadge status={r.status} />
          </View>
        </View>
      ))}
    </Card>
  );
}
