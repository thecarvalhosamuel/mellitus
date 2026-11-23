import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

import { NewReadingButton } from './components/newReadingButton';

// Seções do Início (última leitura, ciclo, curva, recentes) entram nas etapas 7 e 9.
export function HomeScreen() {
  return (
    <>
      <ScreenContainer bottomInset={72}>
        <EmptyState
          icon="water-drop"
          title="Nenhuma medição ainda"
          description="Registre sua primeira glicemia para acompanhar sua rotina por aqui."
        />
        {__DEV__ && (
          <Button label="Catálogo de componentes" variant="ghost" icon="widgets" onPress={() => router.push('/dev')} />
        )}
      </ScreenContainer>
      <NewReadingButton onPress={() => router.push('/newReading')} />
    </>
  );
}
