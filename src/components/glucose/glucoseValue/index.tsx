import { Text, View } from 'react-native';

import { GLUCOSE_STATUS } from '@/shared/constants/glucose';
import type { GlucoseStatus, StatusFamily } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { formatGlucose } from '@/shared/utils/format';

type GlucoseValueProps = {
  value: number;
  status: GlucoseStatus;
  /** hero = 44/48 (última leitura) · md = 22/28 (listas). */
  size?: 'hero' | 'md';
};

const valueColor: Record<StatusFamily, string> = {
  inRange: 'text-status-in-range-value',
  offTarget: 'text-status-off-target-value',
  danger: 'text-status-danger-value',
};

/** Número da glicemia + "mg/dL" menor, alinhados pela base (DESIGN.md §2.3). */
export function GlucoseValue({ value, status, size = 'hero' }: GlucoseValueProps) {
  const formatted = formatGlucose(value);

  return (
    <View
      accessible
      accessibilityLabel={`${formatted} miligramas por decilitro, ${GLUCOSE_STATUS[status].label}`}
      className="flex-row items-baseline gap-xs">
      <Text
        className={cn(
          'font-bold tabular-nums',
          size === 'hero' ? 'text-display-numeric' : 'text-headline-md',
          valueColor[GLUCOSE_STATUS[status].family],
        )}>
        {formatted}
      </Text>
      <Text className={cn('font-medium text-text-muted', size === 'hero' ? 'text-body-md' : 'text-body-sm')}>mg/dL</Text>
    </View>
  );
}
