import { Card } from '@/components/ui/card';
import { SelectField } from '@/components/ui/selectField';
import { StepHeader } from '@/components/ui/stepHeader';
import { TextField } from '@/components/ui/textField';
import { PATTERN_CONDITIONS } from '@/shared/constants/patternConditions';
import type { PatternCondition } from '@/shared/types/pattern';

type ProfileStepProps = {
  name: string;
  onNameChange: (name: string) => void;
  condition?: PatternCondition;
  onConditionChange: (condition: PatternCondition) => void;
  nameError?: string;
};

/** ① Identificação do Perfil (DESIGN.md §5.4). */
export function ProfileStep({ name, onNameChange, condition, onConditionChange, nameError }: ProfileStepProps) {
  return (
    <Card>
      <StepHeader step={1} title="Identificação do Perfil" />
      <TextField
        label="Nome do padrão"
        value={name}
        onChangeText={onNameChange}
        placeholder="Ex.: Treino noturno, pós-cirúrgico…"
        maxLength={60}
        error={nameError}
      />
      <SelectField
        label="Condição ou objetivo clínico"
        value={condition}
        options={PATTERN_CONDITIONS}
        onChange={onConditionChange}
      />
    </Card>
  );
}
