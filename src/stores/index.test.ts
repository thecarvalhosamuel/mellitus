import { setDatabase } from '@/database/client';
import { runMigrations } from '@/database/migrations';
import { readingsRepository } from '@/database/repositories/readings';
import { settingsRepository } from '@/database/repositories/settings';
import { runSeed } from '@/database/seed';
import { createMemoryDatabase } from '@/database/testUtils';
import { GESTATIONAL_PATTERN_ID } from '@/shared/constants/defaultPatterns';

import { useHistoryStore } from './history';
import { usePatternsStore } from './patterns';
import { useReadingsStore } from './readings';
import { useSettingsStore } from './settings';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('expo-crypto', () => ({ 
  randomUUID: () => crypto.randomUUID(),
}));

let db: ReturnType<typeof createMemoryDatabase>;

/** O histórico recarrega em segundo plano; espera a condição por alguns ciclos. */
async function waitFor(condition: () => boolean) {
  for (let i = 0; i < 50 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 0));
  expect(condition()).toBe(true);
}

beforeEach(async () => {
  db = createMemoryDatabase();
  setDatabase(db);
  await runMigrations(db);
  await runSeed(new Date(2024, 9, 21));
  await Promise.all([useSettingsStore.getState().load(), usePatternsStore.getState().load()]);
  await useReadingsStore.getState().load();
  useHistoryStore.setState({ readings: [], months: [], loaded: false });
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

  it('leituras de hoje entram em "today" em ordem de horário; as de outros dias não', async () => {
    const now = new Date();
    const at = (h: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), h).toISOString();
    await useReadingsStore.getState().add({ value: 140, context: 'bedtime', timestamp: at(22) });
    await useReadingsStore.getState().add({ value: 100, context: 'fasting', timestamp: at(7) });
    await useReadingsStore.getState().add(input(90, 1));
    expect(useReadingsStore.getState().today.map((r) => r.value)).toEqual([100, 140]);

    useReadingsStore.setState({ today: [] });
    await useReadingsStore.getState().load();
    expect(useReadingsStore.getState().today.map((r) => r.value)).toEqual([100, 140]);
  });

  it('histórico carrega por mês e acompanha registros, edições e exclusões', async () => {
    await useHistoryStore.getState().selectMonth({ year: 2024, month: 10 });
    expect(useHistoryStore.getState().readings).toEqual([]);

    const saved = await useReadingsStore.getState().add(input(104));
    await waitFor(() => useHistoryStore.getState().readings.length === 1);
    expect(useHistoryStore.getState().months).toEqual([{ month: '2024-10', total: 1 }]);

    await useReadingsStore.getState().update(saved.id, input(150));
    await waitFor(() => useHistoryStore.getState().readings[0]?.value === 150);

    await useReadingsStore.getState().remove(saved.id);
    await waitFor(() => useHistoryStore.getState().readings.length === 0);

    await useHistoryStore.getState().selectMonth({ year: 2024, month: 9 });
    expect(useHistoryStore.getState().month).toEqual({ year: 2024, month: 9 });
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
