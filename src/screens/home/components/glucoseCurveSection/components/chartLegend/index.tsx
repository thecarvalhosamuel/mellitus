import { Text, View } from 'react-native';

type ChartLegendProps = { targetLabel: string };

/** ● Dia A · ○ Dia B · ▬ Alvo (80–130). */
export function ChartLegend({ targetLabel }: ChartLegendProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-md" importantForAccessibility="no-hide-descendants">
      <View className="flex-row items-center gap-xs">
        <View className="h-2.5 w-2.5 rounded-full bg-primary" />
        <Text className="font-medium text-label-sm text-text-muted">Dia A</Text>
      </View>
      <View className="flex-row items-center gap-xs">
        <View className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />
        <Text className="font-medium text-label-sm text-text-muted">Dia B</Text>
      </View>
      {targetLabel !== '' && (
        <View className="flex-row items-center gap-xs">
          <View className="h-2 w-4 rounded-sm border border-status-in-range-border bg-status-in-range-bg" />
          <Text className="font-medium text-label-sm text-text-muted">Alvo ({targetLabel})</Text>
        </View>
      )}
    </View>
  );
}
