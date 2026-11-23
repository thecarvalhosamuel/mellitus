import { useState } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/shared/hooks/useToast';

import { CatalogSection } from '../catalogSection';

export function OverlaySection() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const toast = useToast();

  return (
    <CatalogSection title="Sheet e toast">
      <View className="flex-row flex-wrap gap-sm">
        <Button label="Abrir sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
        <Button label="Toast sucesso" variant="secondary" onPress={() => toast.success('Registro de 104 mg/dL salvo com sucesso!')} />
        <Button
          label="Toast erro"
          variant="secondary"
          onPress={() => toast.error('Não foi possível salvar. Tente de novo.')}
        />
      </View>
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Registrar Glicemia">
        <Text className="font-regular text-body-md text-text-secondary">
          Conteúdo do sheet. Toque fora, no X ou em voltar para fechar.
        </Text>
        <Button label="Salvar Medição" icon="save" fullWidth onPress={() => setSheetOpen(false)} />
      </BottomSheet>
    </CatalogSection>
  );
}
