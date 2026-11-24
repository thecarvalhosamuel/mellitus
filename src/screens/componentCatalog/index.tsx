import { Redirect } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/ui/segmentedControl';
import type { Appearance } from '@/shared/types/settings';
import { useSettingsStore } from '@/stores/settings';

import { ButtonsSection } from './components/buttonsSection';
import { DisplaySection } from './components/displaySection';
import { FormSection } from './components/formSection';
import { OverlaySection } from './components/overlaySection';
import { UpdateSection } from './components/updateSection';

const APPEARANCE_OPTIONS = [
  { value: 'system' as const, label: 'Automático' },
  { value: 'light' as const, label: 'Claro' },
  { value: 'dark' as const, label: 'Escuro' },
];

/** Catálogo de componentes base nos dois temas. Só em desenvolvimento. */
export function ComponentCatalogScreen() {
  const insets = useSafeAreaInsets();
  const appearance = useSettingsStore((s) => s.settings.appearance ?? 'system');
  const setAppearance = (value: Appearance) => useSettingsStore.getState().update('appearance', value);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-lg px-margin"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }}>
      <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
        Componentes
      </Text>
      <SegmentedControl
        accessibilityLabel="Aparência"
        options={APPEARANCE_OPTIONS}
        value={appearance}
        onChange={setAppearance}
      />
      <ButtonsSection />
      <DisplaySection />
      <FormSection />
      <OverlaySection />
      <UpdateSection />
    </ScrollView>
  );
}
