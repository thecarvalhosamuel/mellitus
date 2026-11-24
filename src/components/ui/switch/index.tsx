import { Switch as NativeSwitch } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  /** Lido depois do rótulo (ex.: a descrição da linha). */
  accessibilityHint?: string;
  disabled?: boolean;
};

/** Switch nativo com as cores do tema (DESIGN.md §4.4 e §10.4). */
export function Switch({ value, onValueChange, accessibilityLabel, accessibilityHint, disabled = false }: SwitchProps) {
  const { colors } = useTheme();

  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.switchOff, true: colors.switchOn }}
      thumbColor={colors.switchThumb}
      ios_backgroundColor={colors.switchOff}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
    />
  );
}
