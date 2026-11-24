import { Text, View } from 'react-native';

import { cn } from '@/shared/utils/cn';

type OnboardingProgressProps = { step: number; total: number };

/** "Passo 1 de 3" + barras de progresso. */
export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <View
      className="gap-sm"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Passo ${step + 1} de ${total}`}
      accessibilityValue={{ min: 1, max: total, now: step + 1 }}>
      <Text className="font-semibold text-label-md text-text-secondary">
        Passo {step + 1} de {total}
      </Text>
      <View className="flex-row gap-xs">
        {Array.from({ length: total }, (_, i) => (
          <View key={i} className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-primary' : 'bg-track')} />
        ))}
      </View>
    </View>
  );
}
