import { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type StepperProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  unit?: string;
  accessibilityLabel: string;
};

const REPEAT_MS = 70;

/**
 * Stepper − [valor] + (DESIGN.md §4.4). O valor também pode ser digitado; segurar
 * os botões repete ±1. Para leitores de tela, é um controle ajustável.
 */
export function Stepper({ value, onChange, min, max, unit = 'mg/dL', accessibilityLabel }: StepperProps) {
  const { colors } = useTheme();
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Valor mais recente para a repetição do long-press (o intervalo não vê re-renders).
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
  }, [value]);

  useEffect(() => () => clearInterval(timer.current), []);

  const step = (delta: number) => {
    const base = latest.current ?? (delta > 0 ? min - 1 : max + 1);
    const next = Math.min(max, Math.max(min, base + delta));
    latest.current = next;
    onChange(next);
  };
  const startRepeat = (delta: number) => {
    clearInterval(timer.current);
    timer.current = setInterval(() => step(delta), REPEAT_MS);
  };
  const stopRepeat = () => clearInterval(timer.current);

  const button = (delta: 1 | -1) => (
    <Pressable
      onPress={() => step(delta)}
      onLongPress={() => startRepeat(delta)}
      onPressOut={stopRepeat}
      delayLongPress={350}
      accessible={false}
      className="h-control w-control items-center justify-center rounded-full border border-card-border bg-control active:bg-control-pressed">
      <Icon name={delta > 0 ? 'add' : 'remove'} size={26} color={colors.onControl} />
    </Pressable>
  );

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: value === undefined ? 'vazio' : `${value} ${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      className="flex-row items-center justify-between gap-md">
      {button(-1)}
      <View className="flex-1 flex-row items-baseline justify-center gap-xs">
        <TextInput
          value={value === undefined ? '' : String(value)}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '');
            onChange(digits === '' ? undefined : Number(digits));
          }}
          keyboardType="number-pad"
          maxLength={3}
          selectTextOnFocus
          className="min-w-[96px] text-center font-bold text-display-numeric text-primary"
          style={{ fontVariant: ['tabular-nums'] }}
        />
        <Text className="font-medium text-body-md text-text-muted">{unit}</Text>
      </View>
      {button(1)}
    </View>
  );
}
