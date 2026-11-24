import { useState } from 'react';

import { monthSpreadsheetPeriod, shareMonthlyReport, shareSpreadsheet, useExportFlow } from '@/shared/hooks/useExportFlow';
import { useHistoryStore } from '@/stores/history';

/** Exportação do mês selecionado no histórico (DESIGN.md §5.2 e §13.7). */
export function useReportExport() {
  const flow = useExportFlow();
  const [menuOpen, setMenuOpen] = useState(false);

  const exportPdf = () => {
    setMenuOpen(false);
    const { month, readings } = useHistoryStore.getState();
    return flow.run(() => shareMonthlyReport(month, readings), {
      empty: 'Não há medições neste mês para o laudo.',
      failed: 'Não foi possível gerar o laudo. Tente de novo.',
    });
  };

  const exportXlsx = () => {
    setMenuOpen(false);
    const { month, readings } = useHistoryStore.getState();
    return flow.run(() => shareSpreadsheet(monthSpreadsheetPeriod(month), readings), {
      empty: 'Não há medições neste mês para a planilha.',
      failed: 'Não foi possível gerar a planilha. Tente de novo.',
    });
  };

  return {
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    exporting: flow.exporting,
    exportPdf,
    exportXlsx,
  };
}
