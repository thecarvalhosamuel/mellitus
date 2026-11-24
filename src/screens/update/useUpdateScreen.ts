import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { currentAppVersion } from '@/services/updates';
import { toast } from '@/shared/hooks/useToast';
import { formatDayMonth } from '@/shared/utils/format';
import { useUpdateStore } from '@/stores/update';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Dados da atualização e as ações: abrir o download ou pular até amanhã (voltar também conta como pular). */
export function useUpdateScreen() {
  const available = useUpdateStore((s) => s.available);
  const skipToday = useUpdateStore((s) => s.skipToday);
  const [opening, setOpening] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const skip = useCallback(async () => {
    setSkipping(true);
    try {
      await skipToday();
    } catch {
      // Sem gravar, o aviso só volta na próxima abertura: não vale interromper o usuário.
    }
    close();
  }, [skipToday]);

  const update = useCallback(async () => {
    if (!available) return;
    setOpening(true);
    try {
      await Linking.openURL(available.downloadUrl);
    } catch {
      toast.error('Não foi possível abrir o download. Tente de novo em instantes.');
    } finally {
      setOpening(false);
    }
  }, [available]);

  // Botão voltar do Android = "Pular por hoje".
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void skip();
      return true;
    });
    return () => sub.remove();
  }, [skip]);

  return {
    available,
    currentVersion: currentAppVersion(),
    publishedLabel: available?.publishedAt ? `Publicada em ${formatDayMonth(available.publishedAt)}` : null,
    opening,
    skipping,
    update: () => void update(),
    skip: () => void skip(),
    close,
  };
}
