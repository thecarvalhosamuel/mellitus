import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ToastMessage } from '@/shared/hooks/useToast';

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss: () => void;
};

/**
 * Toast em inverse-surface nos dois temas, com ícone colorido pelo resultado
 * (DESIGN.md §4.7). Anunciado ao leitor de tela; toque para dispensar.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!toast) return null;
  const success = toast.type === 'success';

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-margin" style={{ paddingBottom: insets.bottom + 80 }}>
      <Animated.View key={toast.id} entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={[toast.title, toast.message].filter(Boolean).join('. ')}
          accessibilityHint="Toque para dispensar"
          className="flex-row items-center gap-sm rounded-cta bg-inverse-surface px-md py-3">
          <Icon name={success ? 'check-circle' : 'error'} size={22} color={success ? colors.toastSuccess : colors.toastError} />
          <View className="flex-1">
            {toast.title && <Text className="font-bold text-label-lg text-on-inverse-surface">{toast.title}</Text>}
            <Text className="font-medium text-body-md text-on-inverse-surface">{toast.message}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
