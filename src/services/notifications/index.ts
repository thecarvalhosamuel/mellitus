import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { ReminderPlanItem } from '@/shared/utils/reminders';

// Notificações locais (sem push nem servidor). Este módulo só fala com o sistema;
// o que agendar vem de buildReminderPlan.

const CATEGORY = 'reading-reminder';
const CHANNELS = { reminders: 'reminders', safety: 'safety', hypo: 'hypo-alerts' } as const;
const PLAN_PREFIXES = ['moment-', 'gentle-', 'safety-'];
const POST_MEAL_ID = 'post-meal-timer';

export const ACTION_SNOOZE = 'snooze';
export const ACTION_REGISTER = 'register';

let configured = false;

/** Handler de exibição, canais do Android e ações "Adiar 10 min" / "Registrar". */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNELS.reminders, {
      name: 'Lembretes de medição',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 120, 200],
    });
    await Notifications.setNotificationChannelAsync(CHANNELS.safety, {
      name: 'Avisos de segurança',
      importance: AndroidImportance.HIGH,
    });
    // Reservado para o alarme de hipo: prioridade máxima e passando pelo Não Perturbe
    // quando o sistema permitir. O conteúdo do alarme depende de validação clínica.
    await Notifications.setNotificationChannelAsync(CHANNELS.hypo, {
      name: 'Alarme de hipoglicemia',
      importance: AndroidImportance.MAX,
      bypassDnd: true,
    });
  }
  await Notifications.setNotificationCategoryAsync(CATEGORY, [
    { identifier: ACTION_SNOOZE, buttonTitle: 'Adiar 10 min', options: { opensAppToForeground: false } },
    { identifier: ACTION_REGISTER, buttonTitle: 'Registrar', options: { opensAppToForeground: true } },
  ]);
}

/** Permissão já concedida? Com `ask`, pede ao usuário se ainda não decidiu. */
export async function ensurePermission(ask: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!ask || !current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Substitui os lembretes da rotina pelos do plano (timers e outros avisos ficam). */
export async function replaceReminderPlan(plan: ReminderPlanItem[]): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => PLAN_PREFIXES.some((prefix) => n.identifier.startsWith(prefix)))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  for (const item of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: {
        title: item.title,
        body: item.body,
        categoryIdentifier: CATEGORY,
        data: { kind: item.kind, context: item.context },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.date,
        channelId: item.kind === 'safety' ? CHANNELS.safety : CHANNELS.reminders,
      },
    });
  }
}

/** Timer pós-refeição: lembra da medição 1h ou 2h depois (substitui o anterior). */
export async function schedulePostMealTimer(hours: 1 | 2): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(POST_MEAL_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: POST_MEAL_ID,
    content: {
      title: `Medição de ${hours}h pós-refeição`,
      body: 'Chegou a hora da medição depois da refeição.',
      categoryIdentifier: CATEGORY,
      data: { kind: 'post-meal' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: hours * 3600,
      channelId: CHANNELS.reminders,
    },
  });
}

/** Reagenda a mesma notificação daqui a `minutes`. */
export async function snoozeNotification(content: Notifications.NotificationContent, minutes: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title ?? 'Lembrete de medição',
      body: content.body ?? '',
      categoryIdentifier: CATEGORY,
      data: content.data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
      channelId: CHANNELS.reminders,
    },
  });
}

export type ReminderResponse = { action: 'snooze' | 'register'; content: Notifications.NotificationContent };

/** Toque na notificação ou num botão dela. */
export function onReminderResponse(listener: (response: ReminderResponse) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener((event) => {
    const action = event.actionIdentifier === ACTION_SNOOZE ? 'snooze' : 'register';
    listener({ action, content: event.notification.request.content });
  });
  return () => subscription.remove();
}
