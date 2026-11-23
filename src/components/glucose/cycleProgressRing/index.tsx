import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/shared/hooks/useTheme';

type CycleProgressRingProps = { done: number; total: number };

const SIZE = 48;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anel de progresso das medições do dia ("1/3", "Hoje") (DESIGN.md §4.6). */
export function CycleProgressRing({ done, total }: CycleProgressRingProps) {
  const { colors } = useTheme();
  const fraction = total > 0 ? Math.min(1, done / total) : 0;

  return (
    <View
      accessible
      accessibilityLabel={`${done} de ${total} medições feitas hoje`}
      className="items-center gap-xs">
      <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.ringTrack} strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.primary}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          />
        </Svg>
        <Text className="font-bold text-label-md text-text-strong tabular-nums">
          {done}/{total}
        </Text>
      </View>
      <Text className="font-semibold text-label-sm text-text-muted">Hoje</Text>
    </View>
  );
}
