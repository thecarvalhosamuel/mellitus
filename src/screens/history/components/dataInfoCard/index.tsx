import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatReadingCount } from '@/shared/utils/format';

type DataInfoCardProps = { totalInMonth: number };

// Exportar e importar (PDF, XLSX, CSV) entram nas etapas 12–14.
export function DataInfoCard({ totalInMonth }: DataInfoCardProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-sm rounded-card border border-inset-border bg-inset p-md">
      <Icon name="smartphone" size={22} color={colors.primary} />
      <View className="flex-1">
        <Text className="font-semibold text-label-lg text-text-strong">Dados salvos neste aparelho</Text>
        <Text className="font-regular text-body-sm text-text-muted">Nada sai daqui sem você pedir.</Text>
      </View>
      <Badge label={formatReadingCount(totalInMonth)} tone="inRange" dot />
    </View>
  );
}
