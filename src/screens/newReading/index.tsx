import { router } from 'expo-router';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { ReadingContextPicker } from '@/components/glucose/readingContextPicker';
import { BottomSheet } from '@/components/ui/bottomSheet';
import { GradientButton } from '@/components/ui/gradientButton';

import { GlucoseValueInput } from './components/glucoseValueInput';
import { ReadingDetails } from './components/readingDetails';
import { useNewReading } from './useNewReading';

export function NewReadingScreen() {
  const form = useNewReading();
  const { height } = useWindowDimensions();

  return (
    <BottomSheet visible onClose={() => router.back()} title="Registrar Glicemia">
      <ScrollView style={{ maxHeight: height * 0.62 }} contentContainerClassName="gap-lg pb-sm" keyboardShouldPersistTaps="handled">
        <GlucoseValueInput value={form.value} onChange={form.setValue} preview={form.preview} error={form.valueError} />
        <View className="gap-sm">
          <Text className="font-bold text-label-sm uppercase text-text-muted">Momento da leitura</Text>
          <ReadingContextPicker value={form.context} onChange={form.setContext} />
        </View>
        <ReadingDetails
          note={form.note}
          onNoteChange={form.setNote}
          insulinUnits={form.insulinUnits}
          onInsulinChange={form.setInsulinUnits}
          isCorrection={form.isCorrection}
          onCorrectionChange={form.setIsCorrection}
        />
      </ScrollView>
      <GradientButton
        label="Salvar Medição"
        icon="save"
        onPress={form.save}
        disabled={!form.canSave}
        loading={form.saving}
      />
    </BottomSheet>
  );
}
