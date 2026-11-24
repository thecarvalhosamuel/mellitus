import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { GradientButton } from '@/components/ui/gradientButton';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatReadingCount } from '@/shared/utils/format';

type DataInfoCardProps = {
  totalInMonth: number;
  onExport: () => void;
  exporting: boolean;
};

/** Gestão de dados clínicos: salvo no aparelho, contagem e exportar (DESIGN.md §5.2). */
export function DataInfoCard({ totalInMonth, onExport, exporting }: DataInfoCardProps) {
  const { colors } = useTheme();

  return (
    <View className="gap-md rounded-card border border-inset-border bg-inset p-md">
      <View className="flex-row items-center gap-sm">
        <Icon name="smartphone" size={22} color={colors.primary} />
        <View className="flex-1">
          <Text className="font-semibold text-label-lg text-text-strong">Dados salvos neste aparelho</Text>
          <Text className="font-regular text-body-sm text-text-muted">Nada sai daqui sem você pedir.</Text>
        </View>
        <Badge label={formatReadingCount(totalInMonth)} tone="inRange" dot />
      </View>
      {/* Importar planilha entra na etapa 14. */}
      <GradientButton label="Exportar" icon="file-download" onPress={onExport} loading={exporting} loadingLabel="Gerando laudo…" />
    </View>
  );
}
