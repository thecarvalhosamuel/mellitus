import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { elevation } from '@/shared/theme/tokens';
import type { StatusFamily } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';

type CardProps = {
  children: ReactNode;
  /** default = card branco/ardósia · highlight = card de destaque (ciclo) · recessed = pill recuada. */
  variant?: 'default' | 'highlight' | 'recessed';
  /** Borda acompanhando o status (hero tile da última leitura). */
  status?: StatusFamily;
  className?: string;
};

const variants = {
  default: 'bg-card border-card-border',
  highlight: 'bg-card-highlight border-card-border',
  recessed: 'bg-recessed border-inset-border',
};

const statusBorder: Record<StatusFamily, string> = {
  inRange: 'border-status-in-range-border',
  offTarget: 'border-status-off-target-border',
  danger: 'border-status-danger-border',
};

export function Card({ children, variant = 'default', status, className }: CardProps) {
  const { scheme } = useTheme();

  return (
    <View
      className={cn('gap-md rounded-card border p-md', variants[variant], status && statusBorder[status], className)}
      style={scheme === 'light' && variant === 'default' ? elevation.card : undefined}>
      {children}
    </View>
  );
}
