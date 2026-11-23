import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
  /** Ação opcional (ex.: botão "Ver todos os registros"). */
  action?: ReactNode;
};

/** Estado vazio calmo (DESIGN.md §5.2): ícone 48, título e descrição centralizados. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-sm px-md py-xl">
      <Icon name={icon} size={48} color={colors.textMuted} />
      <Text accessibilityRole="header" className="text-center font-bold text-headline-sm text-text-strong">
        {title}
      </Text>
      {description && (
        <Text className="text-center font-regular text-body-md text-text-secondary">{description}</Text>
      )}
      {action && <View className="mt-sm self-stretch">{action}</View>}
    </View>
  );
}
