import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type IconButtonProps = {
  icon: IconName;
  /** Obrigatório: botões só com ícone precisam de rótulo para leitores de tela. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: 'ghost' | 'tonal';
  disabled?: boolean;
  size?: number;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  disabled = false,
  size = 24,
}: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={4}
      className={cn(
        'h-touch w-touch items-center justify-center rounded-full',
        variant === 'tonal' ? 'border border-control-border bg-control active:bg-control-pressed' : 'active:bg-control',
        disabled && 'opacity-50',
      )}>
      <Icon name={icon} size={size} color={variant === 'tonal' ? colors.onControl : colors.textSecondary} />
    </Pressable>
  );
}
