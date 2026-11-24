import { ActivityIndicator, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SubBlock } from '@/components/ui/subBlock';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ImportIssue } from '@/shared/utils/importSheet';

type ImportSummaryCardProps = {
  checking: boolean;
  toImport: number;
  duplicates: number;
  issues: ImportIssue[];
};

const ISSUES_SHOWN = 5;

/** Quantas linhas viram leitura, quantas já existem e quais têm problema. */
export function ImportSummaryCard({ checking, toImport, duplicates, issues }: ImportSummaryCardProps) {
  const { colors } = useTheme();
  const metrics = [
    { label: 'Prontas para importar', value: toImport },
    { label: 'Já no aparelho ou repetidas', value: duplicates },
    { label: 'Com problema', value: issues.length },
  ];

  return (
    <Card>
      <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
        Resumo
      </Text>
      {checking ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Conferindo leituras" />
      ) : (
        <View className="flex-row gap-sm">
          {metrics.map((m) => (
            <SubBlock key={m.label} className="flex-1">
              <Text className="font-bold text-headline-md text-text-strong tabular-nums">
                {m.value}
              </Text>
              <Text className="font-regular text-body-sm text-text-secondary">{m.label}</Text>
            </SubBlock>
          ))}
        </View>
      )}
      {issues.length > 0 && (
        <View className="gap-xs">
          <Text className="font-semibold text-label-md text-text-secondary">Linhas que não serão importadas</Text>
          {issues.slice(0, ISSUES_SHOWN).map((issue) => (
            <Text key={issue.row} className="font-regular text-body-sm text-text">
              Linha {issue.row} · {issue.reason}
            </Text>
          ))}
          {issues.length > ISSUES_SHOWN && (
            <Text className="font-regular text-body-sm text-text-muted">e mais {issues.length - ISSUES_SHOWN}.</Text>
          )}
        </View>
      )}
    </Card>
  );
}
