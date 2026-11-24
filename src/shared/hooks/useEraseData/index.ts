import { wipeDatabase } from '@/database/wipe';
import { deleteAllAttachmentFiles } from '@/services/attachments';
import { clearExportCache } from '@/services/export/share';
import { cancelAllNotifications } from '@/services/notifications';
import { syncReminders } from '@/shared/hooks/useReminderSync';
import { monthKeyOf } from '@/shared/utils/history';
import { computeStats } from '@/shared/utils/stats';
import { useDashboardStore } from '@/stores/dashboard';
import { useHistoryStore } from '@/stores/history';
import { useImportStore } from '@/stores/import';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

const bestEffort = async (task: () => unknown) => {
  try {
    await task();
  } catch {
    // Sobras de arquivo ou notificação não impedem o recomeço.
  }
};

/**
 * Apaga leituras, padrões próprios, anexos, perfil e configurações, e deixa o
 * app como recém-instalado (DESIGN.md §13.8). O banco vem primeiro: se ele
 * falhar, nada mais é tocado e o erro sobe para a tela.
 */
export async function eraseAllData(now: Date = new Date()): Promise<void> {
  await wipeDatabase(now);

  await bestEffort(cancelAllNotifications);
  await bestEffort(deleteAllAttachmentFiles);
  await bestEffort(clearExportCache);

  useImportStore.getState().clear();
  useHistoryStore.setState({ month: monthKeyOf(now), readings: [], months: [], loaded: false });
  useDashboardStore.setState({ periodReadings: [], periodStats: computeStats([]), monthStats: computeStats([]), loaded: false });
  await Promise.all([useSettingsStore.getState().load(), usePatternsStore.getState().load()]);
  await useReadingsStore.getState().load();

  // Lembretes de fábrica voltam a valer (se a permissão continuar concedida).
  await bestEffort(syncReminders);
}
