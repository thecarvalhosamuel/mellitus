import { router } from 'expo-router';
import { useEffect } from 'react';

import { useUpdateStore } from '@/stores/update';

/**
 * Ao abrir o app (já com o onboarding feito), procura uma versão nova em segundo plano.
 * Se houver e o usuário não tiver pulado hoje, abre a tela de atualização.
 * O store garante uma busca por sessão, mesmo se o efeito rodar de novo.
 */
export function useUpdateCheck(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    void useUpdateStore
      .getState()
      .check()
      .then((prompt) => {
        if (prompt) router.push('/update');
      })
      .catch(() => undefined);
  }, [enabled]);
}
