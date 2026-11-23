import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Textarea de 2 linhas (notas, instruções de conduta). */
  multiline?: boolean;
  error?: string;
  helper?: string;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

/** Campo de texto (DESIGN.md §4.3): fundo tonal, sem borda; no foco, anel primary. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
  helper,
  maxLength,
  autoCapitalize = 'sentences',
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-xs">
      <Text className="font-semibold text-label-md text-text-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 2 : 1}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={error ?? helper}
        className={cn(
          'rounded-input border-2 bg-input px-3 font-regular text-body-md text-text',
          multiline ? 'min-h-[72px] py-3' : 'min-h-control',
          error ? 'border-status-danger-base' : focused ? 'border-input-focus' : 'border-input-border',
        )}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
      />
      {(error || helper) && (
        <Text className={cn('font-regular text-body-sm', error ? 'text-status-danger-fg' : 'text-text-muted')}>
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}
