import { Text, View } from 'react-native';

import { GlucoseValue } from '@/components/glucose/glucoseValue';
import { StatusBadge } from '@/components/glucose/statusBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatReadingMoment, formatTargetRange } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';

type LastReadingCardProps = { reading: GlucoseReading };

// Barra de faixa e métricas do mês (média, % no alvo) entram na etapa 9.
export function LastReadingCard({ reading }: LastReadingCardProps) {
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
    </Card>
  );
}
