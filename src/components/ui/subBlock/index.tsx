import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/utils/cn';

type SubBlockProps = { children: ReactNode; className?: string };

/** Agrupa um alvo, métrica ou nota dentro de um card (DESIGN.md §4.5). */
export function SubBlock({ children, className }: SubBlockProps) {
  return <View className={cn('gap-sm rounded border border-inset-border bg-inset p-3', className)}>{children}</View>;
}
