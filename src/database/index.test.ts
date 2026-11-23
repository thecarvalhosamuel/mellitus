import { DEFAULT_PATTERNS, GESTATIONAL_PATTERN_ID, STANDARD_PATTERN_ID } from '@/shared/constants/defaultPatterns';
import { buildReading } from '@/shared/utils/reading';

import { setDatabase } from './client';
import { MIGRATIONS, runMigrations } from './migrations';
import { attachmentsRepository } from './repositories/attachments';
import { patternsRepository } from './repositories/patterns';
import { readingsRepository } from './repositories/readings';
import { settingsRepository } from './repositories/settings';
import { runSeed } from './seed';
import { createMemoryDatabase } from './testUtils';

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));

let db: ReturnType<typeof createMemoryDatabase>;

beforeEach(async () => {
  db = createMemoryDatabase();
  setDatabase(db);
  await runMigrations(db);
  await runSeed(new Date(2024, 9, 21, 9, 0));
});

afterEach(() => {
  setDatabase(null);
  db.close();
});

const standard = DEFAULT_PATTERNS[0];
const at = (day: number, h: number, m = 0) => new Date(2024, 9, day, h, m).toISOString();
let seq = 0;
const reading = (value: number, context: 'fasting' | 'post-meal-2h' | 'bedtime', timestamp: string) =>
  buildReading(`r${++seq}`, { value, context, timestamp }, standard);

describe('migrations', () => {
  it('sobe a versão do esquema e não reaplica', async () => {
    expect(await runMigrations(db)).toBe(MIGRATIONS.length);
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(row?.user_version).toBe(MIGRATIONS.length);
  });

  it('desfaz a migration inteira se ela falhar', async () => {
    const fresh = createMemoryDatabase();
    await expect(
      runMigrations(fresh, [{ version: 1, up: 'CREATE TABLE a (id TEXT); CREATE TABLE a (id TEXT);' }]),
    ).rejects.toThrow();
    expect(await fresh.getAllAsync("SELECT name FROM sqlite_master WHERE name = 'a'", [])).toEqual([]);
    fresh.close();
  });
});

describe('seed', () => {
  it('cria os padrões prontos com Diabetes Comum ativo', async () => {
    const patterns = await patternsRepository.list();
    expect(patterns.map((p) => [p.id, p.status, p.isBuiltin])).toEqual([
      [STANDARD_PATTERN_ID, 'active', true],
      [GESTATIONAL_PATTERN_ID, 'inactive', true],
    ]);
    const active = await patternsRepository.getActive();
    expect(active?.fasting).toEqual({ min: 80, max: 130 });
    expect(active?.postprandial).toEqual({ max: 180, windowHours: 2 });
    expect(active?.alerts).toEqual({ hypo: 70, hyper: 200, hypoBypassDND: true });
  });

  it('grava as configurações iniciais com o ciclo começando no dia da instalação', async () => {
    expect(await settingsRepository.get('appearance')).toBe('system');
    const frequency = await settingsRepository.get('frequency');
    expect(frequency?.mode).toBe('3x');
    expect(frequency?.cycleStart).toBe('2024-10-21');
    expect(await settingsRepository.get('profile')).toBeNull();
  });

  it('roda só na primeira execução', async () => {
    expect(await runSeed()).toBe(false);
    expect(await patternsRepository.count()).toBe(2);
  });
});

describe('settingsRepository', () => {
  it('grava e lê JSON por chave', async () => {
    await settingsRepository.set('profile', { name: 'Ana' });
    await settingsRepository.set('appearance', 'dark');
    expect(await settingsRepository.get('profile')).toEqual({ name: 'Ana' });
    const all = await settingsRepository.getAll();
    expect(all.appearance).toBe('dark');
    expect(all.reminders?.snoozeMinutes).toBe(10);
  });
});

describe('patternsRepository', () => {
  const custom = {
    ...standard,
    id: 'custom-1',
    name: 'Plano Dr. Roberto',
    kind: 'custom' as const,
    condition: 'athlete' as const,
    fasting: { min: 70, max: 120 },
    medicalTeam: { name: 'Dr. Roberto', crm: 'CRM/SP 1', specialty: 'Endocrinologia' },
    status: 'draft' as const,
  };

  it('salva rascunho sem mexer no ativo', async () => {
    await patternsRepository.save(custom, { activate: false });
    expect((await patternsRepository.getActive())?.id).toBe(STANDARD_PATTERN_ID);
    const saved = await patternsRepository.getById('custom-1');
    expect(saved?.status).toBe('draft');
    expect(saved?.medicalTeam?.name).toBe('Dr. Roberto');
  });

  it('salvar e ativar deixa um único padrão ativo', async () => {
    await patternsRepository.save(custom, { activate: true });
    const statuses = (await patternsRepository.list()).map((p) => [p.id, p.status]);
    expect(statuses).toEqual([
      [STANDARD_PATTERN_ID, 'inactive'],
      [GESTATIONAL_PATTERN_ID, 'inactive'],
      ['custom-1', 'active'],
    ]);
  });

  it('ativar troca o padrão ativo e falha sem alterar nada se o id não existir', async () => {
    await patternsRepository.activate(GESTATIONAL_PATTERN_ID);
    expect((await patternsRepository.getActive())?.id).toBe(GESTATIONAL_PATTERN_ID);
    await expect(patternsRepository.activate('nope')).rejects.toThrow();
    expect((await patternsRepository.getActive())?.id).toBe(GESTATIONAL_PATTERN_ID);
  });

  it('protege padrões prontos e o padrão ativo de exclusão', async () => {
    await expect(patternsRepository.remove(GESTATIONAL_PATTERN_ID)).rejects.toThrow();
    await patternsRepository.save(custom, { activate: true });
    await expect(patternsRepository.remove('custom-1')).rejects.toThrow();
    await patternsRepository.activate(STANDARD_PATTERN_ID);
    await patternsRepository.remove('custom-1');
    expect(await patternsRepository.getById('custom-1')).toBeNull();
  });

  it('anexos são apagados junto com o padrão', async () => {
    await patternsRepository.save(custom, { activate: false });
    await attachmentsRepository.add({ id: 'a1', patternId: 'custom-1', fileUri: 'attachments/a1.jpg', mimeType: 'image/jpeg' });
    expect(await attachmentsRepository.listByPattern('custom-1')).toHaveLength(1);
    await patternsRepository.remove('custom-1');
    expect(await attachmentsRepository.listByPattern('custom-1')).toEqual([]);
  });
});

