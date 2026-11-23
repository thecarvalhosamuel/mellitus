import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';

type StepHeaderProps = { step: number; title: string; badge?: string };

/** Círculo numerado ①②③ + título + badge opcional (DESIGN.md §4.2). */
export function StepHeader({ step, title, badge }: StepHeaderProps) {
  return (
    <View className="flex-row items-center gap-sm" accessibilityRole="header" accessible accessibilityLabel={`Passo ${step}: ${title}`}>
      <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
        <Text className="font-bold text-label-sm text-on-primary">{step}</Text>
      </View>
      <Text className="flex-1 font-bold text-headline-sm text-text-strong">{title}</Text>
      {badge && <Badge label={badge} tone="primary" />}
    </View>
  );
}
