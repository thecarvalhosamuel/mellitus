import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';
import { IconButton } from '@/components/ui/iconButton';

import { CatalogSection } from '../catalogSection';

export function ButtonsSection() {
  const [loading, setLoading] = useState(false);

  const simulateSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <CatalogSection title="Botões">
      <GradientButton label="Novo Registro de Glicose" icon="water-drop" onPress={simulateSave} loading={loading} />
      <Button label="Salvar Medição" icon="save" fullWidth />
      <View className="flex-row flex-wrap gap-sm">
        <Button label="Secundário" variant="secondary" />
        <Button label="Contorno" variant="outlined" />
        <Button label="Cancelar" variant="ghost" />
      </View>
      <View className="flex-row flex-wrap gap-sm">
        <Button label="Apagar dados" variant="danger" icon="delete" />
        <Button label="Desabilitado" disabled />
      </View>
      <View className="flex-row gap-sm">
        <IconButton icon="close" accessibilityLabel="Fechar" />
        <IconButton icon="remove" accessibilityLabel="Diminuir" variant="tonal" />
        <IconButton icon="add" accessibilityLabel="Aumentar" variant="tonal" />
      </View>
    </CatalogSection>
  );
}
