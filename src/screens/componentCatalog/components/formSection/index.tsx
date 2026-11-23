import { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { NumericField } from '@/components/ui/numericField';
import { SegmentedControl } from '@/components/ui/segmentedControl';
import { TextField } from '@/components/ui/textField';
import { ToggleRow } from '@/components/ui/toggleRow';

import { CatalogSection } from '../catalogSection';

export function FormSection() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [min, setMin] = useState<number | undefined>(80);
  const [max, setMax] = useState<number | undefined>(130);
  const [alarms, setAlarms] = useState(true);
  const [window, setWindow] = useState<1 | 2>(2);

  return (
    <CatalogSection title="Campos e controles">
      <Card>
        <TextField label="Nome do Padrão" value={name} onChangeText={setName} placeholder="Ex: Treino Noturno" />
        <TextField label="Nota" value={note} onChangeText={setNote} placeholder="Café com leite desnatado" multiline />
        <View className="flex-row gap-sm">
          <View className="flex-1">
            <NumericField label="Mínimo" prefix="Mín:" value={min} onChange={setMin} />
          </View>
          <View className="flex-1">
            <NumericField
              label="Máximo"
              prefix="Máx:"
              value={max}
              onChange={setMax}
              error={min !== undefined && max !== undefined && max <= min ? 'Precisa ser maior que o mínimo' : undefined}
            />
          </View>
        </View>
        <SegmentedControl
          accessibilityLabel="Janela de medição pós-refeição"
          options={[
            { value: 1, label: '1 Hora' },
            { value: 2, label: '2 Horas (Recomendado)' },
          ]}
          value={window}
          onChange={setWindow}
        />
        <ToggleRow
          icon="notifications-active"
          title="Alarmes nos horários"
          description="Toque discreto + vibração, adiar 10 min"
          value={alarms}
          onValueChange={setAlarms}
        />
      </Card>
    </CatalogSection>
  );
}
