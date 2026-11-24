import { useEffect } from 'react';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { InfoBanner } from '@/components/ui/infoBanner';

import { ReleaseNotesCard } from './components/releaseNotesCard';
import { UpdateActions } from './components/updateActions';
import { UpdateHero } from './components/updateHero';
import { useUpdateScreen } from './useUpdateScreen';

/** Aviso de versão nova: atualizar agora ou pular por hoje (volta a aparecer em outro dia). */
export function UpdateScreen() {
  const screen = useUpdateScreen();
  const { available, close } = screen;

  // Sem atualização carregada (ex.: rota aberta direto), não há o que mostrar.
  useEffect(() => {
    if (!available) close();
  }, [available, close]);

  if (!available) return null;

  return (
    <ScreenContainer variant="plain">
      <UpdateHero
        currentVersion={screen.currentVersion}
        newVersion={available.version}
        publishedLabel={screen.publishedLabel}
      />
      {available.notes.length > 0 && <ReleaseNotesCard notes={available.notes} />}
      <InfoBanner
        icon="info-outline"
        title="Se preferir atualizar depois"
        description="Você pode continuar usando o app, mas alguns recursos podem não funcionar como esperado até instalar a nova versão."
      />
      <UpdateActions
        opening={screen.opening}
        skipping={screen.skipping}
        onUpdate={screen.update}
        onSkip={screen.skip}
      />
    </ScreenContainer>
  );
}
