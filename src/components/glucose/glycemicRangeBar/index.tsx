import { Text, View } from 'react-native';

import type { GlucoseAlerts } from '@/shared/types/pattern';
import type { StatusFamily, TargetRange } from '@/shared/types/reading';
import { cn } from '@/shared/utils/cn';
import { getRangePosition, getRangeZones } from '@/shared/utils/glucose';

type GlycemicRangeBarProps = {
  target: TargetRange;
  alerts: Pick<GlucoseAlerts, 'hypo' | 'hyper'>;
  value: number;
};

const zoneColor: Record<StatusFamily, string> = {
  inRange: 'bg-status-in-range-base',
  offTarget: 'bg-status-off-target-base',
  danger: 'bg-status-danger-base',
};

const pct = (fraction: number) => `${(fraction * 100).toFixed(2)}%` as const;

/**
 * 5 zonas calculadas do padrão (hipo · abaixo · alvo · acima · hiper) na escala
 * fixa 40–300, limites reais abaixo e pip na posição da leitura (DESIGN.md §4.6).
 */
export function GlycemicRangeBar({ target, alerts, value }: GlycemicRangeBarProps) {
  const zones = getRangeZones(target, alerts);
  const limits = [...new Set([alerts.hypo, target.min, target.max, alerts.hyper])].filter(
    (v): v is number => v !== undefined,
  );
  const pip = getRangePosition(value);
  const low = target.min ?? alerts.hypo;
  const high = target.max ?? alerts.hyper;

  return (
    <View
      accessible
      accessibilityLabel={`Faixa glicêmica: alvo de ${low} a ${high} miligramas por decilitro. Leitura atual ${value}.`}
      className="gap-xs pt-md">
      <View className="relative">
        <View className="h-2.5 flex-row overflow-hidden rounded-full border border-inset-border bg-track">
          {zones.map((zone) => (
            <View
              key={`${zone.family}-${zone.from}`}
              className={cn('h-full', zoneColor[zone.family], zone.family !== 'inRange' && 'opacity-80')}
              style={{ width: pct(zone.width) }}
            />
          ))}
        </View>
        {/* Pip da leitura atual */}
        <View className="absolute -top-3.5 items-center" style={{ left: pct(pip), transform: [{ translateX: -10 }] }}>
          <View className="h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-text-strong" style={{ marginLeft: 4 }} />
        </View>
      </View>
      <View className="relative h-4">
        {limits.map((limit) => (
          <Text
            key={limit}
            className="absolute font-medium text-label-sm text-text-muted tabular-nums"
            style={{ left: pct(getRangePosition(limit)), transform: [{ translateX: -10 }] }}>
            {limit}
          </Text>
        ))}
      </View>
    </View>
  );
}
