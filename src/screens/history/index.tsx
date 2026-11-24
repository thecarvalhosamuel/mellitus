import { ActivityIndicator } from 'react-native';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { FilterChips } from '@/components/ui/filterChips';
import { useTheme } from '@/shared/hooks/useTheme';

import { ClinicalReportFooter } from './components/clinicalReportFooter';
import { DataInfoCard } from './components/dataInfoCard';
import { ExportMenuSheet } from './components/exportMenuSheet';
import { HistoryToolbar } from './components/historyToolbar';
import { MonthPickerSheet } from './components/monthPickerSheet';
import { ReadingDayGroup } from './components/readingDayGroup';
import { useHistory } from './useHistory';
import { useReportExport } from './useReportExport';

export function HistoryScreen() {
  const history = useHistory();
  const report = useReportExport();
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <DataInfoCard totalInMonth={history.totalInMonth} onExport={report.openMenu} exporting={report.exporting} />
      <HistoryToolbar
        monthLabel={history.monthLabel}
        onPressMonth={history.openMonthPicker}
        order={history.order}
        onToggleOrder={history.toggleOrder}
      />
      <FilterChips
        accessibilityLabel="Filtrar por momento"
        options={history.filterOptions}
        value={history.filter}
        onChange={history.setFilter}
      />

      {!history.loaded ? (
        <ActivityIndicator color={colors.primary} className="py-xl" />
      ) : history.groups.length === 0 ? (
        <EmptyState
          icon="content-paste-off"
          title="Nenhum registro encontrado"
          description="Não há medições correspondentes aos filtros selecionados neste mês."
          action={
            history.filter !== 'all' ? (
              <Button label="Ver todos os registros" variant="secondary" fullWidth onPress={history.resetFilter} />
            ) : undefined
          }
        />
      ) : (
        <>
          {history.groups.map((group) => (
            <ReadingDayGroup
              key={group.dateKey}
              dateKey={group.dateKey}
              readings={group.readings}
              onPressReading={history.editReading}
            />
          ))}
          <ClinicalReportFooter total={history.totalInMonth} monthLabel={history.monthLabel} />
        </>
      )}

      <ExportMenuSheet
        visible={report.menuOpen}
        monthLabel={history.monthLabel}
        onClose={report.closeMenu}
        onExportPdf={report.exportPdf}
      />
      <MonthPickerSheet
        visible={history.monthPickerOpen}
        options={history.monthOptions}
        selectedKey={history.monthKey}
        onSelect={history.selectMonth}
        onClose={history.closeMonthPicker}
      />
    </ScreenContainer>
  );
}
