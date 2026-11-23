import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { NumericField } from '@/components/ui/numericField';
import { SubBlock } from '@/components/ui/subBlock';
import { useTheme } from '@/shared/hooks/useTheme';
import type { TargetRange } from '@/shared/types/reading';

type RangeFieldsProps = {
  icon: IconName;
  title: string;
  value: TargetRange;
  onChange: (value: TargetRange) => void;
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
  error?: string;
};

/** Sub-bloco com mínimo e máximo de um momento (jejum, ao deitar). */
export function RangeFields({ icon, title, value, onChange, minLabel = 'Mínimo', maxLabel = 'Máximo', hint, error }: RangeFieldsProps) {
  const { colors } = useTheme();

  return (
    <SubBlock>
      <View className="flex-row items-center gap-xs">
        <Icon name={icon} size={18} color={colors.primary} />
        <Text className="font-bold text-label-lg text-text-strong">{title}</Text>
      </View>
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <NumericField label={minLabel} value={value.min} onChange={(min) => onChange({ ...value, min })} />
        </View>
        <View className="flex-1">
          <NumericField label={maxLabel} value={value.max} onChange={(max) => onChange({ ...value, max })} />
        </View>
      </View>
      {error ? (
        <Text className="font-regular text-body-sm text-status-danger-fg">{error}</Text>
      ) : (
        hint && <Text className="font-regular text-body-sm text-text-muted">{hint}</Text>
      )}
    </SubBlock>
  );
}
