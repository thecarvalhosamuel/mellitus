import { ScreenContainer } from '@/components/layout/screenContainer';
import { GradientButton } from '@/components/ui/gradientButton';
import { InfoBanner } from '@/components/ui/infoBanner';
import { useSettingsStore } from '@/stores/settings';

import { AppearanceSection } from './components/appearanceSection';
import { ExportSection } from './components/exportSection';
import { FrequencySection } from './components/frequencySection';
import { HealthIntegrationTile } from './components/healthIntegrationTile';
import { ProfileSection } from './components/profileSection';
import { RemindersSection } from './components/remindersSection';
import { EraseDataSection } from './components/eraseDataSection';
import { useEraseData } from './useEraseData';
import { useSettings } from './useSettings';

/** Recomeça o rascunho quando as configurações são recarregadas do banco (ex.: depois de apagar tudo). */
export function SettingsScreen() {
  const generation = useSettingsStore((s) => s.generation);
  return <SettingsContent key={generation} />;
}

function SettingsContent() {
  const settings = useSettings();
  const eraser = useEraseData();

  return (
    <ScreenContainer>
      <ProfileSection name={settings.name} onNameChange={settings.setName} />
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
      <ExportSection value={settings.exportReminders} onChange={settings.setExportReminders}>
        <HealthIntegrationTile />
      </ExportSection>
      <AppearanceSection value={settings.appearance} onChange={settings.setAppearance} />
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
      <EraseDataSection erasing={eraser.erasing} onErase={eraser.confirm} />
    </ScreenContainer>
  );
}
