import { ScreenContainer } from '@/components/layout/screenContainer';
import { GradientButton } from '@/components/ui/gradientButton';
import { InfoBanner } from '@/components/ui/infoBanner';

import { AppearanceSection } from './components/appearanceSection';
import { FrequencySection } from './components/frequencySection';
import { HealthIntegrationTile } from './components/healthIntegrationTile';
import { RemindersSection } from './components/remindersSection';
import { useSettings } from './useSettings';

// Lembretes de exportação (planilha semanal, laudo mensal) entram na etapa 15.
export function SettingsScreen() {
  const settings = useSettings();

  return (
    <ScreenContainer>
      <InfoBanner
        icon="notifications-active"
        title="Rotina e Alertas"
        description="Lembretes gentis no seu ritmo, combinados com a rotina que você e seu médico definiram."
      />
      <FrequencySection
        frequency={settings.frequency}
        onModeChange={settings.setMode}
        onChange={settings.setFrequency}
        onCyclePositionChange={settings.setCyclePosition}
      />
      <RemindersSection
        reminders={settings.reminders}
        onChange={settings.setReminders}
        showRestDay={settings.frequency.mode === 'alternating'}
      />
      <AppearanceSection value={settings.appearance} onChange={settings.setAppearance} />
      <HealthIntegrationTile />
      <InfoBanner
        icon="verified"
        title="Salvo neste aparelho"
        description="Suas configurações entram em vigor assim que você salvar."
      />
      <GradientButton
        label="Salvar Preferências"
        icon="save"
        onPress={settings.save}
        disabled={!settings.dirty}
        loading={settings.saving}
      />
    </ScreenContainer>
  );
}
