import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { NumericField } from '@/components/ui/numericField';
import { ToggleRow } from '@/components/ui/toggleRow';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseAlerts } from '@/shared/types/pattern';
import type { PatternField } from '@/shared/utils/pattern';

type CriticalAlertsProps = {
  alerts: GlucoseAlerts;
  onChange: (alerts: GlucoseAlerts) => void;
  errors: Partial<Record<PatternField, string>>;
};

/** Limites de urgência: hipo e hiper severa, com estilo de perigo (DESIGN.md §5.4 e §10.6). */
export function CriticalAlerts({ alerts, onChange, errors }: CriticalAlertsProps) {
  const { colors } = useTheme();

  return (
    <View className="gap-sm rounded-card border border-status-danger-border bg-status-danger-bg p-md">
      <View className="flex-row items-center gap-xs">
        <Icon name="crisis-alert" size={20} color={colors.status.danger.fg} />
        <Text className="font-bold text-label-lg text-status-danger-fg">Limites de alerta</Text>
      </View>
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <NumericField
            label="Hipoglicemia"
            prefix="<"
            value={Number.isFinite(alerts.hypo) ? alerts.hypo : undefined}
            onChange={(hypo) => onChange({ ...alerts, hypo: hypo ?? Number.NaN })}
            error={errors.hypo}
          />
        </View>
        <View className="flex-1">
          <NumericField
            label="Hiperglicemia severa"
            prefix=">"
            value={Number.isFinite(alerts.hyper) ? alerts.hyper : undefined}
            onChange={(hyper) => onChange({ ...alerts, hyper: hyper ?? Number.NaN })}
            error={errors.hyper}
          />
        </View>
      </View>
      <ToggleRow
        title="Alarme de hipo com prioridade máxima"
        description="Alerta sonoro, passando pelo Não Perturbe quando o sistema permitir."
        value={alerts.hypoBypassDND}
        onValueChange={(hypoBypassDND) => onChange({ ...alerts, hypoBypassDND })}
      />
    </View>
  );
}
