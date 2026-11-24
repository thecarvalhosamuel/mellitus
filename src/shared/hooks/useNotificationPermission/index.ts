import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  ensurePermission,
  getNotificationPermission,
  openAppSettings,
  type NotificationPermission,
} from '@/services/notifications';
import { syncReminders } from '@/shared/hooks/useReminderSync';

/**
 * Estado da permissão de notificações, relido ao voltar para o app (ex.: depois
 * de ligar nos ajustes do aparelho). `request` pede ao sistema quando ainda pode;
 * se o sistema não deixa mais perguntar, abre os ajustes do app.
 */
export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | null>(null);

  const refresh = useCallback(async () => {
    const next = await getNotificationPermission().catch(() => null);
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getNotificationPermission()
        .catch(() => null)
        .then((next) => {
          if (alive) setStatus(next);
          return next;
        });
    void load();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void load().then((next) => (next === 'granted' ? syncReminders().catch(() => undefined) : undefined));
      }
    });
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  const request = async (): Promise<NotificationPermission | null> => {
    if (status === 'blocked') {
      await openAppSettings().catch(() => undefined);
      return status;
    }
    const granted = await ensurePermission(true).catch(() => false);
    if (granted) await syncReminders().catch(() => undefined);
    return refresh();
  };

  return { status, request, openSettings: openAppSettings };
}
