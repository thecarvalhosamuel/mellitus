import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GlucoseReading } from '@/shared/types/reading';
import { useReadingsStore } from '@/stores/readings';

import { ReadingForm } from './components/readingForm';

/** `/newReading` registra; `/newReading?id=…` edita ou exclui uma leitura existente. */
export function NewReadingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const [existing, setExisting] = useState<GlucoseReading | null | undefined>(id ? undefined : null);

  useEffect(() => {
    if (!id) return;
    useReadingsStore
      .getState()
      .getById(id)
      .then((reading) => setExisting(reading))
      .catch(() => setExisting(null));
  }, [id]);

  const close = () => router.back();

  return (
    <BottomSheet visible onClose={close} title={id ? 'Editar Registro' : 'Registrar Glicemia'}>
      {existing === undefined ? (
        <ActivityIndicator color={colors.primary} className="py-lg" />
      ) : id && existing === null ? (
        <Text className="pb-md font-regular text-body-md text-text-secondary">
          Não encontramos esse registro. Ele pode ter sido excluído.
        </Text>
      ) : (
        <ReadingForm existing={existing ?? undefined} />
      )}
    </BottomSheet>
  );
}
