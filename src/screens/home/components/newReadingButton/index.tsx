import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/ui/gradientButton';
import { layout } from '@/shared/theme/tokens';

type NewReadingButtonProps = { onPress: () => void };

/** CTA fixo acima da tab bar (DESIGN.md §5.1). */
export function NewReadingButton({ onPress }: NewReadingButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 px-margin"
      style={{ bottom: insets.bottom + layout.tabBarHeight + 12 }}>
      <GradientButton label="Novo Registro de Glicose" icon="water-drop" onPress={onPress} />
    </View>
  );
}
