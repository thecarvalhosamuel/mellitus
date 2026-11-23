import { Text, View } from 'react-native';

import { SubBlock } from '@/components/ui/subBlock';
import { TIR_GOAL } from '@/shared/constants/glucose';
import { cn } from '@/shared/utils/cn';
import { formatGlucose, formatPercent } from '@/shared/utils/format';
import type { PeriodStats } from '@/shared/utils/stats';

type SummaryMetricsProps = { stats: PeriodStats };

/** "Média Mensal" e "% no Alvo" do mês atual, com a meta de TIR (DESIGN.md §4.6). */
export function SummaryMetrics({ stats }: SummaryMetricsProps) {
  const hasData = stats.count > 0 && stats.mean !== null;
  const meetsGoal = stats.tir.inRange > TIR_GOAL;

  return (
    <View className="flex-row gap-sm">
      <SubBlock className="flex-1">
        <Text className="font-semibold text-label-md text-text-secondary">Média Mensal</Text>
        <Text className="font-bold text-headline-sm text-text-strong tabular-nums">
          {hasData ? `${formatGlucose(stats.mean!)} mg/dL` : '—'}
        </Text>
        <Text className="font-regular text-body-sm text-text-muted">
          {hasData ? `${stats.count} ${stats.count === 1 ? 'medição' : 'medições'}` : 'Sem medições no mês'}
        </Text>
      </SubBlock>
      <SubBlock className="flex-1">
        <Text className="font-semibold text-label-md text-text-secondary">% no Alvo</Text>
        <Text
          className={cn(
            'font-bold text-headline-sm tabular-nums',
            !hasData ? 'text-text-strong' : meetsGoal ? 'text-status-in-range-fg' : 'text-status-off-target-fg',
          )}>
          {hasData ? formatPercent(stats.tir.inRange) : '—'}
        </Text>
        <Text className="font-regular text-body-sm text-text-muted">Meta: &gt;{formatPercent(TIR_GOAL)}</Text>
      </SubBlock>
    </View>
  );
}
