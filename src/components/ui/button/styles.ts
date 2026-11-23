import type { ThemeColors } from '@/shared/theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger';

// DESIGN.md §4.1 e §10.4.
export const containerVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:opacity-90',
  secondary: 'border border-control-border bg-control active:bg-control-pressed',
  outlined: 'border-[1.5px] border-primary bg-transparent active:bg-primary-tint',
  ghost: 'bg-transparent active:bg-control',
  danger: 'bg-destructive active:opacity-90',
};

export const labelVariants: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-on-control',
  outlined: 'text-primary',
  ghost: 'text-text-muted',
  danger: 'text-on-destructive',
};

/** Cor do ícone/spinner (componentes nativos não aceitam className). */
export const contentColor = (variant: ButtonVariant, colors: ThemeColors): string =>
  ({
    primary: colors.onPrimary,
    secondary: colors.onControl,
    outlined: colors.primary,
    ghost: colors.textMuted,
    danger: colors.onDestructive,
  })[variant];
