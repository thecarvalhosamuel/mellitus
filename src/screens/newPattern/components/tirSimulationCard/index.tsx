import { Text, View } from 'react-native';

import { TimeInRangeBar } from '@/components/glucose/timeInRangeBar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TIR_GOAL } from '@/shared/constants/glucose';
import { formatPercent } from '@/shared/utils/format';
import type { TimeInRange } from '@/shared/utils/stats';

type TirSimulationCardProps = { count: number; tir: TimeInRange };

/** Simulação ao vivo: como as leituras dos últimos 30 dias ficariam com estas metas. */
export function TirSimulationCard({ count, tir }: TirSimulationCardProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between gap-sm">
        <Text accessibilityRole="header" className="flex-1 font-bold text-headline-sm text-text-strong">
          Simulação de Faixa (TIR)
        </Text>
        {count > 0 && (
          <Badge label={`${formatPercent(tir.inRange)} no alvo`} tone={tir.inRange > TIR_GOAL ? 'inRange' : 'offTarget'} />
        )}
      </View>
      {count === 0 ? (
        <Text className="font-regular text-body-sm text-text-secondary">
          Sem leituras nos últimos 30 dias para simular. A prévia aparece assim que houver registros.
        </Text>
      ) : (
        <>
          <Text className="font-regular text-body-sm text-text-secondary">
            Suas {count} leituras dos últimos 30 dias, classificadas com estas metas. O histórico não muda.
          </Text>
          <TimeInRangeBar tir={tir} />
        </>
      )}
    </Card>
  );
}
