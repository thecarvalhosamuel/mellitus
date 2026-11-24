import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { Card } from '@/components/ui/card';
import { StepHeader } from '@/components/ui/stepHeader';
import { ToggleRow } from '@/components/ui/toggleRow';
import type { ExportReminders } from '@/shared/types/settings';
import { describeWeekly } from '@/shared/utils/exportReminders';

type ExportSectionProps = {
  value: ExportReminders;
  onChange: (value: ExportReminders) => void;
  /** Integrações de saúde ("Em breve") ficam no mesmo passo. */
  children?: ReactNode;
};

/** Passo 3 — Relatórios clínicos como lembretes de exportação (DESIGN.md §5.5). */
export function ExportSection({ value, onChange, children }: ExportSectionProps) {
  return (
    <Card>
      <StepHeader step={3} title="Relatórios e Exportação" />
      <Text className="font-regular text-body-sm text-text-secondary">
        Um lembrete abre o app, gera o arquivo aqui no aparelho e você escolhe com quem compartilhar.
      </Text>
      <ToggleRow
        icon="table-view"
        title="Planilha semanal"
        description={`Leituras dos últimos 7 dias, ${describeWeekly(value.weeklyXlsx)}.`}
        value={value.weeklyXlsx.enabled}
        onValueChange={(enabled) => onChange({ ...value, weeklyXlsx: { ...value.weeklyXlsx, enabled } })}
      />
      <ToggleRow
        icon="picture-as-pdf"
        title="Laudo mensal (PDF)"
        description="Laudo do mês anterior, todo dia 1º às 08:00."
        value={value.monthlyPdf.enabled}
        onValueChange={(enabled) => onChange({ ...value, monthlyPdf: { enabled } })}
      />
      {children}
    </Card>
  );
}
