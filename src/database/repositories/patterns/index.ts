import type { ClinicalPattern, PatternCondition, PatternKind, PatternStatus } from '@/shared/types/pattern';

import { getDatabase, runInTransaction, type SqlValue } from '../../client';

type PatternRow = {
  id: string;
  name: string;
  kind: PatternKind;
  condition: PatternCondition | null;
  fasting_min: number | null;
  fasting_max: number | null;
  postmeal_max: number | null;
  postmeal_window_hours: 1 | 2;
  bedtime_min: number | null;
  bedtime_max: number | null;
  alert_hypo: number;
  alert_hyper: number;
  hypo_bypass_dnd: number;
  doctor_name: string | null;
  doctor_crm: string | null;
  doctor_specialty: string | null;
  medical_notes: string | null;
  reviewed_at: string | null;
  status: PatternStatus;
  is_builtin: number;
};

export type StoredPattern = ClinicalPattern & { isBuiltin: boolean };

const opt = <T>(value: T | null): T | undefined => (value === null ? undefined : value);
const range = (min: number | null, max: number | null) => ({
  ...(min !== null && { min }),
  ...(max !== null && { max }),
});

function fromRow(row: PatternRow): StoredPattern {
  const hasDoctor = row.doctor_name !== null || row.doctor_crm !== null || row.doctor_specialty !== null;
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    condition: opt(row.condition),
    fasting: range(row.fasting_min, row.fasting_max),
    postprandial: { ...range(null, row.postmeal_max), windowHours: row.postmeal_window_hours },
    bedtime: range(row.bedtime_min, row.bedtime_max),
    alerts: { hypo: row.alert_hypo, hyper: row.alert_hyper, hypoBypassDND: row.hypo_bypass_dnd === 1 },
    medicalTeam: hasDoctor
      ? {
          name: row.doctor_name ?? '',
          crm: row.doctor_crm ?? '',
          specialty: row.doctor_specialty ?? '',
          notes: opt(row.medical_notes),
        }
      : undefined,
    status: row.status,
    reviewedAt: opt(row.reviewed_at),
    isBuiltin: row.is_builtin === 1,
  };
}

const COLUMNS = [
  'id', 'name', 'kind', 'condition', 'fasting_min', 'fasting_max', 'postmeal_max',
  'postmeal_window_hours', 'bedtime_min', 'bedtime_max', 'alert_hypo', 'alert_hyper',
  'hypo_bypass_dnd', 'doctor_name', 'doctor_crm', 'doctor_specialty', 'medical_notes',
  'reviewed_at', 'status', 'is_builtin', 'created_at', 'updated_at',
] as const;

function toParams(pattern: ClinicalPattern, isBuiltin: boolean, now: string): SqlValue[] {
  return [
    pattern.id,
    pattern.name,
    pattern.kind,
    pattern.condition ?? null,
    pattern.fasting.min ?? null,
    pattern.fasting.max ?? null,
    pattern.postprandial.max ?? null,
    pattern.postprandial.windowHours,
    pattern.bedtime.min ?? null,
    pattern.bedtime.max ?? null,
    pattern.alerts.hypo,
    pattern.alerts.hyper,
    pattern.alerts.hypoBypassDND ? 1 : 0,
    pattern.medicalTeam?.name ?? null,
    pattern.medicalTeam?.crm ?? null,
    pattern.medicalTeam?.specialty ?? null,
    pattern.medicalTeam?.notes ?? null,
    pattern.reviewedAt ?? null,
    pattern.status,
    isBuiltin ? 1 : 0,
    now,
    now,
  ];
}

const UPDATABLE = COLUMNS.filter((c) => !['id', 'is_builtin', 'created_at'].includes(c));

export const patternsRepository = {
  async getActive(): Promise<StoredPattern | null> {
    const row = await getDatabase().getFirstAsync<PatternRow>(
      "SELECT * FROM patterns WHERE status = 'active' LIMIT 1",
      [],
    );
    return row ? fromRow(row) : null;
  },

  async getById(id: string): Promise<StoredPattern | null> {
    const row = await getDatabase().getFirstAsync<PatternRow>('SELECT * FROM patterns WHERE id = ?', [id]);
    return row ? fromRow(row) : null;
  },

  async list(): Promise<StoredPattern[]> {
    const rows = await getDatabase().getAllAsync<PatternRow>(
      'SELECT * FROM patterns ORDER BY is_builtin DESC, created_at ASC',
      [],
    );
    return rows.map(fromRow);
  },

  async count(): Promise<number> {
    const row = await getDatabase().getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM patterns', []);
    return row?.total ?? 0;
  },

  /** Insere ou atualiza. Com `activate`, desativa o atual e ativa este na mesma transação. */
  async save(pattern: ClinicalPattern, opts: { activate: boolean; isBuiltin?: boolean }): Promise<StoredPattern> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const toSave: ClinicalPattern = {
      ...pattern,
      status: opts.activate ? 'active' : pattern.status === 'active' ? 'inactive' : pattern.status,
    };

    await runInTransaction(async () => {
      if (opts.activate) {
        await db.runAsync(
          "UPDATE patterns SET status = 'inactive', updated_at = ? WHERE status = 'active' AND id <> ?",
          [now, pattern.id],
        );
      }
      const params = toParams(toSave, opts.isBuiltin ?? false, now);
      const updates = UPDATABLE.map((c) => `${c} = excluded.${c}`).join(', ');
      await db.runAsync(
        `INSERT INTO patterns (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map(() => '?').join(', ')})
         ON CONFLICT(id) DO UPDATE SET ${updates}`,
        params,
      );
    });

    return { ...toSave, isBuiltin: opts.isBuiltin ?? false };
  },

  /** Transação: desativa o padrão atual e ativa o novo. Rascunhos também podem ser ativados. */
  async activate(id: string): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();
    await runInTransaction(async () => {
      const exists = await db.getFirstAsync<{ id: string }>('SELECT id FROM patterns WHERE id = ?', [id]);
      if (!exists) throw new Error(`Padrão ${id} não encontrado.`);
      await db.runAsync(
        "UPDATE patterns SET status = 'inactive', updated_at = ? WHERE status = 'active' AND id <> ?",
        [now, id],
      );
      await db.runAsync("UPDATE patterns SET status = 'active', updated_at = ? WHERE id = ?", [now, id]);
    });
  },

  /** Padrões prontos e o padrão ativo não podem ser excluídos. */
  async remove(id: string): Promise<void> {
    const pattern = await this.getById(id);
    if (!pattern) return;
    if (pattern.isBuiltin) throw new Error('Padrões prontos não podem ser excluídos.');
    if (pattern.status === 'active') throw new Error('Ative outro padrão antes de excluir este.');
    await getDatabase().runAsync('DELETE FROM patterns WHERE id = ?', [id]);
  },
};
