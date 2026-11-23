import { Stack } from 'expo-router';

import { useTheme } from '@/shared/hooks/useTheme';

// Metas → Novo Padrão Personalizado empilha dentro da aba (DESIGN.md §5.4).
export default function GoalsLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
