import { router } from 'expo-router';
import { useEffect } from 'react';

import {
  configureNotifications,
  ensurePermission,
  onReminderResponse,
  replaceExportReminders,
  replaceReminderPlan,
  schedulePostMealTimer,
  snoozeNotification,
  takeLaunchResponse,
  type ReminderResponse,
} from '@/services/notifications';
import { runExport, shareMonthlyReport, shareSpreadsheet } from '@/shared/hooks/useExportFlow';
import type { MealContext } from '@/shared/types/reading';
import { buildExportReminderPlan, previousMonth, previousWeekPeriod } from '@/shared/utils/exportReminders';
import { buildReminderPlan } from '@/shared/utils/reminders';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

/** Momentos que disparam o timer pós-refeição ao serem registrados. */
const PRE_MEAL: MealContext[] = ['pre-meal', 'pre-dinner'];

/**
 * Recalcula e reagenda os lembretes dos próximos 7 dias com as configurações e
 * as leituras de hoje, e os lembretes de exportação (repetidos).
 * Não pede permissão: sem permissão, não faz nada.
 */
export async function syncReminders(): Promise<void> {
  const { frequency, reminders, exportReminders } = useSettingsStore.getState().settings;
  if (!(await ensurePermission(false))) return;
  await configureNotifications();
  if (frequency && reminders) {
    const todayContexts = useReadingsStore.getState().today.map((r) => r.context);
    await replaceReminderPlan(buildReminderPlan({ frequency, reminders, now: new Date(), todayContexts }));
  }
  if (exportReminders) await replaceExportReminders(buildExportReminderPlan(exportReminders));
}

/** Lembrete de exportação tocado: gera o arquivo do período que fechou e abre o compartilhamento. */
function runExportReminder(kind: 'export-weekly' | 'export-monthly'): Promise<void> {
  router.navigate('/history');
  const now = new Date();
  if (kind === 'export-weekly') {
    const period = previousWeekPeriod(now);
    return runExport(() => shareSpreadsheet(period), {
      empty: `Não há medições de ${period.label} para a planilha.`,
      failed: 'Não foi possível gerar a planilha. Tente pelo Histórico.',
    });
  }
  const month = previousMonth(now);
  return runExport(() => shareMonthlyReport(month), {
    empty: `Não há medições em ${month.label} para o laudo.`,
    failed: 'Não foi possível gerar o laudo. Tente pelo Histórico.',
  });
}

/** Cada toque é tratado uma vez, mesmo se chegar pelo listener e pela abertura do app. */
const handled = new Set<string>();

function handleResponse(response: ReminderResponse): void {
  if (handled.has(response.id)) return;
  handled.add(response.id);
  if (response.action === 'export') {
    void runExportReminder(response.kind);
  } else if (response.action === 'snooze') {
    const minutes = useSettingsStore.getState().settings.reminders?.snoozeMinutes ?? 10;
    void snoozeNotification(response.content, minutes).catch(() => undefined);
  } else {
    router.push('/newReading');
  }
}

/**
 * Mantém as notificações em dia (início do app, nova leitura, mudança de rotina)
 * e trata os toques: "Registrar" abre o registro; "Adiar" reagenda em 10 min;
 * lembrete de exportação gera e compartilha o arquivo.
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
      if (s.frequency !== p.frequency || s.reminders !== p.reminders || s.exportReminders !== p.exportReminders) run();
    });

    const offResponses = onReminderResponse(handleResponse);
    // App aberto pelo toque numa notificação (antes de o listener existir).
    void takeLaunchResponse()
      .then((response) => response && handleResponse(response))
      .catch(() => undefined);

    return () => {
      offReadings();
      offSettings();
      offResponses();
    };
  }, []);
}
