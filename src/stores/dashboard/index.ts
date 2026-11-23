import { create } from 'zustand';

import { readingsRepository } from '@/database/repositories/readings';
import type { GlucoseReading } from '@/shared/types/reading';
import { getPeriodRange, type ChartPeriod } from '@/shared/utils/period';
import { computeStats, type PeriodStats } from '@/shared/utils/stats';

type DashboardState = {
  period: ChartPeriod;
  /** Leituras do período do gráfico, em ordem de horário. */
  periodReadings: GlucoseReading[];
  periodStats: PeriodStats;
  /** Média e % no alvo do mês atual (card da última leitura). */
  monthStats: PeriodStats;
  loaded: boolean;
  setPeriod(period: ChartPeriod): Promise<void>;
  reload(): Promise<void>;
};

const empty = computeStats([]);

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  period: 'current-month',
  periodReadings: [],
  periodStats: empty,
  monthStats: empty,
  loaded: false,

  async setPeriod(period) {
    set({ period });
    await get().reload();
  },

  async reload() {
    const period = get().period;
    const now = new Date();
    const range = getPeriodRange(period, now);
    const month = getPeriodRange('current-month', now);
    const [periodReadings, monthStats] = await Promise.all([
      readingsRepository.listRange(range.from.toISOString(), range.to.toISOString()),
      readingsRepository.statsForRange(month.from.toISOString(), month.to.toISOString()),
    ]);
    if (get().period !== period) return; // trocou de período enquanto carregava
    set({ periodReadings, periodStats: computeStats(periodReadings), monthStats, loaded: true });
  },
}));
