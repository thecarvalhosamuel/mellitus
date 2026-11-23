import { Text, View } from 'react-native';

import { StatusBadge } from '@/components/glucose/statusBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SubBlock } from '@/components/ui/subBlock';
import type { GlucoseStatus } from '@/shared/types/reading';

import { CatalogSection } from '../catalogSection';

const STATUSES: GlucoseStatus[] = ['in-range', 'below-target', 'above-target', 'hypo', 'severe-hypo', 'severe-hyper'];

export function DisplaySection() {
  return (
    <CatalogSection title="Cards e badges">
      <Card status="inRange">
        <Text className="font-semibold text-label-md text-text-muted">ÚLTIMA LEITURA</Text>
        <View className="flex-row items-end gap-xs">
          <Text className="font-bold text-display-numeric text-status-in-range-value tabular-nums">104</Text>
          <Text className="mb-xs font-medium text-body-md text-text-muted">mg/dL</Text>
        </View>
        <SubBlock>
          <Text className="font-semibold text-label-md text-text-secondary">Média Mensal</Text>
          <Text className="font-bold text-headline-sm text-text-strong tabular-nums">112 mg/dL</Text>
        </SubBlock>
      </Card>
      <Card variant="highlight">
        <Text className="font-bold text-headline-sm text-text-strong">Card de destaque</Text>
        <Badge label="Hoje: Dia A (Intensivo - 3x)" tone="primary" />
      </Card>
      <View className="flex-row flex-wrap gap-sm">
        {STATUSES.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-sm">
        <Badge label="Jejum" uppercase />
        <Badge label="Recomendado" tone="primary" uppercase />
        <Badge label="Ativo" tone="inRange" dot />
      </View>
    </CatalogSection>
  );
}
