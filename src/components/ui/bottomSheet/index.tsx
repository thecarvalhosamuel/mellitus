import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/iconButton';
import { useTheme } from '@/shared/hooks/useTheme';
import { elevation } from '@/shared/theme/tokens';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * Sheet com raio 24 no topo, overlay em fade e conteúdo subindo em 200 ms
 * (DESIGN.md §4.7). Toque fora, botão fechar e "voltar" do Android fecham.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-overlay">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Fechar" accessibilityRole="button" />
        <Animated.View
          entering={SlideInDown.duration(200)}
          accessibilityViewIsModal
          className="gap-md rounded-t-sheet border-t border-card-border bg-sheet px-md pt-sm"
          style={[{ paddingBottom: insets.bottom + 16 }, scheme === 'light' && elevation.sheet]}>
          <View className="h-1 w-10 self-center rounded-full bg-divider" />
          {title && (
            <View className="flex-row items-center justify-between gap-sm">
              <Text accessibilityRole="header" className="flex-1 font-bold text-headline-sm text-text-strong">
                {title}
              </Text>
              <IconButton icon="close" accessibilityLabel="Fechar" onPress={onClose} />
            </View>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
