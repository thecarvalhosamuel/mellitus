import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { useToast } from '@/shared/hooks/useToast';
import type { MealContext } from '@/shared/types/reading';
import {
  getCycleSlot,
  getDayMoments,
  getPendingMoments,
  getScheduleCycleDay,
  suggestReadingContext,
} from '@/shared/utils/cycle';
import { toDateKey } from '@/shared/utils/date';
import { classifyReading, isValidManualValue } from '@/shared/utils/glucose';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

const DEFAULT_VALUE = 110;

/** Estado e regras do modal "Registrar Glicemia" (DESIGN.md §5.1). */
export function useNewReading() {
  const toast = useToast();
  const active = usePatternsStore((s) => s.active);
  const frequency = useSettingsStore((s) => s.settings.frequency);
  const today = useReadingsStore((s) => s.today);
  const lastValue = useReadingsStore((s) => s.recent[0]?.value);

  // Rotina de hoje: quais momentos faltam e em que dia do ciclo estamos.
  const routine = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const moments = frequency ? getDayMoments(frequency, todayKey) : [];
    const doneContexts = today.map((r) => r.context);
    return {
      moments,
      doneContexts,
      pending: getPendingMoments(moments, doneContexts),
      cycleDay: frequency ? getScheduleCycleDay(frequency, todayKey) : undefined,
    };
  }, [frequency, today]);

  const [value, setValue] = useState<number | undefined>(lastValue ?? DEFAULT_VALUE);
  const [context, setContext] = useState<MealContext>(() => suggestReadingContext(new Date(), routine.pending));
  const [note, setNote] = useState('');
  const [insulinUnits, setInsulinUnits] = useState<number | undefined>(undefined);
  const [isCorrection, setIsCorrection] = useState(false);
  const [saving, setSaving] = useState(false);

  const valid = value !== undefined && isValidManualValue(value);
  const preview = valid && active ? classifyReading(value, context, active) : undefined;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await useReadingsStore.getState().add({
        value,
        context,
        timestamp: new Date().toISOString(),
        note,
        insulinUnits,
        isCorrection: isCorrection && insulinUnits !== undefined,
        cycleDay: routine.cycleDay,
        cycleSlot: routine.cycleDay ? getCycleSlot(routine.moments, routine.doneContexts, context) : undefined,
      });
      toast.success(`Registro de ${value} mg/dL salvo com sucesso!`);
      router.back();
    } catch {
      toast.error('Não foi possível salvar. Tente de novo em instantes.');
      setSaving(false);
    }
  };

  return {
    value,
    setValue,
    valueError: valid ? undefined : 'Use um valor entre 40 e 450 mg/dL.',
    preview,
    context,
    setContext,
    note,
    setNote,
    insulinUnits,
    setInsulinUnits,
    isCorrection,
    setIsCorrection,
    saving,
    canSave: valid && !!active && !saving,
    save,
  };
}
