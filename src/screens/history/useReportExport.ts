import { useState } from 'react';

import { SharingUnavailableError, sharePdfReport } from '@/services/export/pdf';
import { useToast } from '@/shared/hooks/useToast';
import { lightColors } from '@/shared/theme/colors';
import { formatMonthYear } from '@/shared/utils/format';
import { monthKeyToString } from '@/shared/utils/history';
import { buildReportHtml } from '@/shared/utils/report';
import { useHistoryStore } from '@/stores/history';
import { usePatternsStore } from '@/stores/patterns';
import { useSettingsStore } from '@/stores/settings';

/** Exportação do mês selecionado no histórico (DESIGN.md §5.2 e §13.7). */
export function useReportExport() {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    setMenuOpen(false);
    const { month, readings } = useHistoryStore.getState();
    const pattern = usePatternsStore.getState().active;
    if (readings.length === 0) {
      toast.error('Não há medições neste mês para o laudo.');
      return;
    }
    if (!pattern) return;

    setExporting(true);
    try {
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
    } catch (error) {
      toast.error(
        error instanceof SharingUnavailableError
          ? 'Este aparelho não permite compartilhar arquivos.'
          : 'Não foi possível gerar o laudo. Tente de novo.',
      );
    } finally {
      setExporting(false);
    }
  };

  return {
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    exporting,
    exportPdf,
  };
}
