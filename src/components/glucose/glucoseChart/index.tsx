import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { toDateKey } from '@/shared/utils/date';
import { formatShortDate } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';

import { CHART_HEIGHT, PADDING, useChartScale } from './useChartScale';

type GlucoseChartProps = {
  /** Em ordem de horário. */
  readings: GlucoseReading[];
  /** Faixa-alvo desenhada como corredor verde (do padrão ativo). */
  target: TargetRange;
  range: { from: Date; to: Date };
  accessibilityLabel: string;
};

/**
 * Curva glicêmica (DESIGN.md §4.6 e §10.4): corredor-alvo, linha suave com área,
 * pontos por dia do ciclo e cor de status fora da faixa, hoje destacado.
 */
export function GlucoseChart({ readings, target, range, accessibilityLabel }: GlucoseChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const chart = useChartScale(readings, target, range, width);
  const todayKey = toDateKey(new Date());

  const pointColor = (reading: GlucoseReading) => {
    const family = getStatusFamily(reading.status);
    return family === 'inRange' ? colors.primary : colors.status[family].base;
  };
  const bandTop = chart.y(target.max ?? chart.domain[1]);
  const bandBottom = chart.y(target.min ?? chart.domain[0]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: CHART_HEIGHT }}>
      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.25} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Corredor-alvo e seus limites */}
          <Rect
            x={chart.x(range.from.getTime())}
            y={bandTop}
            width={chart.innerRight - chart.x(range.from.getTime())}
            height={Math.max(0, bandBottom - bandTop)}
            fill={colors.status.inRange.base}
            fillOpacity={0.14}
          />
          {[target.max, target.min].map(
            (limit) =>
              limit !== undefined && (
                <ChartLimit key={limit} y={chart.y(limit)} x2={chart.innerRight} label={String(limit)} color={colors.status.inRange.base} muted={colors.textMuted} />
              ),
          )}
          <Line x1={PADDING.left} x2={chart.innerRight} y1={chart.innerBottom} y2={chart.innerBottom} stroke={colors.grid} strokeWidth={1} />

          {/* Curva */}
          {chart.area !== '' && <Path d={chart.area} fill="url(#area)" />}
          {chart.line !== '' && (
            <Path d={chart.line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Pontos: Dia A sólido, Dia B vazado, fora da faixa na cor do status, hoje maior */}
          {chart.points.map(({ reading, x, y }) => {
            const isToday = toDateKey(reading.timestamp) === todayKey;
            const color = pointColor(reading);
            const hollow = reading.cycleDay === 'B' && getStatusFamily(reading.status) === 'inRange';
            return (
              <Circle
                key={reading.id}
                cx={x}
                cy={y}
                r={isToday ? 6 : 4}
                fill={hollow ? colors.card : color}
                stroke={hollow ? color : colors.card}
                strokeWidth={hollow ? 2 : 1.5}
              />
            );
          })}

          {/* Eixo X */}
          {chart.ticks.map((tick) => (
            <SvgText
              key={tick.dateKey}
              x={tick.x}
              y={CHART_HEIGHT - 6}
              fontSize={10}
              fontWeight={tick.dateKey === todayKey ? '700' : '500'}
              fill={tick.dateKey === todayKey ? colors.primary : colors.textMuted}
              textAnchor="middle">
              {tick.dateKey === todayKey ? 'Hoje' : formatShortDate(tick.date)}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

type LimitProps = { y: number; x2: number; label: string; color: string; muted: string };

function ChartLimit({ y, x2, label, color, muted }: LimitProps) {
  return (
    <>
      <Line x1={PADDING.left} x2={x2} y1={y} y2={y} stroke={color} strokeOpacity={0.8} strokeWidth={1.2} strokeDasharray="4 4" />
      <SvgText x={PADDING.left - 6} y={y + 3} fontSize={10} fill={muted} textAnchor="end">
        {label}
      </SvgText>
    </>
  );
}
