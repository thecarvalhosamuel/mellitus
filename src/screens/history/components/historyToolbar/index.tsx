import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import type { SortOrder } from '@/shared/utils/history';

type HistoryToolbarProps = {
  monthLabel: string;
  onPressMonth: () => void;
  order: SortOrder;
  onToggleOrder: () => void;
};

/** "📅 Outubro 2024 ▾" e "↓ Mais Recente" ⇄ "↑ Mais Antigo" (DESIGN.md §5.2). */
export function HistoryToolbar({ monthLabel, onPressMonth, order, onToggleOrder }: HistoryToolbarProps) {
  const { colors } = useTheme();
  const orderLabel = order === 'desc' ? 'Mais Recente' : 'Mais Antigo';

  return (
    <View className="flex-row items-center justify-between gap-sm">
      <Pressable
        onPress={onPressMonth}
        accessibilityRole="button"
        accessibilityLabel={`Mês: ${monthLabel}. Trocar mês`}
        className="min-h-touch flex-row items-center gap-xs rounded-cta border border-control-border bg-control px-3 active:bg-control-pressed">
        <Icon name="calendar-month" size={18} color={colors.primary} />
        <Text className="font-semibold text-label-lg text-text-strong">{monthLabel}</Text>
        <Icon name="arrow-drop-down" size={20} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        onPress={onToggleOrder}
        accessibilityRole="button"
        accessibilityLabel={`Ordenação: ${orderLabel}. Inverter`}
        className="min-h-touch flex-row items-center gap-xs rounded-cta px-sm active:bg-control">
        <Icon name={order === 'desc' ? 'arrow-downward' : 'arrow-upward'} size={18} color={colors.primary} />
        <Text className="font-semibold text-label-md text-primary">{orderLabel}</Text>
      </Pressable>
    </View>
  );
}
