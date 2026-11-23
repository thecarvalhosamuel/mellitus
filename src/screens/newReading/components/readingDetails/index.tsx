import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { NumericField } from '@/components/ui/numericField';
import { TextField } from '@/components/ui/textField';
import { ToggleRow } from '@/components/ui/toggleRow';

type ReadingDetailsProps = {
  note: string;
  onNoteChange: (note: string) => void;
  insulinUnits: number | undefined;
  onInsulinChange: (units: number | undefined) => void;
  isCorrection: boolean;
  onCorrectionChange: (value: boolean) => void;
};

/** Nota e insulina são opcionais: ficam recolhidas para o registro levar poucos segundos. */
export function ReadingDetails(props: ReadingDetailsProps) {
  const [open, setOpen] = useState(props.note !== '' || props.insulinUnits !== undefined);

  if (!open) {
    return <Button label="Adicionar nota ou insulina" variant="ghost" icon="add" onPress={() => setOpen(true)} />;
  }

  return (
    <View className="gap-md">
      <TextField
        label="Nota (opcional)"
        value={props.note}
        onChangeText={props.onNoteChange}
        placeholder="Ex.: café com leite desnatado"
        maxLength={140}
        multiline
      />
      <NumericField
        label="Insulina (opcional)"
        unit="UI"
        maxLength={2}
        value={props.insulinUnits}
        onChange={props.onInsulinChange}
      />
      {props.insulinUnits !== undefined && (
        <ToggleRow
          title="Dose de correção"
          description="Marque se foi uma correção fora da dose habitual."
          value={props.isCorrection}
          onValueChange={props.onCorrectionChange}
        />
      )}
    </View>
  );
}
