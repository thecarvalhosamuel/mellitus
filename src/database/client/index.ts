import { openDatabaseAsync } from 'expo-sqlite';

export type SqlValue = string | number | null;

/**
 * Subconjunto do SQLiteDatabase (expo-sqlite) usado pelos repositórios.
 * Nos testes, um adaptador sobre `node:sqlite` implementa a mesma interface.
 */
export type Database = {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SqlValue[]): Promise<{ changes: number }>;
  getAllAsync<T>(source: string, params: SqlValue[]): Promise<T[]>;
  getFirstAsync<T>(source: string, params: SqlValue[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

export const DATABASE_NAME = 'mellitus.db';

let current: Database | null = null;

/** Banco aberto pela inicialização do app. Só repositórios, migrations e seed usam. */
export function getDatabase(): Database {
  if (!current) throw new Error('Banco não inicializado: chame openDatabase() no _layout.');
  return current;
}

export function setDatabase(db: Database | null): void {
  current = db;
}

let transactionDepth = 0;

/**
 * Transação reentrante: se já houver uma aberta (ex.: seed chamando repositórios),
 * a tarefa roda dentro dela em vez de abrir outra (o SQLite não aninha BEGIN).
 */
export async function runInTransaction(task: () => Promise<void>): Promise<void> {
  if (transactionDepth > 0) return task();
  transactionDepth += 1;
  try {
    await getDatabase().withTransactionAsync(task);
  } finally {
    transactionDepth -= 1;
  }
}

export async function openDatabase(): Promise<Database> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  setDatabase(db);
  return db;
}
