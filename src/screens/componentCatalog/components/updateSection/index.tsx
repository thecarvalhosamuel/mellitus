import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { useUpdateStore } from '@/stores/update';

import { CatalogSection } from '../catalogSection';

/** Abre a tela de atualização com uma versão fictícia (só desenvolvimento). */
export function UpdateSection() {
  const simulate = () => {
    useUpdateStore.getState().simulate();
    router.push('/update');
  };

  return (
    <CatalogSection title="Atualização">
      <Button label="Simular atualização" icon="system-update" variant="secondary" fullWidth onPress={simulate} />
    </CatalogSection>
  );
}
