import { Badge } from '@/components/ui/badge';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { MealContext } from '@/shared/types/reading';

type ContextChipProps = { context: MealContext };

/** "JEJUM", "2H PÓS-REFEIÇÃO"… em chip neutro (DESIGN.md §4.2). */
export function ContextChip({ context }: ContextChipProps) {
  return <Badge label={READING_CONTEXTS[context].chip} />;
}
