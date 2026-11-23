import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

/** Quantos registros o Início lista abaixo da última leitura. */
const RECENT_ON_HOME = 3;

export function useHomeData() {
  const recent = useReadingsStore((s) => s.recent);
  const profileName = useSettingsStore((s) => s.settings.profile?.name);
  const patternName = usePatternsStore((s) => s.active?.name);

  return {
    profileName,
    patternName,
    lastReading: recent[0] ?? null,
    recentReadings: recent.slice(0, RECENT_ON_HOME),
  };
}
