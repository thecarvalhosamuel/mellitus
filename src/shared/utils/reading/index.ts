import type { ClinicalPattern } from '@/shared/types/pattern';
import type { CycleDay, GlucoseReading, MealContext, ReadingSource } from '@/shared/types/reading';
import { classifyReading } from '@/shared/utils/glucose';

export type ReadingInput = {
  value: number;
  timestamp: string;
  context: MealContext;
  note?: string;
  insulinUnits?: number;
  isCorrection?: boolean;
  cycleDay?: CycleDay;
  cycleSlot?: { index: number; total: number };
  source?: ReadingSource;
};

/**
 * Monta a leitura classificada com o padrão vigente: status, meta (snapshot)
 * e o id do padrão ficam gravados junto, para o histórico não mudar depois.
 */
export function buildReading(
  id: string,
  input: ReadingInput,
  pattern: Pick<ClinicalPattern, 'id' | 'fasting' | 'postprandial' | 'bedtime' | 'alerts'>,
): GlucoseReading {
  const { status, target } = classifyReading(input.value, input.context, pattern);
  const note = input.note?.trim();
  return {
    id,
    value: input.value,
    timestamp: new Date(input.timestamp).toISOString(),
    context: input.context,
    ...(note && { note }),
    ...(input.insulinUnits !== undefined && { insulinUnits: input.insulinUnits }),
    ...(input.isCorrection && { isCorrection: true }),
    ...(input.cycleDay && { cycleDay: input.cycleDay }),
    ...(input.cycleSlot && { cycleSlot: input.cycleSlot }),
    patternId: pattern.id,
    target,
    status,
    source: input.source ?? 'manual',
  };
}
