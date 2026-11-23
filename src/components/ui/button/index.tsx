import { ActivityIndicator, Pressable, Text } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

import { containerVariants, contentColor, labelVariants, type ButtonVariant } from './styles';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  /** Mostra o spinner, troca o texto e bloqueia toques. */
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  loadingLabel = 'Salvando…',
  fullWidth = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const color = contentColor(variant, colors);
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      className={cn(
        'min-h-control flex-row items-center justify-center gap-sm rounded-button px-md',
        containerVariants[variant],
        fullWidth && 'self-stretch',
        inactive && 'opacity-50',
      )}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        icon && <Icon name={icon} size={20} color={color} />
      )}
      <Text className={cn('font-semibold text-label-lg', labelVariants[variant])}>
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
