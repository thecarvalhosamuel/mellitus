import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

// Placeholder: as seções do Início entram nas etapas 7 e 9.
// Serve para conferir o tema: tudo aqui usa só classes semânticas.
export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-md bg-bg px-margin">
      <Text className="font-bold text-headline-lg text-text-strong">Mellitus</Text>
      <Text className="text-center font-regular text-body-md text-text-secondary">
        Seu acompanhamento glicêmico começa aqui.
      </Text>

      <View className="w-full gap-sm rounded-card border border-card-border bg-card p-md">
        <Text className="font-semibold text-label-md text-text-muted">ÚLTIMA LEITURA</Text>
        <View className="flex-row items-end gap-xs">
          <Text
            className="font-bold text-display-numeric text-status-in-range-value"
            style={{ fontVariant: ['tabular-nums'] }}>
            104
          </Text>
          <Text className="mb-xs font-medium text-body-md text-text-muted">mg/dL</Text>
        </View>
        <View className="self-start rounded-full border border-status-in-range-border bg-status-in-range-bg px-sm py-xs">
          <Text className="font-bold text-label-sm text-status-in-range-fg">● NO ALVO</Text>
        </View>
      </View>

      {__DEV__ && (
        <Button label="Catálogo de componentes" variant="ghost" icon="widgets" onPress={() => router.push('/dev')} />
      )}
    </View>
  );
}
