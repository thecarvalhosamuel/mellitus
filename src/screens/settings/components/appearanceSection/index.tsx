import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmentedControl';
import { StepHeader } from '@/components/ui/stepHeader';
import type { Appearance } from '@/shared/types/settings';

type AppearanceSectionProps = { value: Appearance; onChange: (value: Appearance) => void };

const OPTIONS = [
  { value: 'system' as const, label: 'Automático' },
  { value: 'light' as const, label: 'Claro' },
  { value: 'dark' as const, label: 'Escuro' },
];

/** Automático (sistema) · Claro · Escuro, aplicado na hora (DESIGN.md §10.6). */
export function AppearanceSection({ value, onChange }: AppearanceSectionProps) {
  return (
    <Card>
      <StepHeader step={3} title="Aparência" />
      <SegmentedControl accessibilityLabel="Aparência" options={OPTIONS} value={value} onChange={onChange} />
    </Card>
  );
}
