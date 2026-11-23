import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';
import { DEFAULT_SETTINGS } from '@/shared/constants/defaultSettings';
import type { SettingsKey, SettingsMap } from '@/shared/types/settings';
import { toDateKey } from '@/shared/utils/date';

import { runInTransaction } from '../client';
import { patternsRepository } from '../repositories/patterns';
import { settingsRepository } from '../repositories/settings';

/**
 * Primeira execução: só roda se `patterns` estiver vazia (DESIGN.md §13.4).
 * Grava os padrões prontos e as configurações iniciais numa única transação.
 */
export async function runSeed(today: Date = new Date()): Promise<boolean> {
  if ((await patternsRepository.count()) > 0) return false;

  const settings: Omit<SettingsMap, 'profile'> = {
    ...DEFAULT_SETTINGS,
    frequency: { ...DEFAULT_SETTINGS.frequency, cycleStart: toDateKey(today) },
  };

  await runInTransaction(async () => {
    for (const pattern of DEFAULT_PATTERNS) {
      await patternsRepository.save(pattern, { activate: pattern.status === 'active', isBuiltin: true });
    }
    for (const key of Object.keys(settings) as Exclude<SettingsKey, 'profile'>[]) {
      await settingsRepository.set(key, settings[key]);
    }
  });
  return true;
}
