import { Text, View } from 'react-native';

import { TimeField } from '@/components/ui/timeField';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { DayPlan } from '@/shared/types/schedule';

type MomentTimesProps = {
  title: string;
  plan?: DayPlan;
  onTimeChange: (index: number, time: string) => void;
};

/** Momentos de um dia com horário editável ("Jejum 07:00 · Pós-almoço 14:00…"). */
export function MomentTimes({ title, plan, onTimeChange }: MomentTimesProps) {
  if (!plan) return null;

  return (
    <View className="gap-sm rounded border border-inset-border bg-inset p-3">
      <Text className="font-bold text-label-md text-text-strong">
        {title} · {plan.moments.length}x ao dia
      </Text>
      {plan.moments.map((moment, index) => {
        const label = READING_CONTEXTS[moment.context].label;
        return (
          <View key={`${moment.context}-${index}`} className="flex-row items-center justify-between gap-sm">
            <Text className="flex-1 font-medium text-body-md text-text-secondary">{label}</Text>
            <TimeField compact label={`${title}, ${label}`} value={moment.time ?? '07:00'} onChange={(t) => onTimeChange(index, t)} />
          </View>
        );
      })}
    </View>
  );
}
