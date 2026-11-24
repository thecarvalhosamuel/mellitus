import { router } from 'expo-router';
import { useEffect } from 'react';

import {
  configureNotifications,
  ensurePermission,
  onReminderResponse,
  replaceReminderPlan,
  schedulePostMealTimer,
  snoozeNotification,
} from '@/services/notifications';
import type { MealContext } from '@/shared/types/reading';
import { buildReminderPlan } from '@/shared/utils/reminders';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

/** Momentos que disparam o timer pós-refeição ao serem registrados. */
const PRE_MEAL: MealContext[] = ['pre-meal', 'pre-dinner'];

/**
 * Recalcula e reagenda os lembretes dos próximos 7 dias com as configurações e
 * as leituras de hoje. Não pede permissão: sem permissão, não faz nada.
 */
export async function syncReminders(): Promise<void> {
  const { frequency, reminders } = useSettingsStore.getState().settings;
  if (!frequency || !reminders) return;
  if (!(await ensurePermission(false))) return;
  await configureNotifications();
  const todayContexts = useReadingsStore.getState().today.map((r) => r.context);
  await replaceReminderPlan(buildReminderPlan({ frequency, reminders, now: new Date(), todayContexts }));
}

/**
 * Mantém as notificações em dia (início do app, nova leitura, mudança de rotina)
 * e trata os toques: "Registrar" abre o registro; "Adiar" reagenda em 10 min.
 */
export function useReminderSync(): void {
  useEffect(() => {
    const run = () => void syncReminders().catch(() => undefined);
    run();

    const offReadings = useReadingsStore.subscribe((state, prev) => {
      if (state.today === prev.today) return;
      run();
      // Leitura nova antes da refeição → timer pós-refeição, se os alarmes estiverem ligados.
      const known = new Set(prev.today.map((r) => r.id));
      const added = state.today.find((r) => !known.has(r.id));
      const reminders = useSettingsStore.getState().settings.reminders;
      if (added && PRE_MEAL.includes(added.context) && reminders?.alarmsEnabled) {
        void ensurePermission(false)
          .then((granted) => (granted ? schedulePostMealTimer(reminders.postMealTimerHours) : undefined))
          .catch(() => undefined);
      }
    });

    const offSettings = useSettingsStore.subscribe((state, prev) => {
      const s = state.settings;
      const p = prev.settings;
      if (s.frequency !== p.frequency || s.reminders !== p.reminders) run();
    });

    const offResponses = onReminderResponse(({ action, content }) => {
      if (action === 'snooze') {
        const minutes = useSettingsStore.getState().settings.reminders?.snoozeMinutes ?? 10;
        void snoozeNotification(content, minutes).catch(() => undefined);
      } else {
        router.push('/newReading');
      }
    });

    return () => {
      offReadings();
      offSettings();
      offResponses();
    };
  }, []);
}
