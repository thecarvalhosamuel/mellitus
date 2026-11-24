import { useState } from 'react';

import { ensurePermission } from '@/services/notifications';
import { syncReminders } from '@/shared/hooks/useReminderSync';
import { useToast } from '@/shared/hooks/useToast';
import { usePatternsStore } from '@/stores/patterns';
import { useSettingsStore } from '@/stores/settings';

export const ONBOARDING_STEPS = 3;
const NAME_MAX = 40;

/**
 * Primeiro uso (ROADMAP §3.1): nome, padrão inicial e lembretes. Ao concluir,
 * grava `onboarding.completedAt` e o layout raiz libera o app.
 */
export function useOnboarding() {
  const toast = useToast();
  const patterns = usePatternsStore((s) => s.patterns).filter((p) => p.status !== 'draft');
  const activeId = usePatternsStore((s) => s.active?.id);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(() => useSettingsStore.getState().settings.profile?.name ?? '');
  const [patternId, setPatternId] = useState<string | undefined>(activeId);
  const [notifications, setNotifications] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [finishing, setFinishing] = useState(false);

  const askNotifications = async () => {
    const granted = await ensurePermission(true).catch(() => false);
    setNotifications(granted ? 'granted' : 'denied');
  };

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const settings = useSettingsStore.getState();
      const trimmed = name.trim();
      if (trimmed) await settings.update('profile', { name: trimmed });
      if (patternId && patternId !== usePatternsStore.getState().active?.id) {
        await usePatternsStore.getState().activate(patternId);
      }
      await syncReminders().catch(() => undefined);
      // Por último: libera as abas (Stack.Protected no layout raiz).
      await settings.update('onboarding', { completedAt: new Date().toISOString() });
    } catch {
      toast.error('Não foi possível salvar. Tente de novo.');
      setFinishing(false);
    }
  };

  return {
    step,
    isLast: step === ONBOARDING_STEPS - 1,
    next: () => (step === ONBOARDING_STEPS - 1 ? void finish() : setStep(step + 1)),
    back: () => setStep(Math.max(0, step - 1)),
    name,
    setName: (value: string) => setName(value.slice(0, NAME_MAX)),
    nameMax: NAME_MAX,
    patterns,
    patternId,
    setPatternId,
    canContinue: step !== 1 || patternId !== undefined,
    notifications,
    askNotifications,
    finishing,
  };
}
