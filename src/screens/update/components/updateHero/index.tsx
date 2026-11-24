import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type UpdateHeroProps = { currentVersion: string; newVersion: string; publishedLabel: string | null };

/** Ícone, título e "versão instalada → nova versão". */
export function UpdateHero({ currentVersion, newVersion, publishedLabel }: UpdateHeroProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-sm pt-lg">
      <View className="h-16 w-16 items-center justify-center rounded-card bg-primary-tint">
        <Icon name="system-update" size={32} color={colors.onPrimaryTint} />
      </View>
      <Text accessibilityRole="header" className="text-center font-bold text-headline-lg text-text-strong">
        Nova versão disponível
      </Text>
      <Text className="text-center font-regular text-body-md text-text-secondary">
        Preparamos melhorias para o Mellitus. Seus registros continuam guardados neste aparelho ao atualizar.
      </Text>
      <View
        accessible
        accessibilityLabel={`Versão instalada ${currentVersion}, nova versão ${newVersion}`}
        className="mt-xs flex-row items-center gap-sm rounded-full border border-control-border bg-control px-md py-xs">
        <Text className="font-semibold text-label-lg text-text-secondary" style={{ fontVariant: ['tabular-nums'] }}>
          {currentVersion}
        </Text>
        <Icon name="arrow-forward" size={16} color={colors.textMuted} />
        <Text className="font-bold text-label-lg text-primary" style={{ fontVariant: ['tabular-nums'] }}>
          {newVersion}
        </Text>
      </View>
      {publishedLabel && <Text className="font-regular text-body-sm text-text-muted">{publishedLabel}</Text>}
    </View>
  );
}
