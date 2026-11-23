import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ThemeColors } from '@/shared/theme/colors';
import { cn } from '@/shared/utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'inRange' | 'offTarget' | 'danger';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  /** Dot à esquerda (ex.: "● No Alvo", "● Ativo"). */
  dot?: boolean;
  uppercase?: boolean;
};

const container: Record<BadgeTone, string> = {
  neutral: 'bg-status-context-bg border-status-context-border',
  primary: 'bg-primary-tint border-primary-tint-border',
  inRange: 'bg-status-in-range-bg border-status-in-range-border',
  offTarget: 'bg-status-off-target-bg border-status-off-target-border',
  danger: 'bg-status-danger-bg border-status-danger-border',
};

const text: Record<BadgeTone, string> = {
  neutral: 'text-status-context-fg',
  primary: 'text-on-primary-tint',
  inRange: 'text-status-in-range-fg',
  offTarget: 'text-status-off-target-fg',
  danger: 'text-status-danger-fg',
};

const foreground = (tone: BadgeTone, colors: ThemeColors) =>
  ({
    neutral: colors.status.context.fg,
    primary: colors.onPrimaryTint,
    inRange: colors.status.inRange.fg,
    offTarget: colors.status.offTarget.fg,
    danger: colors.status.danger.fg,
  })[tone];

const dotColor = (tone: BadgeTone, colors: ThemeColors) =>
  tone === 'inRange'
    ? colors.status.inRange.dot
    : tone === 'offTarget'
      ? colors.status.offTarget.dot
      : tone === 'danger'
        ? colors.status.danger.dot
        : foreground(tone, colors);

/** Pill genérica (DESIGN.md §4.2). Status glicêmico usa StatusBadge, que se apoia nesta. */
export function Badge({ label, tone = 'neutral', icon, dot = false, uppercase = false }: BadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      className={cn('flex-row items-center gap-xs self-start rounded-full border px-2.5 py-1', container[tone])}>
      {dot && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(tone, colors) }} />}
      {icon && <Icon name={icon} size={14} color={foreground(tone, colors)} />}
      <Text className={cn('font-bold text-label-sm', text[tone], uppercase && 'uppercase')}>{label}</Text>
    </View>
  );
}
