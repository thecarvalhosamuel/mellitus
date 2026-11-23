import { ScreenContainer } from '@/components/layout/screenContainer';
import { EmptyState } from '@/components/ui/emptyState';

// Lista por dia, mês, filtros e exportação entram na etapa 8.
export function HistoryScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="calendar-month"
        title="Seu histórico aparece aqui"
        description="Cada medição registrada fica organizada por dia e por mês, pronta para levar à consulta."
      />
    </ScreenContainer>
  );
}
