import { setDatabase } from '@/database/client';
import { runMigrations } from '@/database/migrations';
import { readingsRepository } from '@/database/repositories/readings';
import { settingsRepository } from '@/database/repositories/settings';
import { runSeed } from '@/database/seed';
import { createMemoryDatabase } from '@/database/testUtils';
import { patternsRepository } from '@/database/repositories/patterns';
import { deleteAttachmentFile } from '@/services/attachments';
import { DEFAULT_PATTERNS, GESTATIONAL_PATTERN_ID } from '@/shared/constants/defaultPatterns';

import { useDashboardStore } from './dashboard';
import { useHistoryStore } from './history';
import { usePatternsStore } from './patterns';
import { useReadingsStore } from './readings';
import { useSettingsStore } from './settings';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('@/services/attachments', () => ({
  importAttachment: jest.fn(async (_file: unknown, id: string) => `attachments/${id}.jpg`),
  deleteAttachmentFile: jest.fn(),
}));
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
  useDashboardStore.setState({ period: 'current-month', periodReadings: [], loaded: false });
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

  it('painel calcula o período do gráfico e as métricas do mês, e acompanha novos registros', async () => {
    const now = new Date();
    const today = (h: number, value: number) => ({
      value,
      context: 'fasting' as const,
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h).toISOString(),
    });
    await useDashboardStore.getState().setPeriod('last-7');
    expect(useDashboardStore.getState().periodStats.count).toBe(0);

    await useReadingsStore.getState().add(today(7, 100));
    await useReadingsStore.getState().add(today(8, 160));
    await waitFor(() => useDashboardStore.getState().periodReadings.length === 2);
    const { periodStats, monthStats } = useDashboardStore.getState();
    expect(periodStats.mean).toBe(130);
    expect(periodStats.tir.inRange).toBe(0.5);
    expect(monthStats.count).toBe(2);
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

  it('padrão personalizado é salvo com anexos e ativado; excluir apaga os arquivos', async () => {
    const custom = {
      ...DEFAULT_PATTERNS[0],
      id: 'custom-1',
      name: 'Plano Dr. Roberto',
      kind: 'custom' as const,
      status: 'draft' as const,
    };
    const photo = { uri: 'file:///cache/receita.jpg', mimeType: 'image/jpeg' as const, name: 'receita.jpg' };

    await usePatternsStore.getState().saveWithAttachments(custom, { activate: true }, { added: [photo], removed: [] });
    expect(usePatternsStore.getState().active?.id).toBe('custom-1');
    const [attachment] = await usePatternsStore.getState().listAttachments('custom-1');
    expect(attachment.fileUri).toMatch(/^attachments\/.+\.jpg$/);

    await usePatternsStore.getState().saveWithAttachments(custom, { activate: true }, { added: [], removed: [attachment] });
    expect(await usePatternsStore.getState().listAttachments('custom-1')).toEqual([]);
    expect(deleteAttachmentFile).toHaveBeenCalledWith(attachment.fileUri);

    await usePatternsStore.getState().activate(GESTATIONAL_PATTERN_ID);
    await usePatternsStore.getState().remove('custom-1');
    expect(usePatternsStore.getState().patterns.map((p) => p.id)).not.toContain('custom-1');
  });

  it('se o banco falhar ao salvar o padrão, os arquivos copiados são apagados', async () => {
    jest.spyOn(patternsRepository, 'saveWithAttachments').mockRejectedValueOnce(new Error('falhou'));
    const custom = { ...DEFAULT_PATTERNS[0], id: 'custom-2', name: 'X', kind: 'custom' as const, status: 'draft' as const };
    const photo = { uri: 'file:///cache/a.jpg', mimeType: 'image/jpeg' as const, name: 'a.jpg' };
    (deleteAttachmentFile as jest.Mock).mockClear();
    await expect(
      usePatternsStore.getState().saveWithAttachments(custom, { activate: false }, { added: [photo], removed: [] }),
    ).rejects.toThrow('falhou');
    expect(deleteAttachmentFile).toHaveBeenCalledTimes(1);
    expect(usePatternsStore.getState().patterns.map((p) => p.id)).not.toContain('custom-2');
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
