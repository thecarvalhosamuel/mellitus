import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StepHeader } from '@/components/ui/stepHeader';
import { TextField } from '@/components/ui/textField';
import { ToggleRow } from '@/components/ui/toggleRow';

import { AttachmentList, type AttachmentItem } from './components/attachmentList';

type Doctor = { name: string; crm: string; specialty: string; notes: string };

type MedicalTeamStepProps = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  doctor: Doctor;
  onDoctorChange: (d: Doctor) => void;
  attachments: AttachmentItem[];
  onAttach: (source: 'image' | 'document') => void;
};

/** ③ Equipe médica: cadastro manual, instruções e anexos (DESIGN.md §5.4). */
export function MedicalTeamStep({ enabled, onEnabledChange, doctor, onDoctorChange, attachments, onAttach }: MedicalTeamStepProps) {
  const set = (field: keyof Doctor) => (value: string) => onDoctorChange({ ...doctor, [field]: value });

  return (
    <Card>
      <StepHeader step={3} title="Equipe Médica" />
      <ToggleRow
        title="Incluir dados do médico"
        description="Ficam só neste aparelho e aparecem no relatório."
        value={enabled}
        onValueChange={onEnabledChange}
      />
      {enabled && (
        <View className="gap-md">
          <TextField label="Nome" value={doctor.name} onChangeText={set('name')} placeholder="Ex.: Drª Helena Campos" autoCapitalize="words" />
          <View className="flex-row gap-sm">
            <View className="flex-1">
              <TextField label="CRM" value={doctor.crm} onChangeText={set('crm')} placeholder="CRM/SP 000000" autoCapitalize="characters" />
            </View>
            <View className="flex-1">
              <TextField label="Especialidade" value={doctor.specialty} onChangeText={set('specialty')} placeholder="Endocrinologia" />
            </View>
          </View>
          <TextField
            label="Instruções de conduta"
            value={doctor.notes}
            onChangeText={set('notes')}
            placeholder="Orientações combinadas na consulta"
            multiline
            maxLength={500}
          />
          <AttachmentList items={attachments} />
          <View className="flex-row gap-sm">
            <View className="flex-1">
              <Button label="Foto" variant="secondary" icon="photo-camera" fullWidth onPress={() => onAttach('image')} />
            </View>
            <View className="flex-1">
              <Button label="PDF ou imagem" variant="secondary" icon="attach-file" fullWidth onPress={() => onAttach('document')} />
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}
