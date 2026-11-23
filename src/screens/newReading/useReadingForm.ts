import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useToast } from '@/shared/hooks/useToast';
import type { GlucoseReading, MealContext } from '@/shared/types/reading';
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

/**
 * Estado e regras do modal de glicemia (DESIGN.md §5.1). Sem `existing`, registra
 * uma nova leitura; com `existing`, edita ou exclui mantendo data e dia do ciclo.
 */
export function useReadingForm(existing?: GlucoseReading) {
  const toast = useToast();
  const isEdit = existing !== undefined;
  const patterns = usePatternsStore((s) => s.patterns);
  const active = usePatternsStore((s) => s.active);
  const frequency = useSettingsStore((s) => s.settings.frequency);
  const today = useReadingsStore((s) => s.today);
  const lastValue = useReadingsStore((s) => s.recent[0]?.value);

  // Na edição, a leitura segue o padrão em que foi registrada (se ainda existir).
  const pattern = (existing && patterns.find((p) => p.id === existing.patternId)) || active;

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

  const [value, setValue] = useState<number | undefined>(existing?.value ?? lastValue ?? DEFAULT_VALUE);
  const [context, setContext] = useState<MealContext>(
    () => existing?.context ?? suggestReadingContext(new Date(), routine.pending),
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [insulinUnits, setInsulinUnits] = useState<number | undefined>(existing?.insulinUnits);
  const [isCorrection, setIsCorrection] = useState(existing?.isCorrection ?? false);
  const [saving, setSaving] = useState(false);

  const valid = value !== undefined && isValidManualValue(value);
  const preview = valid && pattern ? classifyReading(value, context, pattern) : undefined;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const fields = { value, context, note, insulinUnits, isCorrection: isCorrection && insulinUnits !== undefined };
    try {
      if (existing) {
        await useReadingsStore.getState().update(existing.id, {
          ...fields,
          timestamp: existing.timestamp,
          cycleDay: existing.cycleDay,
          cycleSlot: existing.cycleSlot,
        });
        toast.success('Registro atualizado.');
      } else {
        await useReadingsStore.getState().add({
          ...fields,
          timestamp: new Date().toISOString(),
          cycleDay: routine.cycleDay,
          cycleSlot: routine.cycleDay ? getCycleSlot(routine.moments, routine.doneContexts, context) : undefined,
        });
        toast.success(`Registro de ${value} mg/dL salvo com sucesso!`);
      }
      router.back();
    } catch {
      toast.error('Não foi possível salvar. Tente de novo em instantes.');
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Excluir este registro?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await useReadingsStore.getState().remove(existing.id);
            toast.success('Registro excluído.');
            router.back();
          } catch {
            toast.error('Não foi possível excluir. Tente de novo em instantes.');
          }
        },
      },
    ]);
  };

  return {
    isEdit,
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
    canSave: valid && !!pattern && !saving,
    save,
    confirmDelete,
  };
}
