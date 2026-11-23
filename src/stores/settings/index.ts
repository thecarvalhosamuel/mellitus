import { create } from 'zustand';

import { settingsRepository } from '@/database/repositories/settings';
import type { SettingsKey, SettingsMap } from '@/shared/types/settings';

type SettingsState = {
  settings: Partial<SettingsMap>;
  loaded: boolean;
  load(): Promise<void>;
  /** Gravação otimista: atualiza já e reverte se o banco falhar (o erro sobe para a UI mostrar o toast). */
  update<K extends SettingsKey>(key: K, value: SettingsMap[K]): Promise<void>;
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: {},
  loaded: false,

  async load() {
    set({ settings: await settingsRepository.getAll(), loaded: true });
  },

  async update(key, value) {
    const previous = get().settings;
    set({ settings: { ...previous, [key]: value } });
    try {
      await settingsRepository.set(key, value);
    } catch (error) {
      set({ settings: previous });
      throw error;
    }
  },
}));
