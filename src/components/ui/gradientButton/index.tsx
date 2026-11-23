import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { radius } from '@/shared/theme/tokens';
import { cn } from '@/shared/utils/cn';

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

/**
 * CTA principal: sólido no claro e gradiente no escuro, sempre com o texto
 * de contraste do tema (escuro no gradiente, nunca branco — DESIGN.md §10.4).
 */
export function GradientButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  loadingLabel = 'Salvando…',
}: GradientButtonProps) {
  const { colors, gradients } = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={cn('self-stretch active:scale-[0.98]', inactive && 'opacity-50')}>
      {({ pressed }) => (
        <LinearGradient
          colors={pressed ? gradients.ctaPressed : gradients.cta}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            borderRadius: radius.md,
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 16,
          }}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.onCta} />
          ) : (
            icon && <Icon name={icon} size={22} color={colors.onCta} />
          )}
          <Text className="font-bold text-label-lg text-on-cta">{loading ? loadingLabel : label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}
