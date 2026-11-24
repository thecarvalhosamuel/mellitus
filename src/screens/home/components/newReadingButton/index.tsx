import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { radius } from '@/shared/theme/tokens';

type NewReadingButtonProps = {
  onPress: () => void;
  /** Recolhido: vira um botão redondo só com o ícone, no canto direito. */
  collapsed: boolean;
};

const LABEL = 'Novo Registro de Glicose';
const HEIGHT = 52;
const FAB_SIZE = 56;

/** CTA fixo acima da tab bar (DESIGN.md §5.1); recolhe em FAB ao rolar a tela. */
export function NewReadingButton({ onPress, collapsed }: NewReadingButtonProps) {
  const { colors, gradients } = useTheme();
  const [fullWidth, setFullWidth] = useState(0);
  const progress = useSharedValue(collapsed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(collapsed ? 1 : 0, { duration: 220 });
  }, [collapsed, progress]);

  const containerStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      width: interpolate(p, [0, 1], [fullWidth, FAB_SIZE]),
      height: interpolate(p, [0, 1], [HEIGHT, FAB_SIZE]),
      borderRadius: interpolate(p, [0, 1], [radius.md, FAB_SIZE / 2]),
    };
  });
  const labelStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.4], [1, 0], 'clamp') }));
  const iconStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.4, 1], [0, 1], 'clamp') }));

  return (
    <View pointerEvents="box-none" className="items-end" onLayout={(e) => setFullWidth(e.nativeEvent.layout.width)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={LABEL}
        hitSlop={4}
        style={{ opacity: fullWidth ? 1 : 0 }}>
        {({ pressed }) => (
          <Animated.View style={[{ overflow: 'hidden', transform: [{ scale: pressed ? 0.98 : 1 }] }, containerStyle]}>
            <LinearGradient
              colors={pressed ? gradients.ctaPressed : gradients.cta}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Conteúdo expandido ancorado à direita: some enquanto o botão encolhe. */}
            <Animated.View
              className="absolute bottom-0 right-0 top-0 flex-row items-center justify-center gap-sm px-md"
              style={[{ width: fullWidth }, labelStyle]}>
              <Icon name="water-drop" size={22} color={colors.onCta} />
              <Text numberOfLines={1} className="font-bold text-label-lg text-on-cta">
                {LABEL}
              </Text>
            </Animated.View>
            <Animated.View className="absolute inset-0 items-center justify-center" style={iconStyle}>
              <Icon name="water-drop" size={26} color={colors.onCta} />
            </Animated.View>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}
