import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TimeField } from '@/components/ui/timeField';
import { ToggleRow } from '@/components/ui/toggleRow';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ReminderSettings } from '@/shared/types/settings';

type RestDay = ReminderSettings['restDay'];

type RestDaySettingsProps = { restDay: RestDay; onChange: (restDay: RestDay) => void };

const DEFAULT_SAFETY_TIME = '10:00';

/** Modo Dia de Descanso (Dia B): menos alertas, lembrete gentil e aviso de segurança. */
export function RestDaySettings({ restDay, onChange }: RestDaySettingsProps) {
  const { colors } = useTheme();
  const set = <K extends keyof RestDay>(key: K) => (value: RestDay[K]) => onChange({ ...restDay, [key]: value });

  return (
    <View className="gap-sm rounded-card border border-inset-border bg-inset p-md">
      <View className="flex-row items-center gap-xs">
        <Icon name="self-improvement" size={20} color={colors.primary} />
        <Text className="flex-1 font-bold text-label-lg text-text-strong">Modo Dia de Descanso (Dia B)</Text>
        <Badge label="Foco em descanso" tone="primary" uppercase />
      </View>
      <ToggleRow
        title="Reduzir alertas"
        description="No Dia B, só o lembrete gentil de jejum."
        value={restDay.reduceAlerts}
        onValueChange={set('reduceAlerts')}
      />
      {restDay.reduceAlerts && (
        <View className="flex-row items-center justify-between gap-sm">
          <Text className="flex-1 font-medium text-body-md text-text-secondary">Lembrete gentil de jejum</Text>
          <TimeField compact label="Lembrete gentil de jejum" value={restDay.gentleFastingTime} onChange={set('gentleFastingTime')} />
        </View>
      )}
      <ToggleRow
        title="Mensagem de incentivo"
        description="Uma palavra gentil no lembrete do dia leve."
        value={restDay.encouragement}
        onValueChange={set('encouragement')}
      />
      <ToggleRow
        title="Aviso de segurança"
        description={`Se nada for registrado até as ${restDay.passiveSafetyAlertAt || DEFAULT_SAFETY_TIME}, um aviso calmo.`}
        value={restDay.passiveSafetyAlertAt !== ''}
        onValueChange={(on) => set('passiveSafetyAlertAt')(on ? DEFAULT_SAFETY_TIME : '')}
      />
    </View>
  );
}
