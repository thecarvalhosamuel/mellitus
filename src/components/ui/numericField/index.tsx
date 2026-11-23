import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type NumericFieldProps = {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Prefixo inline: "Mín:", "Máx:", "Até:", "<", ">". */
  prefix?: string;
  unit?: string;
  error?: string;
  maxLength?: number;
};

/** Valor numérico de alvo ou limite (DESIGN.md §4.3). Aceita só dígitos. */
export function NumericField({
  label,
  value,
  onChange,
  prefix,
  unit = 'mg/dL',
  error,
  maxLength = 3,
}: NumericFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    onChange(digits === '' ? undefined : Number(digits));
  };

  return (
    <View className="gap-xs">
      <Text className="font-semibold text-label-md text-text-secondary">{label}</Text>
      <View
        className={cn(
          'min-h-control flex-row items-center gap-sm rounded-input border-2 bg-input px-3',
          error ? 'border-status-danger-base' : focused ? 'border-input-focus' : 'border-input-border',
        )}>
        {prefix && <Text className="font-semibold text-label-md text-text-muted">{prefix}</Text>}
        <TextInput
          value={value === undefined ? '' : String(value)}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={maxLength}
          placeholder="—"
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={`${label}${prefix ? ` ${prefix}` : ''}, em ${unit}`}
          accessibilityHint={error}
          className="flex-1 font-semibold text-headline-sm text-text-strong"
          style={{ fontVariant: ['tabular-nums'] }}
        />
        <Text className="font-medium text-label-sm text-text-muted">{unit}</Text>
      </View>
      {error && <Text className="font-regular text-body-sm text-status-danger-fg">{error}</Text>}
    </View>
  );
}
