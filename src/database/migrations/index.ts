import type { Database } from '../client';

export type Migration = { version: number; up: string };

// Nunca editar uma migration já publicada: mudanças entram como nova versão (DESIGN.md §13.4).
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE patterns (
        id                    TEXT PRIMARY KEY,
        name                  TEXT NOT NULL,
        kind                  TEXT NOT NULL CHECK (kind IN ('standard','gestational','custom')),
        condition             TEXT,
        fasting_min           INTEGER,
        fasting_max           INTEGER,
        postmeal_max          INTEGER,
        postmeal_window_hours INTEGER NOT NULL DEFAULT 2 CHECK (postmeal_window_hours IN (1,2)),
        bedtime_min           INTEGER,
        bedtime_max           INTEGER,
        alert_hypo            INTEGER NOT NULL DEFAULT 70,
        alert_hyper           INTEGER NOT NULL DEFAULT 200,
        hypo_bypass_dnd       INTEGER NOT NULL DEFAULT 1,
        doctor_name           TEXT,
        doctor_crm            TEXT,
        doctor_specialty      TEXT,
        medical_notes         TEXT,
        reviewed_at           TEXT,
        status                TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','draft','inactive')),
        is_builtin            INTEGER NOT NULL DEFAULT 0,
        created_at            TEXT NOT NULL,
        updated_at            TEXT NOT NULL
      );
      CREATE UNIQUE INDEX idx_patterns_single_active ON patterns(status) WHERE status = 'active';

      CREATE TABLE readings (
        id               TEXT PRIMARY KEY,
        value            INTEGER NOT NULL CHECK (value BETWEEN 20 AND 600),
        measured_at      TEXT NOT NULL,
        context          TEXT NOT NULL,
        note             TEXT,
        insulin_units    REAL,
        is_correction    INTEGER NOT NULL DEFAULT 0,
        cycle_day        TEXT CHECK (cycle_day IN ('A','B')),
        cycle_slot_index INTEGER,
        cycle_slot_total INTEGER,
        pattern_id       TEXT REFERENCES patterns(id) ON DELETE SET NULL,
        target_min       INTEGER,
        target_max       INTEGER,
        status           TEXT NOT NULL,
        source           TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','import')),
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
      );
      CREATE INDEX idx_readings_measured_at ON readings(measured_at DESC);
      CREATE INDEX idx_readings_context     ON readings(context, measured_at DESC);

      CREATE TABLE attachments (
        id          TEXT PRIMARY KEY,
        pattern_id  TEXT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
        file_uri    TEXT NOT NULL,
        mime_type   TEXT NOT NULL,
        created_at  TEXT NOT NULL
      );

      CREATE TABLE settings (
        key         TEXT PRIMARY KEY,
        value       TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
    `,
  },
];

/** Aplica, em transação, as migrations com versão maior que `PRAGMA user_version`. */
export async function runMigrations(db: Database, migrations: Migration[] = MIGRATIONS): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  let version = row?.user_version ?? 0;

  for (const migration of [...migrations].sort((a, b) => a.version - b.version)) {
    if (migration.version <= version) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    version = migration.version;
  }
  return version;
}
