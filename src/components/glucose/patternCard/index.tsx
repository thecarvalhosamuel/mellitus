import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { SelectableCard } from '@/components/ui/selectableCard';
import { describePattern } from '@/shared/constants/patternConditions';
import type { ClinicalPattern } from '@/shared/types/pattern';
import { formatTargetRange } from '@/shared/utils/format';

type PatternCardProps = {
  pattern: ClinicalPattern & { isBuiltin: boolean };
  isActive: boolean;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
};

/** Radio card de padrão com alvos por momento e alertas (DESIGN.md §5.3). */
export function PatternCard({ pattern, isActive, selected, onSelect, onEdit }: PatternCardProps) {
  const rows = [
    ['Jejum / pré-refeição', formatTargetRange(pattern.fasting)],
    [`${pattern.postprandial.windowHours}h pós-refeição`, formatTargetRange(pattern.postprandial)],
    ['Ao deitar', formatTargetRange(pattern.bedtime) || 'igual ao jejum'],
    ['Alertas', `hipo < ${pattern.alerts.hypo} · hiper > ${pattern.alerts.hyper}`],
  ];

  return (
    <SelectableCard selected={selected} onPress={onSelect} accessibilityLabel={`${pattern.name}${isActive ? ', ativo' : ''}`}>
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 gap-xs">
          <Text className="font-bold text-label-lg text-text-strong">{pattern.name}</Text>
          <Text className="font-regular text-body-sm text-text-secondary">{describePattern(pattern)}</Text>
        </View>
        {isActive ? (
          <Badge label="Ativo" tone="inRange" dot />
        ) : (
          pattern.status === 'draft' && <Badge label="Rascunho" />
        )}
      </View>
      <View className="gap-xs rounded border border-inset-border bg-inset p-3">
        {rows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between gap-sm">
            <Text className="font-medium text-body-sm text-text-secondary">{label}</Text>
            <Text className="font-semibold text-body-sm text-text-strong tabular-nums">{value}</Text>
          </View>
        ))}
      </View>
      {pattern.kind === 'gestational' && (
        <Text className="font-regular text-body-sm text-text-muted">Contagem pós-refeição a partir da primeira garfada.</Text>
      )}
      {onEdit && (
        <Pressable onPress={onEdit} accessibilityRole="button" className="min-h-touch justify-center self-start">
          <Text className="font-semibold text-label-md text-primary">Editar padrão</Text>
        </Pressable>
      )}
    </SelectableCard>
  );
}
