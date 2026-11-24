import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { readingsRepository } from '@/database/repositories/readings';
import type { GlucoseReading } from '@/shared/types/reading';
import { toDateKey } from '@/shared/utils/date';
import { buildReading, type ReadingInput } from '@/shared/utils/reading';
import { useDashboardStore } from '@/stores/dashboard';
import { useHistoryStore } from '@/stores/history';
import { usePatternsStore } from '@/stores/patterns';

/** Quantas leituras recentes o Início mantém em memória. */
export const RECENT_LIMIT = 5;

type ReadingsState = {
  /** Mais recentes primeiro. O histórico por mês é consultado sob demanda (etapa 8). */
  recent: GlucoseReading[];
  /** Leituras de hoje em ordem de horário (progresso do dia e sugestão de momento). */
  today: GlucoseReading[];
  load(): Promise<void>;
  /** Busca uma leitura para edição (pode não estar entre as recentes). */
  getById(id: string): Promise<GlucoseReading | null>;
  /** Leituras de um intervalo [from, to) ISO, sob demanda (ex.: simulação de TIR). */
  listRange(from: string, to: string): Promise<GlucoseReading[]>;
  /** Classifica com o padrão ativo, mostra na hora e grava; reverte se falhar. */
  add(input: ReadingInput): Promise<GlucoseReading>;
  /** Reclassifica com o padrão da própria leitura (ou o ativo, se ele não existir mais). */
  update(id: string, input: ReadingInput): Promise<GlucoseReading>;
  remove(id: string): Promise<void>;
  /** Chaves (minuto UTC + valor) que já existem no banco entre as leituras informadas. */
  findExistingKeys(items: { timestamp: string; value: number }[]): Promise<Set<string>>;
  /** Importação: classifica com o padrão ativo e grava em lote, sem duplicar. Retorna quantas entraram. */
  importMany(inputs: ReadingInput[]): Promise<number>;
};

const byNewest = (a: GlucoseReading, b: GlucoseReading) => Date.parse(b.timestamp) - Date.parse(a.timestamp);
const byOldest = (a: GlucoseReading, b: GlucoseReading) => -byNewest(a, b);
const keepRecent = (list: GlucoseReading[]) => [...list].sort(byNewest).slice(0, RECENT_LIMIT);
const isToday = (reading: GlucoseReading) => toDateKey(reading.timestamp) === toDateKey(new Date());

/** Mantém histórico e painel em sincronia depois de uma gravação (só os já carregados). */
function refreshViews() {
  const history = useHistoryStore.getState();
  if (history.loaded) void history.reload().catch(() => undefined);
  const dashboard = useDashboardStore.getState();
  if (dashboard.loaded) void dashboard.reload().catch(() => undefined);
}

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

  getById(id) {
    return readingsRepository.getById(id);
  },

  listRange(from, to) {
    return readingsRepository.listRange(from, to);
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
      refreshViews();
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
      refreshViews();
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
      refreshViews();
      await get().load();
    } catch (error) {
      set(previous);
      throw error;
    }
  },

  async findExistingKeys(items) {
    if (items.length === 0) return new Set();
    const times = items.map((i) => Date.parse(i.timestamp));
    const from = new Date(Math.min(...times)).toISOString();
    const to = new Date(Math.max(...times) + 60_000).toISOString();
    const rows = await readingsRepository.listMinuteKeys(from, to);
    return new Set(rows.map((r) => `${r.minute}|${r.value}`));
  },

  async importMany(inputs) {
    const pattern = requireActivePattern();
    const readings = inputs.map((input) => buildReading(randomUUID(), { ...input, source: 'import' }, pattern));
    const inserted = await readingsRepository.createMany(readings);
    if (inserted > 0) {
      refreshViews();
      await get().load();
    }
    return inserted;
  },
}));
