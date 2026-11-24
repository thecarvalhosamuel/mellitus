import { create } from 'zustand';

import { fetchAvailableUpdate, simulatedUpdate } from '@/services/updates';
import type { UpdateInfo } from '@/shared/types/update';
import { toDateKey } from '@/shared/utils/date';
import { shouldPromptUpdate } from '@/shared/utils/version';
import { useSettingsStore } from '@/stores/settings';

type UpdateState = {
  /** Release mais nova que a instalada, se houver (vale para a sessão do app). */
  available: UpdateInfo | null;
  checked: boolean;
  /** Busca a atualização uma vez por sessão. Devolve `true` se o aviso deve aparecer agora. */
  check(): Promise<boolean>;
  /** "Pular por hoje": grava o dia; o aviso só volta em outro dia. */
  skipToday(): Promise<void>;
  /** Só desenvolvimento: carrega uma atualização fictícia, ignorando o "pular por hoje". */
  simulate(): void;
};

export const useUpdateStore = create<UpdateState>()((set, get) => ({
  available: null,
  checked: false,

  async check() {
    if (get().checked) return false;
    set({ checked: true });
    const available = await fetchAvailableUpdate();
    set({ available });
    if (!available) return false;
    const skippedOn = useSettingsStore.getState().settings.updates?.skippedOn;
    return shouldPromptUpdate(skippedOn, toDateKey(new Date()));
  },

  async skipToday() {
    const version = get().available?.version;
    await useSettingsStore.getState().update('updates', { skippedOn: toDateKey(new Date()), skippedVersion: version });
  },

  simulate() {
    set({ available: simulatedUpdate(), checked: true });
  },
}));
