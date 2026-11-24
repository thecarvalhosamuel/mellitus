import { Text, View } from 'react-native';

import { PatternCard } from '@/components/glucose/patternCard';
import { InfoBanner } from '@/components/ui/infoBanner';
import type { ClinicalPattern } from '@/shared/types/pattern';

type PatternStepProps = {
  patterns: (ClinicalPattern & { isBuiltin: boolean })[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

/** Escolha do padrão inicial: as metas que classificam cada leitura. */
export function PatternStep({ patterns, selectedId, onSelect }: PatternStepProps) {
  return (
    <View className="gap-md">
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
          Qual padrão de metas usar?
        </Text>
        <Text className="font-regular text-body-md text-text-secondary">
          Ele define as faixas de cada momento e os avisos de hipo e hiper. Dá para trocar ou criar um padrão seu em
          Metas.
        </Text>
      </View>
      <View accessibilityRole="radiogroup" className="gap-sm">
        {patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isActive={false}
            selected={pattern.id === selectedId}
            onSelect={() => onSelect(pattern.id)}
          />
        ))}
      </View>
      <InfoBanner
        icon="medical-services"
        title="Combine com seu médico"
        description="Os valores dos padrões são exemplos e não substituem a orientação da sua equipe de saúde."
      />
    </View>
  );
}
