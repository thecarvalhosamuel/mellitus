import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading } from '@/shared/types/reading';

import { RecentReadingCard } from './components/recentReadingCard';

type RecentReadingsSectionProps = {
  readings: GlucoseReading[];
  onSeeAll: () => void;
};

/** "Últimos Registros" + link para o histórico + cards (DESIGN.md §5.1). */
export function RecentReadingsSection({ readings, onSeeAll }: RecentReadingsSectionProps) {
  const { colors } = useTheme();

  return (
    <View className="gap-sm">
      <View className="flex-row items-center justify-between gap-sm">
        <View className="flex-row items-center gap-xs">
          <Icon name="history" size={20} color={colors.primary} />
          <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
            Últimos Registros
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          accessibilityRole="link"
          className="min-h-touch flex-row items-center justify-center">
          <Text className="font-semibold text-label-md text-primary">Ver histórico completo</Text>
          <Icon name="chevron-right" size={18} color={colors.primary} />
        </Pressable>
      </View>
      {readings.map((reading) => (
        <RecentReadingCard key={reading.id} reading={reading} />
      ))}
    </View>
  );
}
