import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

/** "● PARÂMETROS CLÍNICOS" + "Padrões de Acompanhamento" (DESIGN.md §5.3). */
export function GoalsHeader() {
  const { colors } = useTheme();

  return (
    <Card>
      <View className="flex-row items-start gap-md">
        <View className="flex-1 gap-sm">
          <Badge label="Parâmetros clínicos" tone="primary" dot uppercase />
          <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
            Padrões de Acompanhamento
          </Text>
          <Text className="font-regular text-body-md text-text-secondary">
            Escolha as metas que orientam a classificação das leituras, os gráficos e os relatórios.
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-cta bg-primary-tint">
          <Icon name="tune" size={24} color={colors.onPrimaryTint} />
        </View>
      </View>
    </Card>
  );
}
