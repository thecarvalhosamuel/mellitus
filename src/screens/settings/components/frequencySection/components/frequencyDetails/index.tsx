import { Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/segmentedControl';
import type { FrequencySchedule } from '@/shared/types/schedule';
import { toDateKey } from '@/shared/utils/date';
import { cyclePosition, setMomentTime } from '@/shared/utils/frequency';

import { CustomFrequencyBuilder } from '../customFrequencyBuilder';
import { MomentTimes } from '../momentTimes';

type FrequencyDetailsProps = {
  frequency: FrequencySchedule;
  onChange: (frequency: FrequencySchedule) => void;
  onCyclePositionChange: (position: number) => void;
};

// Onde o ciclo está hoje, por modo. `value` = posição de hoje no ciclo (0 = dia de medir / Dia A).
type StartOption = { value: number; label: string };
const START_OPTIONS: Partial<Record<FrequencySchedule['mode'], { title: string; options: StartOption[] }>> = {
  alternating: {
    title: 'Início da sequência',
    options: [
      { value: 0, label: 'Hoje é Dia A' },
      { value: 1, label: 'Hoje é Dia B' },
    ],
  },
  'every-other-day': {
    title: 'Próxima medição',
    options: [
      { value: 0, label: 'Hoje' },
      { value: 1, label: 'Amanhã' },
    ],
  },
  'every-72h': {
    title: 'Próxima medição',
    options: [
      { value: 0, label: 'Hoje' },
      { value: 2, label: 'Amanhã' },
      { value: 1, label: 'Depois de amanhã' },
    ],
  },
};

/** Detalhe da opção selecionada: horários, início do ciclo ou momentos personalizados. */
export function FrequencyDetails({ frequency, onChange, onCyclePositionChange }: FrequencyDetailsProps) {
  const start = START_OPTIONS[frequency.mode];
  const setTime = (day: 'dayA' | 'dayB') => (index: number, time: string) =>
    onChange(setMomentTime(frequency, day, index, time));

  return (
    <View className="gap-md">
      {(frequency.mode === '3x' || frequency.mode === 'alternating' || frequency.mode === 'every-other-day') && (
        <MomentTimes
          title={frequency.mode === 'alternating' ? 'Dia A (Intensivo)' : 'Dia de medir'}
          plan={frequency.dayA}
          onTimeChange={setTime('dayA')}
        />
      )}
      {(frequency.mode === '1x' || frequency.mode === 'alternating' || frequency.mode === 'every-72h') && (
        <MomentTimes
          title={frequency.mode === 'alternating' ? 'Dia B (Manutenção)' : 'Medição'}
          plan={frequency.dayB}
          onTimeChange={setTime('dayB')}
        />
      )}
      {frequency.mode === 'custom' && (
        <CustomFrequencyBuilder
          count={frequency.customCount}
          moments={frequency.customMoments ?? []}
          onCountChange={(customCount) => onChange({ ...frequency, customCount })}
          onMomentsChange={(customMoments) => onChange({ ...frequency, customMoments })}
        />
      )}
      {start && (
        <View className="gap-sm">
          <Text className="font-semibold text-label-md text-text-secondary">{start.title}</Text>
          <SegmentedControl
            accessibilityLabel={start.title}
            options={start.options}
            value={cyclePosition(frequency, toDateKey(new Date()))}
            onChange={onCyclePositionChange}
          />
        </View>
      )}
    </View>
  );
}
