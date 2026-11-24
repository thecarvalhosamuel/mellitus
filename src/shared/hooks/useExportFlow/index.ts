import { useState } from 'react';

import { SharingUnavailableError, sharePdfReport } from '@/services/export/pdf';
import { shareReadingsSpreadsheet } from '@/services/export/xlsx';
import { toast } from '@/shared/hooks/useToast';
import { lightColors } from '@/shared/theme/colors';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatMonthYear } from '@/shared/utils/format';
import { buildReportHtml } from '@/shared/utils/report';
import { buildReadingRows } from '@/shared/utils/spreadsheet';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

// Geração e compartilhamento de laudo/planilha de qualquer período: usada pelo
// menu Exportar do Histórico e pelos lembretes de exportação.

export type MonthRef = { year: number; month: number };
export type SpreadsheetPeriod = { from: Date; to: Date; label: string; fileKey: string };

const pad = (n: number) => String(n).padStart(2, '0');
const monthBounds = ({ year, month }: MonthRef) => ({ from: new Date(year, month - 1, 1), to: new Date(year, month, 1) });

/** Laudo PDF do mês. `readings` evita reconsultar quando a tela já tem o mês carregado. */
export async function shareMonthlyReport(ref: MonthRef, readings?: GlucoseReading[]): Promise<'shared' | 'empty'> {
  const range = monthBounds(ref);
  const list = readings ?? (await useReadingsStore.getState().listRange(range.from.toISOString(), range.to.toISOString()));
  const pattern = usePatternsStore.getState().active;
  if (list.length === 0 || !pattern) return 'empty';
  const html = buildReportHtml({
    patientName: useSettingsStore.getState().settings.profile?.name,
    periodLabel: formatMonthYear(ref.year, ref.month),
    range,
    generatedAt: new Date(),
    pattern,
    readings: list,
    // Papel é sempre claro, mesmo com o app no tema escuro.
    colors: lightColors,
  });
  await sharePdfReport(html, `mellitus-laudo-${ref.year}-${pad(ref.month)}.pdf`);
  return 'shared';
}

/** Planilha XLSX das leituras de um período. */
export async function shareSpreadsheet(period: SpreadsheetPeriod, readings?: GlucoseReading[]): Promise<'shared' | 'empty'> {
  const list =
    readings ?? (await useReadingsStore.getState().listRange(period.from.toISOString(), period.to.toISOString()));
  if (list.length === 0) return 'empty';
  await shareReadingsSpreadsheet(buildReadingRows(list), `Leituras ${period.label}`, `mellitus-leituras-${period.fileKey}.xlsx`);
  return 'shared';
}

export const monthSpreadsheetPeriod = (ref: MonthRef): SpreadsheetPeriod => ({
  ...monthBounds(ref),
  label: formatMonthYear(ref.year, ref.month),
  fileKey: `${ref.year}-${pad(ref.month)}`,
});

type ExportMessages = { empty: string; failed: string };

/** Roda uma exportação com mensagens calmas para período vazio e erros. */
export async function runExport(task: () => Promise<'shared' | 'empty'>, messages: ExportMessages): Promise<void> {
  try {
    if ((await task()) === 'empty') toast.error(messages.empty);
  } catch (error) {
    toast.error(error instanceof SharingUnavailableError ? 'Este aparelho não permite compartilhar arquivos.' : messages.failed);
  }
}

/** Estado "gerando…" para botões, em volta de `runExport`. */
export function useExportFlow() {
  const [exporting, setExporting] = useState(false);
  const run = async (task: () => Promise<'shared' | 'empty'>, messages: ExportMessages) => {
    setExporting(true);
    try {
      await runExport(task, messages);
    } finally {
      setExporting(false);
    }
  };
  return { exporting, run };
}
