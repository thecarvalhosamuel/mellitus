import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { useTheme } from '@/shared/hooks/useTheme';
import { layout } from '@/shared/theme/tokens';

const logoLight = require('@/assets/images/splash-icon.png');
const logoDark = require('@/assets/images/splash-icon-dark.png');

type AppHeaderProps = {
  /** Subtítulo da seção: "Início", "Histórico E Registros"… */
  subtitle: string;
  profileName?: string;
  onPressProfile: () => void;
};

/** Header fixo translúcido (DESIGN.md §3.1): logo + "Mellitus" + seção; avatar abre os Ajustes. */
export function AppHeader({ subtitle, profileName, onPressProfile }: AppHeaderProps) {
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={30}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      className="border-b border-header-border bg-header"
      style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between gap-sm px-margin" style={{ height: layout.headerHeight }}>
        <View className="flex-row items-center gap-sm" accessible accessibilityRole="header" accessibilityLabel={`Mellitus, ${subtitle}`}>
          <Image source={scheme === 'dark' ? logoDark : logoLight} style={{ width: 26, height: 32 }} contentFit="contain" />
          <View>
            <Text className="font-bold text-headline-sm text-primary">Mellitus</Text>
            <Text className="font-bold text-label-sm text-text-secondary">{subtitle}</Text>
          </View>
        </View>
        <Pressable
          onPress={onPressProfile}
          accessibilityRole="button"
          accessibilityLabel="Perfil e ajustes"
          className="h-touch w-touch items-center justify-center rounded-full active:bg-control">
          <Avatar name={profileName} />
        </Pressable>
      </View>
    </BlurView>
  );
}
