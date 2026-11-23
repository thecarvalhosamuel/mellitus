import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/backButton';
import { Badge } from '@/components/ui/badge';
import { InfoBanner } from '@/components/ui/infoBanner';

type NewPatternHeaderProps = { isEdit: boolean; onBack: () => void };

/** Voltar + "● MODO CUSTOM" + título e orientação (DESIGN.md §5.4). */
export function NewPatternHeader({ isEdit, onBack }: NewPatternHeaderProps) {
  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between gap-sm">
        <BackButton label="Voltar para Metas" onPress={onBack} />
        <Badge label="Modo custom" tone="primary" dot uppercase />
      </View>
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
          {isEdit ? 'Editar Padrão Personalizado' : 'Novo Padrão Personalizado'}
        </Text>
        <Text className="font-regular text-body-md text-text-secondary">
          Defina faixas sob medida em conjunto com seu médico ou nutricionista.
        </Text>
      </View>
      <InfoBanner
        icon="medical-services"
        title="Diretriz clínica segura"
        description="Tenha em mãos o plano terapêutico ou laudo. Os valores sugeridos são exemplos e não substituem a orientação médica."
      />
    </View>
  );
}
