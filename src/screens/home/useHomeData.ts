import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { FREQUENCY_LABELS } from '@/shared/constants/frequency';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { useToast } from '@/shared/hooks/useToast';
import { getDayMoments, getDayProgress, getScheduleCycleDay } from '@/shared/utils/cycle';
import { addDays, toDateKey } from '@/shared/utils/date';
import { getTargetForContext } from '@/shared/utils/glucose';
import { CHART_PERIODS, getPeriodLabel, getPeriodRange, type ChartPeriod } from '@/shared/utils/period';
import { useDashboardStore } from '@/stores/dashboard';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

/** Quantos registros o Início lista abaixo da última leitura. */
const RECENT_ON_HOME = 3;

export function useHomeData() {
  const toast = useToast();
  const recent = useReadingsStore((s) => s.recent);
  const today = useReadingsStore((s) => s.today);
  const profileName = useSettingsStore((s) => s.settings.profile?.name);
  const frequency = useSettingsStore((s) => s.settings.frequency);
  const patterns = usePatternsStore((s) => s.patterns);
  const active = usePatternsStore((s) => s.active);
  const { period, periodReadings, periodStats, monthStats } = useDashboardStore();

  useFocusEffect(
    useCallback(() => {
      useDashboardStore
        .getState()
        .reload()
        .catch(() => toast.error('Não foi possível atualizar o painel.'));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Estável entre renders para o gráfico não recalcular as escalas à toa.
  const range = useMemo(() => getPeriodRange(period), [period]);

  const lastReading = recent[0] ?? null;
  // Alertas do padrão em que a última leitura foi feita (ou o ativo).
  const lastPattern = (lastReading && patterns.find((p) => p.id === lastReading.patternId)) || active;

  const cycle = useMemo(() => {
    if (!frequency) return null;
    const todayKey = toDateKey(new Date());
    const tomorrowKey = addDays(todayKey, 1);
    const progress = getDayProgress(getDayMoments(frequency, todayKey), today.map((r) => r.context));
    const day = getScheduleCycleDay(frequency, todayKey);
    const plan = day === 'A' ? frequency.dayA : day === 'B' ? frequency.dayB : undefined;
    const tomorrowDay = getScheduleCycleDay(frequency, tomorrowKey);
    const tomorrowMoments = getDayMoments(frequency, tomorrowKey);
    return {
      title: FREQUENCY_LABELS[frequency.mode],
      todayTag: day ? `Hoje: ${plan?.label ?? `Dia ${day}`} - ${progress.total}x` : undefined,
      moments: progress.moments.map((m) => ({ label: READING_CONTEXTS[m.context].label, time: m.time, done: m.done })),
      done: progress.done,
      total: progress.total,
      tomorrow:
        tomorrowMoments.length === 0
          ? 'Amanhã: dia de descanso'
          : `Amanhã: ${tomorrowDay ? `Dia ${tomorrowDay} · ` : ''}${tomorrowMoments.map((m) => READING_CONTEXTS[m.context].label).join(', ')}`,
    };
  }, [frequency, today]);

  return {
    profileName,
    patternName: active?.name,
    lastReading,
    lastAlerts: lastPattern?.alerts,
    monthStats,
    recentReadings: recent.slice(0, RECENT_ON_HOME),
    cycle,
    curve: {
      period,
      periodOptions: CHART_PERIODS.map((p) => ({ value: p, label: getPeriodLabel(p) })),
      setPeriod: (p: ChartPeriod) =>
        useDashboardStore
          .getState()
          .setPeriod(p)
          .catch(() => toast.error('Não foi possível carregar esse período.')),
      range,
      readings: periodReadings,
      stats: periodStats,
      target: active ? getTargetForContext(active, 'fasting') : {},
    },
  };
}
