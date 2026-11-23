import { GLUCOSE_LIMITS } from '@/shared/constants/glucose';
import type { PatternTargets } from '@/shared/types/pattern';
import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { classifyReading } from '@/shared/utils/glucose';
import { computeStats, type TimeInRange } from '@/shared/utils/stats';

export type PatternField = 'name' | 'fasting' | 'postprandial' | 'bedtime' | 'hypo' | 'hyper';

export type PatternDraftValues = PatternTargets & { name: string };

const inLimits = (value: number | undefined) =>
  value === undefined || (value >= GLUCOSE_LIMITS.manualMin && value <= GLUCOSE_LIMITS.manualMax);

function rangeError(range: TargetRange, required: 'min' | 'max' | 'both' | 'none'): string | undefined {
  const { min, max } = range;
  if ((required === 'both' || required === 'min') && min === undefined) return 'Informe o mínimo.';
  if ((required === 'both' || required === 'max') && max === undefined) return 'Informe o máximo.';
  if (!inLimits(min) || !inLimits(max)) return 'Use valores entre 40 e 450 mg/dL.';
  if (min !== undefined && max !== undefined && min >= max) return 'O máximo precisa ser maior que o mínimo.';
  return undefined;
}

/**
 * Coerência do padrão personalizado: só checa lógica (faixas válidas e alertas
 * fora das metas). Os valores clínicos em si são decisão do usuário e do médico.
 */
export function validatePatternDraft(draft: PatternDraftValues): Partial<Record<PatternField, string>> {
  const errors: Partial<Record<PatternField, string>> = {};
  const name = draft.name.trim();
  if (name === '') errors.name = 'Dê um nome ao padrão.';
  else if (name.length > 60) errors.name = 'Use até 60 caracteres.';

  const fasting = rangeError(draft.fasting, 'both');
  if (fasting) errors.fasting = fasting;
  const post = rangeError(draft.postprandial, 'max');
  if (post) errors.postprandial = post;
  const bedtime = rangeError(draft.bedtime, 'none');
  if (bedtime) errors.bedtime = bedtime;

  const { hypo, hyper } = draft.alerts;
  const lowestMin = Math.min(...[draft.fasting.min, draft.bedtime.min].filter((v): v is number => v !== undefined));
  const highestMax = Math.max(
    ...[draft.fasting.max, draft.postprandial.max, draft.bedtime.max].filter((v): v is number => v !== undefined),
  );

  if (!Number.isFinite(hypo) || hypo < GLUCOSE_LIMITS.severeHypo) errors.hypo = `Use um valor a partir de ${GLUCOSE_LIMITS.severeHypo}.`;
  else if (Number.isFinite(lowestMin) && hypo > lowestMin) errors.hypo = 'O alerta de hipo precisa ficar abaixo das metas mínimas.';

  if (!Number.isFinite(hyper) || hyper > GLUCOSE_LIMITS.manualMax) errors.hyper = 'Use um valor até 450.';
  else if (Number.isFinite(highestMax) && hyper < highestMax) errors.hyper = 'O alerta de hiper precisa ficar acima das metas máximas.';

  return errors;
}

/**
 * Simulação de faixa (TIR) ao vivo (DESIGN.md §4.6): reclassifica as leituras
 * recentes com as metas em edição, sem tocar no histórico gravado.
 */
export function simulateTimeInRange(
  readings: Pick<GlucoseReading, 'value' | 'context' | 'timestamp'>[],
  targets: PatternTargets,
): { count: number; tir: TimeInRange } {
  const reclassified = readings.map((r) => ({
    value: r.value,
    timestamp: r.timestamp,
    status: classifyReading(r.value, r.context, targets).status,
  }));
  const stats = computeStats(reclassified);
  return { count: stats.count, tir: stats.tir };
}
