import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type ClinicalReportFooterProps = { total: number; monthLabel: string };

/** Rodapé clínico (DESIGN.md §5.2), sem hash nem protocolo no MVP. */
export function ClinicalReportFooter({ total, monthLabel }: ClinicalReportFooterProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center gap-xs rounded-card border border-inset-border bg-inset p-md">
      <Icon name="verified" size={24} color={colors.primary} />
      <Text className="text-center font-bold text-label-lg text-text-strong">Relatório Clínico Pronto</Text>
      <Text className="text-center font-regular text-body-sm text-text-secondary">
        {total} {total === 1 ? 'medição' : 'medições'} em {monthLabel}, prontas para levar à consulta.
      </Text>
      <View className="flex-row items-center gap-xs">
        <Icon name="lock" size={14} color={colors.textMuted} />
        <Text className="font-regular text-body-sm text-text-muted">Dados armazenados apenas neste aparelho</Text>
      </View>
    </View>
  );
}
