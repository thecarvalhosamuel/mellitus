import { Text, View } from 'react-native';

import { StatusBadge } from '@/components/glucose/statusBadge';
import { Stepper } from '@/components/ui/stepper';
import { GLUCOSE_LIMITS } from '@/shared/constants/glucose';
import type { GlucoseStatus, TargetRange } from '@/shared/types/reading';
import { formatTargetRange } from '@/shared/utils/format';

type GlucoseValueInputProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Classificação prevista com o padrão ativo para o momento escolhido. */
  preview?: { status: GlucoseStatus; target: TargetRange };
  error?: string;
};

/** "VALOR MEDIDO": stepper 40–450 + badge dinâmico com a meta do padrão ativo. */
export function GlucoseValueInput({ value, onChange, preview, error }: GlucoseValueInputProps) {
  const target = preview ? formatTargetRange(preview.target) : '';

  return (
    <View className="gap-sm">
      <Text className="font-bold text-label-sm uppercase text-text-muted">Valor medido</Text>
      <Stepper
        value={value}
        onChange={onChange}
        min={GLUCOSE_LIMITS.manualMin}
        max={GLUCOSE_LIMITS.manualMax}
        accessibilityLabel="Valor da glicemia"
      />
      <View className="min-h-[28px] flex-row items-center justify-center gap-sm">
        {error ? (
          <Text accessibilityLiveRegion="polite" className="font-medium text-body-sm text-status-danger-fg">
            {error}
          </Text>
        ) : (
          preview && (
            <>
              <StatusBadge status={preview.status} />
              {target !== '' && (
                <Text className="font-medium text-body-sm text-text-muted">Meta: {target} mg/dL</Text>
              )}
            </>
          )
        )}
      </View>
    </View>
  );
}