describe('readingsRepository', () => {
  it('grava a leitura com status e meta e lê de volta igual', async () => {
    const r = buildReading(
      'x1',
      { value: 188, context: 'post-meal-2h', timestamp: at(22, 20, 30), note: ' Pizza ', insulinUnits: 1, isCorrection: true, cycleDay: 'A', cycleSlot: { index: 2, total: 3 } },
      standard,
    );
    await readingsRepository.create(r);
    expect(await readingsRepository.getById('x1')).toEqual(r);
    expect(r).toMatchObject({ status: 'above-target', target: { max: 180 }, note: 'Pizza', patternId: STANDARD_PATTERN_ID });
  });

  it('lista recentes, a última e por dia em ordem de horário', async () => {
    await readingsRepository.create(reading(104, 'fasting', at(24, 7, 30)));
    await readingsRepository.create(reading(122, 'bedtime', at(23, 22, 15)));
    await readingsRepository.create(reading(99, 'fasting', at(23, 7, 45)));

    expect((await readingsRepository.getLatest())?.value).toBe(104);
    expect((await readingsRepository.listRecent(2)).map((r) => r.value)).toEqual([104, 122]);
    expect((await readingsRepository.listForDay('2024-10-23')).map((r) => r.value)).toEqual([99, 122]);
  });

  it('consulta por mês local, com filtro de contexto e ordenação', async () => {
    await readingsRepository.create(reading(100, 'fasting', new Date(2024, 8, 30, 23, 59).toISOString()));
    await readingsRepository.create(reading(110, 'fasting', new Date(2024, 9, 1, 0, 0).toISOString()));
    await readingsRepository.create(reading(150, 'post-meal-2h', at(15, 14)));
    await readingsRepository.create(reading(120, 'fasting', new Date(2024, 9, 31, 23, 59).toISOString()));
    await readingsRepository.create(reading(90, 'fasting', new Date(2024, 10, 1, 0, 0).toISOString()));

    expect((await readingsRepository.listByMonth(2024, 10)).map((r) => r.value)).toEqual([120, 150, 110]);
    expect((await readingsRepository.listByMonth(2024, 10, { context: 'fasting', order: 'asc' })).map((r) => r.value)).toEqual([110, 120]);
    expect(await readingsRepository.countByMonth()).toEqual([
      { month: '2024-11', total: 1 },
      { month: '2024-10', total: 3 },
      { month: '2024-09', total: 1 },
    ]);
  });

  it('atualiza e exclui', async () => {
    const r = reading(104, 'fasting', at(24, 7, 30));
    await readingsRepository.create(r);
    await readingsRepository.update({ ...r, value: 140, status: 'above-target' });
    expect(await readingsRepository.getById(r.id)).toMatchObject({ value: 140, status: 'above-target' });
    await readingsRepository.remove(r.id);
    expect(await readingsRepository.getById(r.id)).toBeNull();
  });

  it('calcula estatísticas do período no banco', async () => {
    await readingsRepository.create(reading(80, 'fasting', at(2, 7)));
    await readingsRepository.create(reading(120, 'fasting', at(3, 7)));
    await readingsRepository.create(reading(250, 'post-meal-2h', at(4, 14)));
    const stats = await readingsRepository.statsForRange(at(1, 0), at(4, 0));
    expect(stats.count).toBe(2);
    expect(stats.mean).toBe(100);
    expect(stats.tir.inRange).toBe(1);
  });

  it('o banco rejeita valores fora de 20–600', async () => {
    await expect(readingsRepository.create({ ...reading(104, 'fasting', at(1, 7)), value: 700 })).rejects.toThrow();
  });

  it('a leitura mantém a meta gravada mesmo se o padrão mudar depois', async () => {
    const r = reading(125, 'fasting', at(24, 7));
    await readingsRepository.create(r);
    await patternsRepository.activate(GESTATIONAL_PATTERN_ID);
    expect(await readingsRepository.getById(r.id)).toMatchObject({ status: 'in-range', target: { min: 80, max: 130 } });
  });
});
