import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { ReadingContextPicker } from '@/components/glucose/readingContextPicker';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';
import type { GlucoseReading } from '@/shared/types/reading';
import { formatReadingMoment } from '@/shared/utils/format';

import { useReadingForm } from '../../useReadingForm';
import { GlucoseValueInput } from '../glucoseValueInput';
import { ReadingDetails } from '../readingDetails';

type ReadingFormProps = { existing?: GlucoseReading };

/** Conteúdo do sheet: valor, momento, detalhes e ações (salvar; na edição, excluir). */
export function ReadingForm({ existing }: ReadingFormProps) {
  const form = useReadingForm(existing);
  const { height } = useWindowDimensions();

  return (
    <>
      {/* Encolhe junto com o sheet quando o teclado abre; o campo focado é rolado para a vista. */}
      <ScrollView
        style={{ maxHeight: height * 0.6, flexShrink: 1 }}
        contentContainerClassName="gap-lg pb-sm"
        keyboardShouldPersistTaps="handled">
        {existing && (
          <Text className="font-medium text-body-sm text-text-muted">
            Medido {formatReadingMoment(existing.timestamp).replace(/^(Hoje|Ontem)/, (d) => d.toLowerCase())}
          </Text>
        )}
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
        label={form.isEdit ? 'Salvar Alterações' : 'Salvar Medição'}
        icon="save"
        onPress={form.save}
        disabled={!form.canSave}
        loading={form.saving}
      />
      {form.isEdit && <Button label="Excluir registro" variant="ghost" icon="delete-outline" onPress={form.confirmDelete} />}
    </>
  );
}
