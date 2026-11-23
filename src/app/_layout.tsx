import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Toast } from '@/components/ui/toast';
import { useAppInit } from '@/shared/hooks/useAppInit';
import { useTheme } from '@/shared/hooks/useTheme';
import { useToastState } from '@/shared/hooks/useToast';
import { ThemeProvider } from '@/shared/theme';
import { fontAssets } from '@/shared/theme/typography';
import { useSettingsStore } from '@/stores/settings';

// Splash → fontes + banco (migrations, seed, padrão ativo, settings) → esconde a splash.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const init = useAppInit();
  const appearance = useSettingsStore((s) => s.settings.appearance);
  const ready = (fontsLoaded || fontError !== null) && init.ready;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider appearance={appearance}>
      {init.error ? <InitError /> : <RootStack />}
    </ThemeProvider>
  );
}

function RootStack() {
  const { scheme, colors } = useTheme();
  const toast = useToastState();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        {/* O sheet anima a si mesmo; a rota só abre por cima, transparente. */}
        <Stack.Screen
          name="(modals)/newReading/index"
          options={{ presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } }}
        />
        <Stack.Screen name="dev/index" />
      </Stack>
      <Toast toast={toast.current} onDismiss={toast.hide} />
    </>
  );
}

// Falha ao abrir o banco: mensagem calma, sem detalhes técnicos.
function InitError() {
  return (
    <View className="flex-1 items-center justify-center gap-sm bg-bg px-margin">
      <Text className="text-center font-bold text-headline-sm text-text-strong">
        Não conseguimos abrir seus dados
      </Text>
      <Text className="text-center font-regular text-body-md text-text-secondary">
        Feche o app e abra de novo. Seus registros continuam guardados neste aparelho.
      </Text>
    </View>
  );
}
