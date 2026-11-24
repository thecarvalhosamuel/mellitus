import { Stack } from 'expo-router';

import { useTheme } from '@/shared/hooks/useTheme';

// Histórico → Importar planilha empilha dentro da aba (pré-visualização antes de gravar).
export default function HistoryLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
