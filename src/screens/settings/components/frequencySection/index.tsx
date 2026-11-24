import { Text, View } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SelectableCard } from '@/components/ui/selectableCard';
import { StepHeader } from '@/components/ui/stepHeader';
import { FREQUENCY_LABELS } from '@/shared/constants/frequency';
import type { FrequencyMode, FrequencySchedule } from '@/shared/types/schedule';

import { FrequencyDetails } from './components/frequencyDetails';

type FrequencySectionProps = {
  frequency: FrequencySchedule;
  onModeChange: (mode: FrequencyMode) => void;
  onChange: (frequency: FrequencySchedule) => void;
  onCyclePositionChange: (position: number) => void;
};

const OPTIONS: { mode: FrequencyMode; description: string; badge?: { label: string; tone: BadgeTone } }[] = [
  { mode: '3x', description: 'Controle intensivo padrão', badge: { label: 'Recomendado', tone: 'primary' } },
  { mode: '1x', description: 'Acompanhamento basal em jejum', badge: { label: 'Manutenção', tone: 'neutral' } },
  { mode: 'alternating', description: 'Dia A 3x e Dia B 1x: economia de fitas sem sobrecarga', badge: { label: 'Flexível', tone: 'inRange' } },
  { mode: 'every-other-day', description: '3x no dia de medir, descanso no seguinte' },
  { mode: 'every-72h', description: '1x em jejum a cada 3 dias' },
  { mode: 'custom', description: 'Escolha quantas vezes e em quais momentos', badge: { label: 'Flexível', tone: 'inRange' } },
];

/** Passo 1 — Frequência de controle (DESIGN.md §5.5). */
export function FrequencySection({ frequency, onModeChange, onChange, onCyclePositionChange }: FrequencySectionProps) {
  return (
    <Card>
      <StepHeader step={1} title="Frequência de Controle" />
      <View accessibilityRole="radiogroup" accessibilityLabel="Frequência de controle" className="gap-sm">
        {OPTIONS.map((option) => {
          const selected = option.mode === frequency.mode;
          return (
            <View key={option.mode} className="gap-sm">
              <SelectableCard
                selected={selected}
                onPress={() => onModeChange(option.mode)}
                accessibilityLabel={`${FREQUENCY_LABELS[option.mode]}: ${option.description}`}>
                <View className="flex-row items-center justify-between gap-sm">
                  <Text className="flex-1 font-bold text-label-lg text-text-strong">{FREQUENCY_LABELS[option.mode]}</Text>
                  {option.badge && <Badge label={option.badge.label} tone={option.badge.tone} uppercase />}
                </View>
                <Text className="font-regular text-body-sm text-text-secondary">{option.description}</Text>
              </SelectableCard>
              {/* Fora do card: os campos precisam ser alcançáveis pelo leitor de tela. */}
              {selected && (
                <View className="pl-md">
                  <FrequencyDetails frequency={frequency} onChange={onChange} onCyclePositionChange={onCyclePositionChange} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}
