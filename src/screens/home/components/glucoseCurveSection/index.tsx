import { Text, View } from 'react-native';

import { GlucoseChart } from '@/components/glucose/glucoseChart';
import { TimeInRangeBar } from '@/components/glucose/timeInRangeBar';
import { Card } from '@/components/ui/card';
import { FilterChips } from '@/components/ui/filterChips';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { formatTargetRange } from '@/shared/utils/format';
import type { ChartPeriod } from '@/shared/utils/period';
import type { PeriodStats } from '@/shared/utils/stats';

import { ChartLegend } from './components/chartLegend';
import { PeriodStatsGrid } from './components/periodStats';

type GlucoseCurveSectionProps = {
  period: ChartPeriod;
  periodOptions: { value: ChartPeriod; label: string }[];
  onChangePeriod: (period: ChartPeriod) => void;
  range: { from: Date; to: Date };
  readings: GlucoseReading[];
  stats: PeriodStats;
  target: TargetRange;
};

/** Curva Glicêmica: legenda, filtro de período, gráfico e estatísticas (DESIGN.md §5.1). */
export function GlucoseCurveSection(props: GlucoseCurveSectionProps) {
  const { colors } = useTheme();
  const { readings, stats, target } = props;
  const targetLabel = formatTargetRange(target);

  return (
    <Card>
      <View className="flex-row items-center gap-xs">
        <Icon name="ssid-chart" size={20} color={colors.primary} />
        <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
          Curva Glicêmica
        </Text>
      </View>
      <ChartLegend targetLabel={targetLabel} />
      <FilterChips
        accessibilityLabel="Período do gráfico"
        options={props.periodOptions}
        value={props.period}
        onChange={props.onChangePeriod}
      />
      {readings.length === 0 ? (
        <Text className="py-lg text-center font-regular text-body-md text-text-secondary">
          Nenhuma medição neste período ainda.
        </Text>
      ) : (
        <>
          <GlucoseChart
            readings={readings}
            target={target}
            range={props.range}
            accessibilityLabel={`Curva glicêmica com ${stats.count} medições. Faixa-alvo ${targetLabel} mg/dL.`}
          />
          <PeriodStatsGrid stats={stats} readings={readings} />
          <TimeInRangeBar tir={stats.tir} />
        </>
      )}
    </Card>
  );
}
