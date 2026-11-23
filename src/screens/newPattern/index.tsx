import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { BackButton } from '@/components/ui/backButton';
import { EmptyState } from '@/components/ui/emptyState';

// Formulário em passos (perfil, alvos, frequência, equipe médica) entra na etapa 10.
export function NewPatternScreen() {
  return (
    <ScreenContainer>
      <BackButton label="Voltar para Metas" onPress={() => router.back()} />
      <EmptyState
        icon="tune"
        title="Novo Padrão Personalizado"
        description="Em breve você poderá definir faixas e rotinas sob medida com seu médico."
      />
    </ScreenContainer>
  );
}
