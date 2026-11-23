import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { NumericField } from '@/components/ui/numericField';
import { SegmentedControl } from '@/components/ui/segmentedControl';
import { StepHeader } from '@/components/ui/stepHeader';
import { SubBlock } from '@/components/ui/subBlock';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseAlerts, PostprandialWindow } from '@/shared/types/pattern';
import type { TargetRange } from '@/shared/types/reading';
import type { PatternField } from '@/shared/utils/pattern';

import { CriticalAlerts } from './components/criticalAlerts';
import { RangeFields } from './components/rangeFields';

type TargetsStepProps = {
  fasting: TargetRange;
  onFastingChange: (v: TargetRange) => void;
  postMax?: number;
  onPostMaxChange: (v: number | undefined) => void;
  windowHours: PostprandialWindow;
  onWindowChange: (v: PostprandialWindow) => void;
  bedtime: TargetRange;
  onBedtimeChange: (v: TargetRange) => void;
  alerts: GlucoseAlerts;
  onAlertsChange: (v: GlucoseAlerts) => void;
  errors: Partial<Record<PatternField, string>>;
};

const WINDOWS = [
  { value: 1 as const, label: '1 hora' },
  { value: 2 as const, label: '2 horas (recomendado)' },
];

/** ② Alvos glicêmicos por momento e limites de alerta (DESIGN.md §5.4). */
export function TargetsStep(props: TargetsStepProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <StepHeader step={2} title="Alvos Glicêmicos" badge="mg/dL" />
      <RangeFields
        icon="wb-twilight"
        title="Jejum e pré-refeição"
        value={props.fasting}
        onChange={props.onFastingChange}
        error={props.errors.fasting}
      />
      <SubBlock>
        <View className="flex-row items-center gap-xs">
          <Icon name="restaurant" size={18} color={colors.primary} />
          <Text className="font-bold text-label-lg text-text-strong">Pós-refeição</Text>
        </View>
        <SegmentedControl
          accessibilityLabel="Janela de medição pós-refeição"
          options={WINDOWS}
          value={props.windowHours}
          onChange={props.onWindowChange}
        />
        <NumericField
          label="Teto máximo"
          prefix="Até:"
          value={props.postMax}
          onChange={props.onPostMaxChange}
          error={props.errors.postprandial}
        />
      </SubBlock>
      <RangeFields
        icon="bedtime"
        title="Noturno e ao deitar"
        value={props.bedtime}
        onChange={props.onBedtimeChange}
        minLabel="Base segura"
        maxLabel="Teto noturno"
        hint="Opcional: sem valores, vale a faixa de jejum."
        error={props.errors.bedtime}
      />
      <CriticalAlerts alerts={props.alerts} onChange={props.onAlertsChange} errors={props.errors} />
    </Card>
  );
}
