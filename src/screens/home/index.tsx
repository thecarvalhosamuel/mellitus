import { StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@/shared/theme/typography';

// Placeholder da etapa 1: as seções do Início entram nas etapas 7 e 9.
// Cores e estilos definitivos chegam com o tema (etapa 2, NativeWind).
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mellitus</Text>
      <Text style={styles.subtitle}>Seu acompanhamento glicêmico começa aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
