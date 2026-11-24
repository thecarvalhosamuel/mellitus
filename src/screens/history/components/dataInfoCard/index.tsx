import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatReadingCount } from '@/shared/utils/format';

type DataInfoCardProps = {
  totalInMonth: number;
  onExport: () => void;
  exporting: boolean;
  onImport: () => void;
  importing: boolean;
};

/** Gestão de dados clínicos: salvo no aparelho, contagem, exportar e importar (DESIGN.md §5.2). */
export function DataInfoCard({ totalInMonth, onExport, exporting, onImport, importing }: DataInfoCardProps) {
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
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <GradientButton label="Exportar" icon="file-download" onPress={onExport} loading={exporting} loadingLabel="Gerando…" />
        </View>
        <View className="flex-1">
          <Button
            label="Importar"
            icon="file-upload"
            variant="secondary"
            fullWidth
            onPress={onImport}
            loading={importing}
            loadingLabel="Abrindo…"
            accessibilityHint="Escolher uma planilha .xlsx ou .csv"
          />
        </View>
      </View>
    </View>
  );
}
