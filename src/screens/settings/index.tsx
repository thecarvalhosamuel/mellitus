import { ScreenContainer } from '@/components/layout/screenContainer';
import { EmptyState } from '@/components/ui/emptyState';

// Frequência, lembretes, exportação e aparência entram nas etapas 11 e 12.
export function SettingsScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        icon="tune"
        title="Rotina e Alertas"
        description="Aqui você vai ajustar a frequência das medições, os lembretes e a aparência do app."
      />
    </ScreenContainer>
  );
}
