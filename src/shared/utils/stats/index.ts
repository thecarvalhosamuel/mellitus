import type { GlucoseReading, GlucoseStatus } from '@/shared/types/reading';

type StatsInput = Pick<GlucoseReading, 'value' | 'status' | 'timestamp'>;

export type Extreme = { value: number; timestamp: string };

export type TimeInRange = {
  /** Frações de 0 a 1; somam 1 quando há leituras. */
  below: number;
  inRange: number;
  above: number;
};

export type PeriodStats = {
  count: number;
  mean: number | null;
  /** Desvio-padrão populacional (variabilidade "±18"). */
  sd: number | null;
  /** Coeficiente de variação (sd / média). */
  cv: number | null;
  min: Extreme | null;
  max: Extreme | null;
  tir: TimeInRange;
  byStatus: Record<GlucoseStatus, number>;
};

const BELOW: GlucoseStatus[] = ['severe-hypo', 'hypo', 'below-target'];
const ABOVE: GlucoseStatus[] = ['above-target', 'severe-hyper'];

const emptyByStatus = (): Record<GlucoseStatus, number> => ({
  'severe-hypo': 0,
  hypo: 0,
  'below-target': 0,
  'in-range': 0,
  'above-target': 0,
  'severe-hyper': 0,
});

/**
 * Estatísticas de um período (DESIGN.md §6.1). TIR = leituras "No Alvo" / total.
 * Abaixo = hipo severa + hipo leve + abaixo da meta; acima = acima da meta + hiper severa.
 * Em empate de mínima/máxima, vale a leitura mais antiga.
 */
export function computeStats(readings: StatsInput[]): PeriodStats {
  const byStatus = emptyByStatus();
  if (readings.length === 0) {
    return { count: 0, mean: null, sd: null, cv: null, min: null, max: null, tir: { below: 0, inRange: 0, above: 0 }, byStatus };
  }

  const sorted = [...readings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  let sum = 0;
  let min = sorted[0];
  let max = sorted[0];
  for (const reading of sorted) {
    sum += reading.value;
    byStatus[reading.status] += 1;
    if (reading.value < min.value) min = reading;
    if (reading.value > max.value) max = reading;
  }

  const count = sorted.length;
  const mean = sum / count;
  const sd = Math.sqrt(sorted.reduce((acc, r) => acc + (r.value - mean) ** 2, 0) / count);
  const share = (statuses: GlucoseStatus[]) => statuses.reduce((acc, s) => acc + byStatus[s], 0) / count;

  return {
    count,
    mean,
    sd,
    cv: mean > 0 ? sd / mean : null,
    min: { value: min.value, timestamp: min.timestamp },
    max: { value: max.value, timestamp: max.timestamp },
    tir: { below: share(BELOW), inRange: byStatus['in-range'] / count, above: share(ABOVE) },
    byStatus,
  };
}
