import { Pressable, Text } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type BackButtonProps = { label: string; onPress: () => void };

/** Pill "← Voltar para Metas" (DESIGN.md §4.1). */
export function BackButton({ label, onPress }: BackButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-touch flex-row items-center gap-xs self-start rounded-cta border border-control-border bg-control px-3 active:bg-control-pressed">
      <Icon name="arrow-back" size={18} color={colors.primary} />
      <Text className="font-semibold text-label-md text-primary">{label}</Text>
    </Pressable>
  );
}
