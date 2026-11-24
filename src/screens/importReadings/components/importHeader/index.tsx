import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/backButton';
import { InfoBanner } from '@/components/ui/infoBanner';

type ImportHeaderProps = { fileName?: string; totalRows: number; patternName: string; onBack: () => void };

/** Voltar + título, arquivo escolhido e como as leituras serão classificadas. */
export function ImportHeader({ fileName, totalRows, patternName, onBack }: ImportHeaderProps) {
  return (
    <View className="gap-md">
      <View className="flex-row">
        <BackButton label="Voltar para Histórico" onPress={onBack} />
      </View>
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
          Importar planilha
        </Text>
        {fileName && (
          <Text className="font-regular text-body-md text-text-secondary" numberOfLines={2}>
            {fileName} · {totalRows === 1 ? '1 linha' : `${totalRows} linhas`} com dados
          </Text>
        )}
      </View>
      <InfoBanner
        icon="fact-check"
        title="Confira antes de gravar"
        description={`As leituras entram com as metas do padrão ativo${patternName ? ` (${patternName})` : ''}. Leituras que já estão no aparelho são ignoradas.`}
      />
    </View>
  );
}
