import '../global.css';

import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { AppErrorState } from '@/components/layout/appErrorState';
import { Toast } from '@/components/ui/toast';
import { useAppInit } from '@/shared/hooks/useAppInit';
import { useReminderSync } from '@/shared/hooks/useReminderSync';
import { useTheme } from '@/shared/hooks/useTheme';
import { useToastState } from '@/shared/hooks/useToast';
import { useUpdateCheck } from '@/shared/hooks/useUpdateCheck';
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
      {init.error ? <InitError error={init.error} /> : <RootStack />}
    </ThemeProvider>
  );
}

function RootStack() {
  const { scheme, colors } = useTheme();
  const toast = useToastState();
  // Sem onboarding concluído (primeiro uso ou depois de apagar tudo), só o onboarding fica acessível.
  const onboarded = useSettingsStore((s) => Boolean(s.settings.onboarding?.completedAt));
  useReminderSync();
  useUpdateCheck(onboarded);

  // Fundo da janela nativa na cor do canvas: é o que aparece atrás das barras do sistema (edge-to-edge).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => undefined);
  }, [colors.bg]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* Ícones da barra de navegação do Android seguem o tema do app, não o do sistema. */}
      <NavigationBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
          {/* O sheet anima a si mesmo; a rota só abre por cima, transparente. */}
          <Stack.Screen
            name="(modals)/newReading/index"
            options={{ presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } }}
          />
          <Stack.Screen name="dev/index" />
          {/* Voltar (gesto ou botão) é tratado pela própria tela como "Pular por hoje". */}
          <Stack.Screen name="update/index" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding/index" options={{ gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
      <Toast toast={toast.current} onDismiss={toast.hide} />
    </>
  );
}

// Falha ao abrir o banco: mensagem calma; o detalhe técnico só aparece em desenvolvimento.
function InitError({ error }: { error: Error }) {
  return (
    <AppErrorState
      title="Não conseguimos abrir seus dados"
      description="Feche o app e abra de novo. Seus registros continuam guardados neste aparelho."
      error={error}
    />
  );
}

/** Erro inesperado numa tela (Expo Router): em vez da tela vermelha, mensagem calma e "Tentar de novo". */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  const appearance = useSettingsStore((s) => s.settings.appearance);
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);
  return (
    <ThemeProvider appearance={appearance}>
      <AppErrorState
        title="Algo não saiu como esperado"
        description="Seus registros continuam guardados neste aparelho. Tente de novo; se continuar, feche e abra o app."
        error={error}
        onRetry={() => void retry()}
      />
    </ThemeProvider>
  );
}
