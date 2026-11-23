import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

// Padrões prontos, ativação e card do médico entram na etapa 10.
export function GoalsScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="track-changes"
        title="Padrões de Acompanhamento"
        description="Aqui você vai escolher as metas que orientam gráficos, alertas e relatórios."
        action={
          <Button
            label="Criar Padrão Personalizado"
            variant="outlined"
            icon="add-circle-outline"
            fullWidth
            onPress={() => router.push('/goals/new')}
          />
        }
      />
    </ScreenContainer>
  );
}
