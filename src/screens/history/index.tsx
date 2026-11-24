import { ActivityIndicator } from 'react-native';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { FilterChips } from '@/components/ui/filterChips';
import { useTheme } from '@/shared/hooks/useTheme';

import { ClinicalReportFooter } from './components/clinicalReportFooter';
import { DataInfoCard } from './components/dataInfoCard';
import { ExportMenuSheet } from './components/exportMenuSheet';
import { HistoryEmptyState } from './components/historyEmptyState';
import { HistoryToolbar } from './components/historyToolbar';
import { ImportMenuSheet } from './components/importMenuSheet';
import { MonthPickerSheet } from './components/monthPickerSheet';
import { ReadingDayGroup } from './components/readingDayGroup';
import { useHistory } from './useHistory';
import { useImportPicker } from './useImportPicker';
import { useReportExport } from './useReportExport';

export function HistoryScreen() {
  const history = useHistory();
  const report = useReportExport();
  const importer = useImportPicker();
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <DataInfoCard
        totalInMonth={history.totalInMonth}
        onExport={report.openMenu}
        exporting={report.exporting}
        onImport={importer.openMenu}
        importing={importer.picking}
      />
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
        <HistoryEmptyState
          filtered={history.filter !== 'all'}
          firstUse={!history.hasAnyReading}
          onResetFilter={history.resetFilter}
          onImport={importer.openMenu}
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
        onExportXlsx={report.exportXlsx}
      />
      <ImportMenuSheet
        visible={importer.menuOpen}
        onClose={importer.closeMenu}
        onPickFile={importer.pick}
        onDownloadTemplate={importer.downloadTemplate}
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
