import { Badge } from '@/components/ui/badge';
import type { IconName } from '@/components/ui/icon';
import { GLUCOSE_STATUS } from '@/shared/constants/glucose';
import type { GlucoseStatus } from '@/shared/types/reading';

type StatusBadgeProps = { status: GlucoseStatus };

const arrow: Record<GlucoseStatus, IconName | undefined> = {
  'severe-hypo': 'keyboard-double-arrow-down',
  hypo: 'arrow-downward',
  'below-target': 'arrow-downward',
  'in-range': undefined,
  'above-target': 'arrow-upward',
  'severe-hyper': 'keyboard-double-arrow-up',
};

/** "● No Alvo", "↑ Acima da Meta", "↓ Hipo Leve": direção por seta + texto, nunca só por cor. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, family } = GLUCOSE_STATUS[status];
  return <Badge label={label} tone={family} icon={arrow[status]} dot={status === 'in-range'} />;
}
