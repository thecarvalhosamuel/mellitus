import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';

type FormActionsProps = {
  saving: boolean;
  /** Padrão já ativo: salvar mantém ativo, sem opção de rascunho. */
  isActive: boolean;
  isEdit: boolean;
  onSaveAndActivate: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

/** "Salvar e Ativar" · "Salvar Rascunho" / "Cancelar" · "Excluir" na edição (DESIGN.md §5.4). */
export function FormActions({ saving, isActive, isEdit, onSaveAndActivate, onSaveDraft, onCancel, onDelete }: FormActionsProps) {
  return (
    <View className="gap-sm">
      <GradientButton
        label={isActive ? 'Salvar Alterações' : 'Salvar e Ativar Padrão'}
        icon="check-circle"
        onPress={onSaveAndActivate}
        loading={saving}
      />
      <View className="flex-row gap-sm">
        {!isActive && (
          <View className="flex-1">
            <Button label="Salvar rascunho" variant="secondary" fullWidth onPress={onSaveDraft} disabled={saving} />
          </View>
        )}
        <View className="flex-1">
          <Button label="Cancelar" variant="ghost" fullWidth onPress={onCancel} disabled={saving} />
        </View>
      </View>
      {isEdit && !isActive && <Button label="Excluir padrão" variant="ghost" icon="delete-outline" onPress={onDelete} />}
    </View>
  );
}
