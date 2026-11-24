import type { CycleDay, GlucoseReading, GlucoseStatus, MealContext, ReadingSource } from '@/shared/types/reading';
import { computeStats, type PeriodStats } from '@/shared/utils/stats';

import { getDatabase, runInTransaction, type SqlValue } from '../../client';

type ReadingRow = {
  id: string;
  value: number;
  measured_at: string;
  context: MealContext;
  note: string | null;
  insulin_units: number | null;
  is_correction: number;
  cycle_day: CycleDay | null;
  cycle_slot_index: number | null;
  cycle_slot_total: number | null;
  pattern_id: string | null;
  target_min: number | null;
  target_max: number | null;
  status: GlucoseStatus;
  source: ReadingSource;
};

function fromRow(row: ReadingRow): GlucoseReading {
  const hasTarget = row.target_min !== null || row.target_max !== null;
  return {
    id: row.id,
    value: row.value,
    timestamp: row.measured_at,
    context: row.context,
    ...(row.note !== null && { note: row.note }),
    ...(row.insulin_units !== null && { insulinUnits: row.insulin_units }),
    ...(row.is_correction === 1 && { isCorrection: true }),
    ...(row.cycle_day !== null && { cycleDay: row.cycle_day }),
    ...(row.cycle_slot_index !== null &&
      row.cycle_slot_total !== null && {
        cycleSlot: { index: row.cycle_slot_index, total: row.cycle_slot_total },
      }),
    ...(row.pattern_id !== null && { patternId: row.pattern_id }),
    ...(hasTarget && {
      target: {
        ...(row.target_min !== null && { min: row.target_min }),
        ...(row.target_max !== null && { max: row.target_max }),
      },
    }),
    status: row.status,
    source: row.source,
  };
}

/** `measured_at` é sempre gravado em UTC ("…Z") para que comparações de texto ordenem corretamente. */
const toUtc = (iso: string) => new Date(iso).toISOString();

const MUTABLE = [
  'value', 'measured_at', 'context', 'note', 'insulin_units', 'is_correction', 'cycle_day',
  'cycle_slot_index', 'cycle_slot_total', 'pattern_id', 'target_min', 'target_max', 'status', 'source',
] as const;

function toParams(r: GlucoseReading): SqlValue[] {
  return [
    r.value,
    toUtc(r.timestamp),
    r.context,
    r.note ?? null,
    r.insulinUnits ?? null,
    r.isCorrection ? 1 : 0,
    r.cycleDay ?? null,
    r.cycleSlot?.index ?? null,
    r.cycleSlot?.total ?? null,
    r.patternId ?? null,
    r.target?.min ?? null,
    r.target?.max ?? null,
    r.status,
    r.source,
  ];
}

/** Limites de um mês local em UTC: [início, início do mês seguinte). month = 1–12. */
function monthRange(year: number, month: number): [string, string] {
  return [new Date(year, month - 1, 1).toISOString(), new Date(year, month, 1).toISOString()];
}

/** Limites de um dia local ("YYYY-MM-DD") em UTC. */
function dayRange(dateKey: string): [string, string] {
  const [y, m, d] = dateKey.split('-').map(Number);
  return [new Date(y, m - 1, d).toISOString(), new Date(y, m - 1, d + 1).toISOString()];
}

export type ListOptions = { context?: MealContext; order?: 'asc' | 'desc' };

