import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

type TimeFieldProps = {
  label: string;
  /** "HH:mm" */
  value: string;
  onChange: (time: string) => void;
  compact?: boolean;
};

const VALID = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Formata dígitos digitados como HH:mm ("0730" → "07:30"). */
function mask(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, d.length - 2)}:${d.slice(-2)}`;
}

/** "730" → "07:30"; "0730" → "07:30". */
function normalize(text: string): string {
  const d = text.replace(/\D/g, '');
  if (d.length === 3) return `0${d[0]}:${d.slice(1)}`;
  if (d.length === 4) return `${d.slice(0, 2)}:${d.slice(2)}`;
  return text;
}

/** Horário digitado no teclado numérico, sem depender de picker nativo. */
export function TimeField({ label, value, onChange, compact = false }: TimeFieldProps) {
  // Rascunho só enquanto edita; fora disso, mostra o valor recebido.
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  const commit = () => {
    if (draft === null) return;
    const next = normalize(draft);
    const ok = VALID.test(next);
    setInvalid(!ok);
    setDraft(null);
    if (ok && next !== value) onChange(next);
  };

  return (
    <View className={cn('gap-xs', compact && 'w-[88px]')}>
      {!compact && <Text className="font-semibold text-label-md text-text-secondary">{label}</Text>}
      <TextInput
        value={draft ?? value}
        onChangeText={(t) => setDraft(mask(t))}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        maxLength={5}
        selectTextOnFocus
        accessibilityLabel={`${label}, horário`}
        accessibilityHint={invalid ? 'Horário inválido. Use hora e minutos, como 07:30.' : undefined}
        className={cn(
          'min-h-touch rounded-input border-2 bg-input px-3 text-center font-semibold text-label-lg text-text-strong',
          invalid ? 'border-status-danger-base' : 'border-input-border',
        )}
        style={{ fontVariant: ['tabular-nums'] }}
      />
    </View>
  );
}
