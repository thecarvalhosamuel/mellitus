import type { SettingsMap } from '@/shared/types/settings';

// Configurações iniciais (DESIGN.md §5.5 e §13.4). `cycleStart` é preenchido no seed com o dia da instalação.
export const DEFAULT_SETTINGS: Omit<SettingsMap, 'frequency' | 'profile'> & {
  frequency: Omit<SettingsMap['frequency'], 'cycleStart'>;
} = {
  appearance: 'system',
  frequency: {
    mode: '3x',
    dayA: {
      label: 'Dia A (Intensivo)',
      moments: [
        { context: 'fasting', time: '07:00' },
        { context: 'post-meal-2h', time: '14:00' },
        { context: 'bedtime', time: '22:00' },
      ],
    },
    dayB: {
      label: 'Dia B (Manutenção Basal)',
      moments: [{ context: 'fasting', time: '07:30' }],
    },
  },
  reminders: {
    alarmsEnabled: true,
    snoozeMinutes: 10,
    postMealTimerHours: 2,
    adaptiveToCycle: true,
    restDay: {
      reduceAlerts: true,
      gentleFastingTime: '08:00',
      encouragement: true,
      passiveSafetyAlertAt: '10:00',
    },
  },
  exportReminders: {
    weeklyXlsx: { enabled: false, weekday: 1, time: '08:00' },
    monthlyPdf: { enabled: false },
  },
  onboarding: {},
  updates: {},
};
