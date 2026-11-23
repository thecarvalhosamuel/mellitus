// Só para testes (Jest/Node): implementa a interface Database sobre `node:sqlite`,
// para exercitar migrations, seed e repositórios num SQLite real em memória.
import type { Database, SqlValue } from '../client';

type NodeStatement = {
  run(...params: SqlValue[]): { changes: number | bigint };
  all(...params: SqlValue[]): unknown[];
  get(...params: SqlValue[]): unknown;
};
type NodeDatabase = { exec(sql: string): void; prepare(sql: string): NodeStatement; close(): void };

export function createMemoryDatabase(): Database & { close(): void } {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite') as { DatabaseSync: new (path: string) => NodeDatabase };
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  const plain = <T>(row: unknown) => (row ? ({ ...(row as object) } as T) : null);

  return {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params) {
      return { changes: Number(db.prepare(source).run(...params).changes) };
    },
    async getAllAsync<T>(source: string, params: SqlValue[]) {
      return db.prepare(source).all(...params).map((row) => plain<T>(row) as T);
    },
    async getFirstAsync<T>(source: string, params: SqlValue[]) {
      return plain<T>(db.prepare(source).get(...params));
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close: () => db.close(),
  };
}
