import type { SettingsKey, SettingsMap } from '@/shared/types/settings';

import { getDatabase } from '../../client';

// Cada chave guarda um JSON (DESIGN.md §13.3).
export const settingsRepository = {
  async get<K extends SettingsKey>(key: K): Promise<SettingsMap[K] | null> {
    const row = await getDatabase().getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );
    return row ? (JSON.parse(row.value) as SettingsMap[K]) : null;
  },

  async getAll(): Promise<Partial<SettingsMap>> {
    const rows = await getDatabase().getAllAsync<{ key: SettingsKey; value: string }>(
      'SELECT key, value FROM settings',
      [],
    );
    return Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)])) as Partial<SettingsMap>;
  },

  async set<K extends SettingsKey>(key: K, value: SettingsMap[K]): Promise<void> {
    await getDatabase().runAsync(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, JSON.stringify(value), new Date().toISOString()],
    );
  },
};
