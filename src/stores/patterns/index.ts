import { create } from 'zustand';

import { patternsRepository, type StoredPattern } from '@/database/repositories/patterns';
import type { ClinicalPattern } from '@/shared/types/pattern';

type PatternsState = {
  patterns: StoredPattern[];
  active: StoredPattern | null;
  load(): Promise<void>;
  /** Otimista: troca o ativo na hora e reverte se o banco falhar. */
  activate(id: string): Promise<void>;
  save(pattern: ClinicalPattern, opts: { activate: boolean }): Promise<StoredPattern>;
};

const withActive = (patterns: StoredPattern[], id: string): StoredPattern[] =>
  patterns.map((p) =>
    p.id === id ? { ...p, status: 'active' } : p.status === 'active' ? { ...p, status: 'inactive' } : p,
  );

export const usePatternsStore = create<PatternsState>()((set, get) => ({
  patterns: [],
  active: null,

  async load() {
    const patterns = await patternsRepository.list();
    set({ patterns, active: patterns.find((p) => p.status === 'active') ?? null });
  },

  async activate(id) {
    const previous = get();
    const patterns = withActive(previous.patterns, id);
    set({ patterns, active: patterns.find((p) => p.id === id) ?? previous.active });
    try {
      await patternsRepository.activate(id);
    } catch (error) {
      set({ patterns: previous.patterns, active: previous.active });
      throw error;
    }
  },

  async save(pattern, opts) {
    const saved = await patternsRepository.save(pattern, opts);
    await get().load();
    return saved;
  },
}));
