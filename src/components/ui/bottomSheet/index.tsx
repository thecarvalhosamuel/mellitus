import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
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

function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

/**
 * Sheet com raio 24 no topo, overlay em fade e conteúdo subindo em 200 ms
 * (DESIGN.md §4.7). Toque fora, botão fechar e "voltar" do Android fecham.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  // Com o teclado aberto, a área segura de baixo (barra de gestos) fica atrás dele.
  const keyboardOpen = useKeyboardOpen();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-overlay">
        {/* Com o teclado aberto, o fundo encolhe até a barra de status e o sheet passa a caber
            no espaço que sobra (o conteúdo rolável dentro dele encolhe), em vez de subir para fora da tela. */}
        <Pressable
          className="flex-1"
          style={{ minHeight: insets.top + 8 }}
          onPress={onClose}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        />
        <Animated.View
          entering={SlideInDown.duration(200)}
          accessibilityViewIsModal
          className="shrink gap-md rounded-t-sheet border-t border-card-border bg-sheet px-md pt-sm"
          style={[{ paddingBottom: keyboardOpen ? 12 : insets.bottom + 16 }, scheme === 'light' && elevation.sheet]}>
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
