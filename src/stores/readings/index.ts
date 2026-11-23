import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { readingsRepository } from '@/database/repositories/readings';
import type { GlucoseReading } from '@/shared/types/reading';
import { toDateKey } from '@/shared/utils/date';
import { buildReading, type ReadingInput } from '@/shared/utils/reading';
import { usePatternsStore } from '@/stores/patterns';

/** Quantas leituras recentes o Início mantém em memória. */
export const RECENT_LIMIT = 5;

type ReadingsState = {
  /** Mais recentes primeiro. O histórico por mês é consultado sob demanda (etapa 8). */
  recent: GlucoseReading[];
  /** Leituras de hoje em ordem de horário (progresso do dia e sugestão de momento). */
  today: GlucoseReading[];
  load(): Promise<void>;
  /** Classifica com o padrão ativo, mostra na hora e grava; reverte se falhar. */
  add(input: ReadingInput): Promise<GlucoseReading>;
  /** Reclassifica com o padrão da própria leitura (ou o ativo, se ele não existir mais). */
  update(id: string, input: ReadingInput): Promise<GlucoseReading>;
  remove(id: string): Promise<void>;
};

const byNewest = (a: GlucoseReading, b: GlucoseReading) => Date.parse(b.timestamp) - Date.parse(a.timestamp);
const byOldest = (a: GlucoseReading, b: GlucoseReading) => -byNewest(a, b);
const keepRecent = (list: GlucoseReading[]) => [...list].sort(byNewest).slice(0, RECENT_LIMIT);
const isToday = (reading: GlucoseReading) => toDateKey(reading.timestamp) === toDateKey(new Date());

function requireActivePattern() {
  const active = usePatternsStore.getState().active;
  if (!active) throw new Error('Nenhum padrão clínico ativo.');
  return active;
}

export const useReadingsStore = create<ReadingsState>()((set, get) => ({
  recent: [],
  today: [],

  async load() {
    const [recent, today] = await Promise.all([
      readingsRepository.listRecent(RECENT_LIMIT),
      readingsRepository.listForDay(toDateKey(new Date())),
    ]);
    set({ recent, today });
  },

  async add(input) {
    const reading = buildReading(randomUUID(), input, requireActivePattern());
    const previous = { recent: get().recent, today: get().today };
    set({
      recent: keepRecent([reading, ...previous.recent]),
      today: isToday(reading) ? [...previous.today, reading].sort(byOldest) : previous.today,
    });
    try {
      await readingsRepository.create(reading);
      return reading;
    } catch (error) {
      set(previous);
      throw error;
    }
  },

  async update(id, input) {
    const current = await readingsRepository.getById(id);
    if (!current) throw new Error('Leitura não encontrada.');
    const { patterns } = usePatternsStore.getState();
    const pattern = patterns.find((p) => p.id === current.patternId) ?? requireActivePattern();
    const updated = buildReading(id, { ...input, source: current.source }, pattern);

    const previous = { recent: get().recent, today: get().today };
    set({
      recent: keepRecent([updated, ...previous.recent.filter((r) => r.id !== id)]),
      today: [...previous.today.filter((r) => r.id !== id), ...(isToday(updated) ? [updated] : [])].sort(byOldest),
    });
    try {
      await readingsRepository.update(updated);
      // Se a leitura editada saiu das recentes, recarrega a lista do banco.
      if (!previous.recent.some((r) => r.id === id)) await get().load();
      return updated;
    } catch (error) {
      set(previous);
      throw error;
    }
  },

  async remove(id) {
    const previous = { recent: get().recent, today: get().today };
    set({ recent: previous.recent.filter((r) => r.id !== id), today: previous.today.filter((r) => r.id !== id) });
    try {
      await readingsRepository.remove(id);
      await get().load();
    } catch (error) {
      set(previous);
      throw error;
    }
  },
}));
