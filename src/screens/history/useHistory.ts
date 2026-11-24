import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { CONTEXT_FILTERS, type ContextFilter } from '@/shared/constants/readingContexts';
import { useToast } from '@/shared/hooks/useToast';
import { formatMonthYear } from '@/shared/utils/format';
import {
  buildMonthOptions,
  countByFilter,
  groupByDay,
  matchesFilter,
  parseMonthKey,
  type SortOrder,
} from '@/shared/utils/history';
import { useHistoryStore } from '@/stores/history';

/** Mês, filtro e ordenação do histórico (DESIGN.md §5.2). */
export function useHistory() {
  const toast = useToast();
  const { month, readings, months, loaded } = useHistoryStore();
  const [filter, setFilter] = useState<ContextFilter>('all');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  // Recarrega ao voltar para a aba (registros feitos em outras telas).
  useFocusEffect(
    useCallback(() => {
      useHistoryStore
        .getState()
        .reload()
        .catch(() => toast.error('Não foi possível carregar o histórico.'));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const counts = useMemo(() => countByFilter(readings), [readings]);
  const filtered = useMemo(() => readings.filter((r) => matchesFilter(r, filter)), [readings, filter]);
  const groups = useMemo(() => groupByDay(filtered, order), [filtered, order]);

  const filterOptions = CONTEXT_FILTERS.map((f) => ({
    value: f.value,
    label: counts[f.value] > 0 || f.value === 'all' ? `${f.label} (${counts[f.value]})` : f.label,
  }));

  const monthOptions = buildMonthOptions(months).map((option) => {
    const { year, month: m } = parseMonthKey(option.key);
    return { ...option, label: formatMonthYear(year, m) };
  });

  const selectMonth = (key: string) => {
    setMonthPickerOpen(false);
    useHistoryStore
      .getState()
      .selectMonth(parseMonthKey(key))
      .catch(() => toast.error('Não foi possível carregar esse mês.'));
  };

  return {
    loaded,
    /** Nenhuma leitura em mês nenhum (primeiro uso). */
    hasAnyReading: months.length > 0,
    monthLabel: formatMonthYear(month.year, month.month),
    monthKey: `${month.year}-${String(month.month).padStart(2, '0')}`,
    monthOptions,
    monthPickerOpen,
    openMonthPicker: () => setMonthPickerOpen(true),
    closeMonthPicker: () => setMonthPickerOpen(false),
    selectMonth,
    order,
    toggleOrder: () => setOrder((o) => (o === 'desc' ? 'asc' : 'desc')),
    filter,
    setFilter,
    filterOptions,
    resetFilter: () => setFilter('all'),
    totalInMonth: readings.length,
    filteredCount: filtered.length,
    groups,
    editReading: (id: string) => router.push({ pathname: '/newReading', params: { id } }),
  };
}
