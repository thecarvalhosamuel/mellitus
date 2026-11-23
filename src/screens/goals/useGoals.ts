import { router } from 'expo-router';
import { useState } from 'react';

import { useToast } from '@/shared/hooks/useToast';
import { usePatternsStore } from '@/stores/patterns';

/** Padrão selecionado e aplicação (DESIGN.md §5.3). */
export function useGoals() {
  const toast = useToast();
  const patterns = usePatternsStore((s) => s.patterns);
  const active = usePatternsStore((s) => s.active);
  const [selectedId, setSelectedId] = useState<string | undefined>(active?.id);
  const [applying, setApplying] = useState(false);

  const selected = patterns.find((p) => p.id === (selectedId ?? active?.id)) ?? active;

  const apply = async () => {
    if (!selected || selected.id === active?.id) return;
    setApplying(true);
    try {
      await usePatternsStore.getState().activate(selected.id);
      toast.success(`${selected.name} ativo nos gráficos e relatórios.`, 'Padrão atualizado!');
    } catch {
      toast.error('Não foi possível trocar o padrão. Tente de novo.');
    } finally {
      setApplying(false);
    }
  };

  return {
    patterns,
    activeId: active?.id,
    selected,
    select: setSelectedId,
    canApply: !!selected && selected.id !== active?.id && !applying,
    applying,
    apply,
    create: () => router.push('/goals/new'),
    edit: (id: string) => router.push({ pathname: '/goals/new', params: { id } }),
  };
}
