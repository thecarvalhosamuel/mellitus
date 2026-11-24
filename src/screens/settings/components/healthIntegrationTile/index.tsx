import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

/** Apple Health / Health Connect ficam para depois do MVP: só o aviso "Em breve". */
export function HealthIntegrationTile() {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel="Integração com Apple Health e Health Connect: em breve"
      className="flex-row items-center gap-sm rounded-card border border-card-border bg-card p-md opacity-70">
      <Icon name="favorite-border" size={22} color={colors.textMuted} />
      <View className="flex-1">
        <Text className="font-semibold text-label-lg text-text-strong">Apple Health / Health Connect</Text>
        <Text className="font-regular text-body-sm text-text-muted">Integrações de saúde</Text>
      </View>
      <Badge label="Em breve" />
    </View>
  );
}
