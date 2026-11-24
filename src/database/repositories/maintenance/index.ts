import { getDatabase } from '../../client';

/** Ordem respeita as chaves estrangeiras (anexos e leituras apontam para padrões). */
const TABLES = ['attachments', 'readings', 'patterns', 'settings'] as const;

export const maintenanceRepository = {
  /** Apaga todas as linhas de todas as tabelas (o esquema e a versão das migrations ficam). */
  async deleteAll(): Promise<void> {
    const db = getDatabase();
    for (const table of TABLES) await db.runAsync(`DELETE FROM ${table}`, []);
  },

  /**
   * Reescreve o arquivo do banco sem as páginas liberadas, para não sobrar
   * resto dos dados apagados. Não pode rodar dentro de transação.
   */
  async compact(): Promise<void> {
    const db = getDatabase();
    await db.execAsync('VACUUM;');
    await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  },

  async countRows(): Promise<Record<(typeof TABLES)[number], number>> {
    const db = getDatabase();
    const entries = await Promise.all(
      TABLES.map(async (table) => {
        const row = await db.getFirstAsync<{ total: number }>(`SELECT COUNT(*) AS total FROM ${table}`, []);
        return [table, row?.total ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<(typeof TABLES)[number], number>;
  },
};
