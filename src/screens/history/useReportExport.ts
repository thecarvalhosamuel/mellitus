import { useState } from 'react';

import { SharingUnavailableError, sharePdfReport } from '@/services/export/pdf';
import { shareReadingsSpreadsheet } from '@/services/export/xlsx';
import { useToast } from '@/shared/hooks/useToast';
import { lightColors } from '@/shared/theme/colors';
import { formatMonthYear } from '@/shared/utils/format';
import { monthKeyToString } from '@/shared/utils/history';
import { buildReportHtml } from '@/shared/utils/report';
import { buildReadingRows } from '@/shared/utils/spreadsheet';
import { useHistoryStore } from '@/stores/history';
import { usePatternsStore } from '@/stores/patterns';
import { useSettingsStore } from '@/stores/settings';

/** Exportação do mês selecionado no histórico (DESIGN.md §5.2 e §13.7). */
export function useReportExport() {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  /** Fecha o menu, valida o mês e trata erros de compartilhamento. */
  const run = async (emptyMessage: string, failMessage: string, task: () => Promise<void>) => {
    setMenuOpen(false);
    if (useHistoryStore.getState().readings.length === 0) {
      toast.error(emptyMessage);
      return;
    }
    setExporting(true);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof SharingUnavailableError ? 'Este aparelho não permite compartilhar arquivos.' : failMessage);
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = () =>
    run('Não há medições neste mês para o laudo.', 'Não foi possível gerar o laudo. Tente de novo.', async () => {
      const { month, readings } = useHistoryStore.getState();
      const pattern = usePatternsStore.getState().active;
      if (!pattern) return;
      const html = buildReportHtml({
        patientName: useSettingsStore.getState().settings.profile?.name,
        periodLabel: formatMonthYear(month.year, month.month),
        range: { from: new Date(month.year, month.month - 1, 1), to: new Date(month.year, month.month, 1) },
        generatedAt: new Date(),
        pattern,
        readings,
        // Papel é sempre claro, mesmo com o app no tema escuro.
        colors: lightColors,
      });
      await sharePdfReport(html, `mellitus-laudo-${monthKeyToString(month)}.pdf`);
    });

  const exportXlsx = () =>
    run('Não há medições neste mês para a planilha.', 'Não foi possível gerar a planilha. Tente de novo.', async () => {
      const { month, readings } = useHistoryStore.getState();
      await shareReadingsSpreadsheet(
        buildReadingRows(readings),
        `Leituras ${formatMonthYear(month.year, month.month)}`,
        `mellitus-leituras-${monthKeyToString(month)}.xlsx`,
      );
    });

  return {
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    exporting,
    exportPdf,
    exportXlsx,
  };
}
