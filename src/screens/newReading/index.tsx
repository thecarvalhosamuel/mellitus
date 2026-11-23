import { router } from 'expo-router';
import { Text } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';

// Valor, momento da leitura e salvar entram na etapa 7.
export function NewReadingScreen() {
  return (
    <BottomSheet visible onClose={() => router.back()} title="Registrar Glicemia">
      <Text className="pb-md font-regular text-body-md text-text-secondary">
        Em breve você vai registrar sua glicemia por aqui, em poucos segundos.
      </Text>
    </BottomSheet>
  );
}
