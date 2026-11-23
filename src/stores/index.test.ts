import { setDatabase } from '@/database/client';
import { runMigrations } from '@/database/migrations';
import { readingsRepository } from '@/database/repositories/readings';
import { settingsRepository } from '@/database/repositories/settings';
import { runSeed } from '@/database/seed';
import { createMemoryDatabase } from '@/database/testUtils';
import { GESTATIONAL_PATTERN_ID } from '@/shared/constants/defaultPatterns';

import { usePatternsStore } from './patterns';
import { useReadingsStore } from './readings';
import { useSettingsStore } from './settings';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('expo-crypto', () => ({ 
  randomUUID: () => crypto.randomUUID(),
}));

let db: ReturnType<typeof createMemoryDatabase>;

beforeEach(async () => {
  db = createMemoryDatabase();
  setDatabase(db);
  await runMigrations(db);
  await runSeed(new Date(2024, 9, 21));
  await Promise.all([useSettingsStore.getState().load(), usePatternsStore.getState().load()]);
  await useReadingsStore.getState().load();
});

afterEach(() => {
  jest.restoreAllMocks();
  setDatabase(null);
  db.close();
});

const input = (value: number, day = 24) => ({
  value,
  context: 'fasting' as const,
  timestamp: new Date(2024, 9, day, 7, 30).toISOString(),
});

describe('stores', () => {
  it('carregam o estado inicial do banco', () => {
    expect(useSettingsStore.getState().settings.appearance).toBe('system');
    expect(usePatternsStore.getState().active?.name).toBe('Diabetes Comum');
    expect(useReadingsStore.getState().recent).toEqual([]);
  });

  it('nova leitura é classificada com o padrão ativo e persiste', async () => {
    const saved = await useReadingsStore.getState().add(input(104));
    expect(saved).toMatchObject({ status: 'in-range', target: { min: 80, max: 130 } });
    expect(useReadingsStore.getState().recent[0].id).toBe(saved.id);

    // "Reabrir o app": estado novo carregado do banco.
    useReadingsStore.setState({ recent: [] });
    await useReadingsStore.getState().load();
    expect(useReadingsStore.getState().recent.map((r) => r.value)).toEqual([104]);
  });

  it('reverte a leitura otimista se o banco falhar', async () => {
    jest.spyOn(readingsRepository, 'create').mockRejectedValueOnce(new Error('disco cheio'));
    await expect(useReadingsStore.getState().add(input(104))).rejects.toThrow('disco cheio');
    expect(useReadingsStore.getState().recent).toEqual([]);
  });

  it('edição reclassifica com o padrão da própria leitura', async () => {
    const saved = await useReadingsStore.getState().add(input(104));
    await usePatternsStore.getState().activate(GESTATIONAL_PATTERN_ID);
    const updated = await useReadingsStore.getState().update(saved.id, input(125));
    expect(updated).toMatchObject({ status: 'in-range', target: { min: 80, max: 130 } });
    expect((await readingsRepository.getById(saved.id))?.value).toBe(125);
  });

  it('exclusão remove da lista e do banco', async () => {
    const saved = await useReadingsStore.getState().add(input(104));
    await useReadingsStore.getState().remove(saved.id);
    expect(useReadingsStore.getState().recent).toEqual([]);
    expect(await readingsRepository.getById(saved.id)).toBeNull();
  });

  it('trocar o padrão reverte se o banco falhar', async () => {
    await expect(usePatternsStore.getState().activate('nao-existe')).rejects.toThrow();
    expect(usePatternsStore.getState().active?.name).toBe('Diabetes Comum');
  });

  it('configuração otimista reverte em erro', async () => {
    await useSettingsStore.getState().update('appearance', 'dark');
    expect(await settingsRepository.get('appearance')).toBe('dark');

    jest.spyOn(settingsRepository, 'set').mockRejectedValueOnce(new Error('falhou'));
    await expect(useSettingsStore.getState().update('appearance', 'light')).rejects.toThrow();
    expect(useSettingsStore.getState().settings.appearance).toBe('dark');
  });
});
