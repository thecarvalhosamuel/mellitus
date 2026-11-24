import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmentedControl';
import { StepHeader } from '@/components/ui/stepHeader';
import { ToggleRow } from '@/components/ui/toggleRow';
import type { ReminderSettings } from '@/shared/types/settings';

import { RestDaySettings } from './components/restDaySettings';

type RemindersSectionProps = {
  reminders: ReminderSettings;
  onChange: (reminders: ReminderSettings) => void;
  /** O modo Dia B só faz sentido no ciclo alternado. */
  showRestDay: boolean;
};

const TIMER_OPTIONS = [
  { value: 1 as const, label: '1 hora (gestacional)' },
  { value: 2 as const, label: '2 horas (padrão)' },
];

/** Passo 2 — Lembretes e notificações (DESIGN.md §5.5). */
export function RemindersSection({ reminders, onChange, showRestDay }: RemindersSectionProps) {
  const set = <K extends keyof ReminderSettings>(key: K) => (value: ReminderSettings[K]) => onChange({ ...reminders, [key]: value });

  return (
    <Card>
      <StepHeader step={2} title="Lembretes e Notificações" />
      <ToggleRow
        icon="alarm"
        title="Alarmes nos horários"
        description="Toque discreto e vibração, com opção de adiar 10 min."
        value={reminders.alarmsEnabled}
        onValueChange={set('alarmsEnabled')}
      />
      {reminders.alarmsEnabled && (
        <>
          <View className="gap-sm">
            <Text className="font-semibold text-label-md text-text-secondary">Timer pós-refeição</Text>
            <Text className="font-regular text-body-sm text-text-muted">
              Começa quando você registra uma medição antes da refeição.
            </Text>
            <SegmentedControl
              accessibilityLabel="Timer pós-refeição"
              options={TIMER_OPTIONS}
              value={reminders.postMealTimerHours}
              onChange={set('postMealTimerHours')}
            />
          </View>
          <ToggleRow
            icon="event-repeat"
            title="Lembretes adaptativos ao ciclo"
            description="Alarmes só nos momentos do dia do ciclo."
            value={reminders.adaptiveToCycle}
            onValueChange={set('adaptiveToCycle')}
          />
          {showRestDay && reminders.adaptiveToCycle && (
            <RestDaySettings restDay={reminders.restDay} onChange={set('restDay')} />
          )}
        </>
      )}
    </Card>
  );
}
