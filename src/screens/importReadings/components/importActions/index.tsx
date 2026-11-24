import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';

type ImportActionsProps = { count: number; disabled: boolean; importing: boolean; onConfirm: () => void; onCancel: () => void };

/** "Importar N leituras" / "Cancelar". */
export function ImportActions({ count, disabled, importing, onConfirm, onCancel }: ImportActionsProps) {
  return (
    <View className="gap-sm">
      <GradientButton
        label={count === 1 ? 'Importar 1 leitura' : `Importar ${count} leituras`}
        icon="file-upload"
        onPress={onConfirm}
        disabled={disabled || count === 0}
        loading={importing}
        loadingLabel="Importando…"
      />
      <Button label="Cancelar" variant="ghost" fullWidth onPress={onCancel} disabled={importing} />
    </View>
  );
}