export const readingsRepository = {
  /** Grava uma leitura já classificada (status e meta calculados por buildReading). */
  async create(reading: GlucoseReading): Promise<GlucoseReading> {
    const now = new Date().toISOString();
    await getDatabase().runAsync(
      `INSERT INTO readings (id, ${MUTABLE.join(', ')}, created_at, updated_at)
       VALUES (?, ${MUTABLE.map(() => '?').join(', ')}, ?, ?)`,
      [reading.id, ...toParams(reading), now, now],
    );
    return { ...reading, timestamp: toUtc(reading.timestamp) };
  },

  /** Substitui os dados da leitura (reclassificação fica a cargo de quem chama). */
  async update(reading: GlucoseReading): Promise<void> {
    await getDatabase().runAsync(
      `UPDATE readings SET ${MUTABLE.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
      [...toParams(reading), new Date().toISOString(), reading.id],
    );
  },

  /**
   * Importação em lote numa transação. Pula a leitura se já existir outra no
   * mesmo minuto com o mesmo valor (duplicata). Retorna quantas entraram.
   */
  async createMany(readings: GlucoseReading[]): Promise<number> {
    const now = new Date().toISOString();
    let inserted = 0;
    await runInTransaction(async () => {
      for (const reading of readings) {
        const measuredAt = toUtc(reading.timestamp);
        const { changes } = await getDatabase().runAsync(
          `INSERT INTO readings (id, ${MUTABLE.join(', ')}, created_at, updated_at)
           SELECT ?, ${MUTABLE.map(() => '?').join(', ')}, ?, ?
           WHERE NOT EXISTS (SELECT 1 FROM readings WHERE substr(measured_at, 1, 16) = ? AND value = ?)`,
          [reading.id, ...toParams(reading), now, now, measuredAt.slice(0, 16), reading.value],
        );
        inserted += changes;
      }
    });
    return inserted;
  },

  /** Minuto (UTC, "YYYY-MM-DDTHH:MM") e valor das leituras de [from, to): detecção de duplicatas. */
  async listMinuteKeys(from: string, to: string): Promise<{ minute: string; value: number }[]> {
    return getDatabase().getAllAsync<{ minute: string; value: number }>(
      'SELECT substr(measured_at, 1, 16) AS minute, value FROM readings WHERE measured_at >= ? AND measured_at < ?',
      [toUtc(from), toUtc(to)],
    );
  },

  async remove(id: string): Promise<void> {
    await getDatabase().runAsync('DELETE FROM readings WHERE id = ?', [id]);
  },

  async getById(id: string): Promise<GlucoseReading | null> {
    const row = await getDatabase().getFirstAsync<ReadingRow>('SELECT * FROM readings WHERE id = ?', [id]);
    return row ? fromRow(row) : null;
  },

  async getLatest(): Promise<GlucoseReading | null> {
    const row = await getDatabase().getFirstAsync<ReadingRow>(
      'SELECT * FROM readings ORDER BY measured_at DESC LIMIT 1',
      [],
    );
    return row ? fromRow(row) : null;
  },

  async listRecent(limit: number): Promise<GlucoseReading[]> {
    const rows = await getDatabase().getAllAsync<ReadingRow>(
      'SELECT * FROM readings ORDER BY measured_at DESC LIMIT ?',
      [limit],
    );
    return rows.map(fromRow);
  },

  /** Histórico paginado por mês local (month = 1–12). */
  async listByMonth(year: number, month: number, opts: ListOptions = {}): Promise<GlucoseReading[]> {
    const [from, to] = monthRange(year, month);
    const params: SqlValue[] = [from, to];
    let where = 'measured_at >= ? AND measured_at < ?';
    if (opts.context) {
      where += ' AND context = ?';
      params.push(opts.context);
    }
    const order = opts.order === 'asc' ? 'ASC' : 'DESC';
    const rows = await getDatabase().getAllAsync<ReadingRow>(
      `SELECT * FROM readings WHERE ${where} ORDER BY measured_at ${order}`,
      params,
    );
    return rows.map(fromRow);
  },

  /** Meses com leituras, do mais recente ao mais antigo (seletor de mês). */
  async countByMonth(): Promise<{ month: string; total: number }[]> {
    return getDatabase().getAllAsync<{ month: string; total: number }>(
      `SELECT strftime('%Y-%m', measured_at, 'localtime') AS month, COUNT(*) AS total
       FROM readings GROUP BY month ORDER BY month DESC`,
      [],
    );
  },

  async listForDay(dateKey: string): Promise<GlucoseReading[]> {
    const [from, to] = dayRange(dateKey);
    const rows = await getDatabase().getAllAsync<ReadingRow>(
      'SELECT * FROM readings WHERE measured_at >= ? AND measured_at < ? ORDER BY measured_at ASC',
      [from, to],
    );
    return rows.map(fromRow);
  },

  /** Leituras de [from, to) (ISO), em ordem de horário (curva glicêmica). */
  async listRange(from: string, to: string): Promise<GlucoseReading[]> {
    const rows = await getDatabase().getAllAsync<ReadingRow>(
      'SELECT * FROM readings WHERE measured_at >= ? AND measured_at < ? ORDER BY measured_at ASC',
      [toUtc(from), toUtc(to)],
    );
    return rows.map(fromRow);
  },

  /** Estatísticas de [from, to) (ISO). */
  async statsForRange(from: string, to: string): Promise<PeriodStats> {
    const rows = await getDatabase().getAllAsync<Pick<ReadingRow, 'value' | 'status' | 'measured_at'>>(
      'SELECT value, status, measured_at FROM readings WHERE measured_at >= ? AND measured_at < ?',
      [toUtc(from), toUtc(to)],
    );
    return computeStats(rows.map((r) => ({ value: r.value, status: r.status, timestamp: r.measured_at })));
  },
};
