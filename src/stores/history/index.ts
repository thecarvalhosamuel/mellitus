import { create } from 'zustand';

import { readingsRepository } from '@/database/repositories/readings';
import type { GlucoseReading } from '@/shared/types/reading';
import { monthKeyOf, type MonthKey } from '@/shared/utils/history';

type HistoryState = {
  month: MonthKey;
  /** Só as leituras do mês selecionado (DESIGN.md §13.2: nunca tudo em memória). */
  readings: GlucoseReading[];
  /** Meses com leituras, para o seletor. */
  months: { month: string; total: number }[];
  loaded: boolean;
  selectMonth(month: MonthKey): Promise<void>;
  /** Recarrega o mês atual e a lista de meses (após registrar, editar ou excluir). */
  reload(): Promise<void>;
};

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  month: monthKeyOf(new Date()),
  readings: [],
  months: [],
  loaded: false,

  async selectMonth(month) {
    set({ month });
    await get().reload();
  },

  async reload() {
    const { year, month } = get().month;
    const [readings, months] = await Promise.all([
      readingsRepository.listByMonth(year, month, { order: 'desc' }),
      readingsRepository.countByMonth(),
    ]);
    // Ignora a resposta se o usuário trocou de mês enquanto carregava.
    if (get().month.year === year && get().month.month === month) set({ readings, months, loaded: true });
  },
}));
