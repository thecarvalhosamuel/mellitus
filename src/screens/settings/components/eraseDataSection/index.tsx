import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type EraseDataSectionProps = { erasing: boolean; onErase: () => void };

/** Zona de dados: apagar tudo e recomeçar como recém-instalado. */
export function EraseDataSection({ erasing, onErase }: EraseDataSectionProps) {
  return (
    <Card>
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
          Dados do aparelho
        </Text>
        <Text className="font-regular text-body-sm text-text-secondary">
          Apaga leituras, padrões criados por você, anexos e configurações. O app volta ao início, como recém-instalado.
        </Text>
      </View>
      <Button
        label="Apagar todos os dados"
        icon="delete-forever"
        variant="danger"
        fullWidth
        onPress={onErase}
        loading={erasing}
        loadingLabel="Apagando…"
        accessibilityHint="Pede confirmação duas vezes antes de apagar"
      />
    </Card>
  );
}
