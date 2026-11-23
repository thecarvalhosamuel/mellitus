import { Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type InfoBannerProps = { icon: IconName; title: string; description: string };

/** Banner informativo: ícone em quadrado, título e texto (DESIGN.md §4.5). */
export function InfoBanner({ icon, title, description }: InfoBannerProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row gap-sm rounded-card border border-control-border bg-control p-md">
      <View className="h-10 w-10 items-center justify-center rounded-cta bg-primary-tint">
        <Icon name={icon} size={20} color={colors.onPrimaryTint} />
      </View>
      <View className="flex-1 gap-xs">
        <Text className="font-bold text-label-lg text-text-strong">{title}</Text>
        <Text className="font-regular text-body-sm text-text-secondary">{description}</Text>
      </View>
    </View>
  );
}
