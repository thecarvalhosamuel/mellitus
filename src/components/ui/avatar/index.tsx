import { Text, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

type AvatarProps = {
  /** Nome salvo no aparelho; mostra só a inicial (sem foto no MVP). */
  name?: string;
  size?: 'sm' | 'md';
};

/** Inicial do nome em círculo (DESIGN.md §3.1 e §10.4). Decorativo: quem envolve define o rótulo. */
export function Avatar({ name, size = 'sm' }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || '·';

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'items-center justify-center rounded-full border border-primary-tint-border bg-primary-tint',
        size === 'sm' ? 'h-8 w-8' : 'h-12 w-12',
      )}>
      <Text className={cn('font-bold text-on-primary-tint', size === 'sm' ? 'text-label-lg' : 'text-headline-sm')}>
        {initial}
      </Text>
    </View>
  );
}
