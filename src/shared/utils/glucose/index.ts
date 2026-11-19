import { GLUCOSE_LIMITS, GLUCOSE_STATUS, RANGE_BAR_SCALE } from '@/shared/constants/glucose';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { GlucoseAlerts, PatternTargets } from '@/shared/types/pattern';
import type { GlucoseStatus, MealContext, StatusFamily, TargetRange } from '@/shared/types/reading';

const isEmptyRange = (range: TargetRange) => range.min === undefined && range.max === undefined;

/**
 * Meta do padrão para o momento da leitura. Se a faixa do contexto estiver vazia
 * (ex.: padrão sem meta ao deitar), usa a faixa de jejum.
 */
export function getTargetForContext(pattern: PatternTargets, context: MealContext): TargetRange {
  const kind = READING_CONTEXTS[context].targetKind;
  const range =
    kind === 'postprandial'
      ? { min: pattern.postprandial.min, max: pattern.postprandial.max }
      : pattern[kind];
  const chosen = isEmptyRange(range) ? pattern.fasting : range;
  return { ...(chosen.min !== undefined && { min: chosen.min }), ...(chosen.max !== undefined && { max: chosen.max }) };
}

/** Classificação de uma leitura (DESIGN.md §6.1). Perigo tem precedência sobre a meta. */
export function classifyGlucose(
  value: number,
  target: TargetRange,
  alerts: Pick<GlucoseAlerts, 'hypo' | 'hyper'>,
): GlucoseStatus {
  if (value < GLUCOSE_LIMITS.severeHypo) return 'severe-hypo';
  if (value < alerts.hypo) return 'hypo';
  if (value > alerts.hyper) return 'severe-hyper';
  if (target.min !== undefined && value < target.min) return 'below-target';
  if (target.max !== undefined && value > target.max) return 'above-target';
  return 'in-range';
}

/** Classifica com o padrão ativo e devolve também a meta usada (snapshot gravado na leitura). */
export function classifyReading(
  value: number,
  context: MealContext,
  pattern: PatternTargets,
): { status: GlucoseStatus; target: TargetRange } {
  const target = getTargetForContext(pattern, context);
  return { status: classifyGlucose(value, target, pattern.alerts), target };
}

export function getStatusFamily(status: GlucoseStatus): StatusFamily {
  return GLUCOSE_STATUS[status].family;
}

export function isValidManualValue(value: number): boolean {
  return Number.isInteger(value) && value >= GLUCOSE_LIMITS.manualMin && value <= GLUCOSE_LIMITS.manualMax;
}

export function clampManualValue(value: number): number {
  return Math.min(GLUCOSE_LIMITS.manualMax, Math.max(GLUCOSE_LIMITS.manualMin, Math.round(value)));
}

export type RangeZone = {
  family: StatusFamily;
  from: number;
  to: number;
  /** Largura proporcional na escala fixa 40–300 (0–1). */
  width: number;
};

const scalePosition = (value: number) => {
  const { min, max } = RANGE_BAR_SCALE;
  return (Math.min(max, Math.max(min, value)) - min) / (max - min);
};

/**
 * 5 zonas da barra de faixa glicêmica calculadas do padrão e do contexto (DESIGN.md §4.6):
 * hipo · abaixo da meta · alvo · acima da meta · hiper. Zonas vazias são omitidas.
 */
export function getRangeZones(target: TargetRange, alerts: Pick<GlucoseAlerts, 'hypo' | 'hyper'>): RangeZone[] {
  const { min: scaleMin, max: scaleMax } = RANGE_BAR_SCALE;
  const low = target.min ?? alerts.hypo;
  const high = target.max ?? alerts.hyper;
  const edges: [StatusFamily, number, number][] = [
    ['danger', scaleMin, alerts.hypo],
    ['offTarget', alerts.hypo, low],
    ['inRange', low, high],
    ['offTarget', high, alerts.hyper],
    ['danger', alerts.hyper, scaleMax],
  ];
  return edges
    .map(([family, from, to]) => ({ family, from, to, width: scalePosition(to) - scalePosition(from) }))
    .filter((zone) => zone.width > 0);
}

/** Posição do pip da leitura na barra (0–1), limitada à escala 40–300. */
export function getRangePosition(value: number): number {
  return scalePosition(value);
}
