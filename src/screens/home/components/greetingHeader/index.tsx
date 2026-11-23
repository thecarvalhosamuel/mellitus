import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { formatLongDate } from '@/shared/utils/format';

type GreetingHeaderProps = {
  name?: string;
  patternName?: string;
  today?: Date;
};

/** "Olá, Carlos" + data por extenso + pill do padrão ativo (DESIGN.md §5.1). */
export function GreetingHeader({ name, patternName, today = new Date() }: GreetingHeaderProps) {
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <View className="gap-xs">
      <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
        {firstName ? `Olá, ${firstName}` : 'Olá!'}
      </Text>
      <Text className="font-regular text-body-sm text-text-secondary">{formatLongDate(today)}</Text>
      {patternName && (
        <View className="mt-xs">
          <Badge label={patternName} tone="primary" icon="tune" />
        </View>
      )}
    </View>
  );
}
