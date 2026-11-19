import type { FrequencySchedule } from '../schedule';

export type Appearance = 'system' | 'light' | 'dark';

export type Profile = { name: string };

export type ReminderSettings = {
  alarmsEnabled: boolean;
  snoozeMinutes: 10;
  postMealTimerHours: 1 | 2;
  adaptiveToCycle: boolean;
  restDay: {
    reduceAlerts: boolean;
    gentleFastingTime: string;
    encouragement: boolean;
    passiveSafetyAlertAt: string;
  };
};

export type ExportReminders = {
  weeklyXlsx: { enabled: boolean; weekday: number; time: string };
  monthlyPdf: { enabled: boolean };
};

/** Conteúdo da tabela `settings` (DESIGN.md §13.3), por chave. */
export type SettingsMap = {
  profile: Profile;
  appearance: Appearance;
  frequency: FrequencySchedule;
  reminders: ReminderSettings;
  exportReminders: ExportReminders;
  onboarding: { completedAt?: string };
};

export type SettingsKey = keyof SettingsMap;
