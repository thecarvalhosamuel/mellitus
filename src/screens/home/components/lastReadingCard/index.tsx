import { Text, View } from 'react-native';

import { GlucoseValue } from '@/components/glucose/glucoseValue';
import { GlycemicRangeBar } from '@/components/glucose/glycemicRangeBar';
import { StatusBadge } from '@/components/glucose/statusBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseAlerts } from '@/shared/types/pattern';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatReadingMoment, formatTargetRange } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';
import type { PeriodStats } from '@/shared/utils/stats';

import { SummaryMetrics } from './components/summaryMetrics';

type LastReadingCardProps = {
  reading: GlucoseReading;
  alerts?: Pick<GlucoseAlerts, 'hypo' | 'hyper'>;
  monthStats: PeriodStats;
};

/** Hero tile (DESIGN.md §4.6): contexto, meta, valor, status, barra de faixa e métricas do mês. */
export function LastReadingCard({ reading, alerts, monthStats }: LastReadingCardProps) {
  const { colors } = useTheme();
  const context = READING_CONTEXTS[reading.context];
  const target = formatTargetRange(reading.target);

  return (
    <Card status={getStatusFamily(reading.status)}>
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 gap-xs">
          <Text className="font-bold text-label-sm uppercase text-text-muted">Última leitura</Text>
          <View className="flex-row items-center gap-xs">
            <Icon name={context.icon} size={16} color={colors.textSecondary} />
            <Text className="font-medium text-body-sm text-text-secondary">
              {context.label} • {formatReadingMoment(reading.timestamp)}
            </Text>
          </View>
        </View>
        {target !== '' && <Badge label={`${target} mg/dL`} tone="inRange" dot />}
      </View>
      <View className="flex-row flex-wrap items-center justify-between gap-sm">
        <GlucoseValue value={reading.value} status={reading.status} />
        <StatusBadge status={reading.status} />
      </View>
      {alerts && reading.target && <GlycemicRangeBar target={reading.target} alerts={alerts} value={reading.value} />}
      <SummaryMetrics stats={monthStats} />
    </Card>
  );
}
