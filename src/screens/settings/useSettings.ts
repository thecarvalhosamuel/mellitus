import { useState } from 'react';

import { ensurePermission } from '@/services/notifications';
import { DEFAULT_SETTINGS } from '@/shared/constants/defaultSettings';
import { syncReminders } from '@/shared/hooks/useReminderSync';
import { useToast } from '@/shared/hooks/useToast';
import type { FrequencySchedule } from '@/shared/types/schedule';
import type { Appearance, ExportReminders, ReminderSettings } from '@/shared/types/settings';
import { toDateKey } from '@/shared/utils/date';
import { cycleStartFor } from '@/shared/utils/frequency';
import { useSettingsStore } from '@/stores/settings';

/**
 * Rascunho de frequência e lembretes até "Salvar" (DESIGN.md §5.5).
 * A aparência é aplicada na hora.
 */
export function useSettings() {
  const toast = useToast();
  const stored = useSettingsStore((s) => s.settings);
  const [frequency, setFrequency] = useState<FrequencySchedule>(
    () => stored.frequency ?? { ...DEFAULT_SETTINGS.frequency, cycleStart: toDateKey(new Date()) },
  );
  const [reminders, setReminders] = useState<ReminderSettings>(() => stored.reminders ?? DEFAULT_SETTINGS.reminders);
  const [exportReminders, setExportReminders] = useState<ExportReminders>(
    () => stored.exportReminders ?? DEFAULT_SETTINGS.exportReminders,
  );
  const [saving, setSaving] = useState(false);

  const dirty =
    frequency !== stored.frequency || reminders !== stored.reminders || exportReminders !== stored.exportReminders;
  const wantsNotifications =
    reminders.alarmsEnabled || exportReminders.weeklyXlsx.enabled || exportReminders.monthlyPdf.enabled;

  const setMode = (mode: FrequencySchedule['mode']) =>
    setFrequency((f) => ({
      ...f,
      mode,
      // Ao entrar num ciclo, começa hoje (Dia A / dia de medir).
      ...(mode !== f.mode && { cycleStart: toDateKey(new Date()) }),
      ...(mode === 'custom' && !f.customMoments && { customCount: 2 as const, customMoments: ['fasting', 'post-meal-2h'] }),
    }));

  const setCyclePosition = (position: number) =>
    setFrequency((f) => ({ ...f, cycleStart: cycleStartFor(position, toDateKey(new Date())) }));

  const setAppearance = (appearance: Appearance) =>
    useSettingsStore
      .getState()
      .update('appearance', appearance)
      .catch(() => toast.error('Não foi possível trocar a aparência.'));

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const store = useSettingsStore.getState();
      await store.update('frequency', frequency);
      await store.update('reminders', reminders);
      await store.update('exportReminders', exportReminders);
      if (wantsNotifications && !(await ensurePermission(true))) {
        toast.error('Para receber lembretes, permita as notificações do Mellitus nos ajustes do aparelho.', 'Preferências salvas');
      } else {
        await syncReminders();
        toast.success('Preferências salvas com sucesso!');
      }
    } catch {
      toast.error('Não foi possível salvar as preferências. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return {
    frequency,
    setFrequency,
    setMode,
    setCyclePosition,
    reminders,
    setReminders,
    exportReminders,
    setExportReminders,
    appearance: stored.appearance ?? 'system',
    setAppearance,
    dirty,
    saving,
    save,
  };
}
