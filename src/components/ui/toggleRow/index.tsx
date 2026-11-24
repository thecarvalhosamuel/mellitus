import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/shared/hooks/useTheme';

type ToggleRowProps = {
  title: string;
  description?: string;
  icon?: IconName;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** Título + descrição + switch. A linha inteira alterna o valor (alvo de toque maior). */
export function ToggleRow({ title, description, icon, value, onValueChange, disabled = false }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessible={false}
      className="min-h-control flex-row items-center gap-md py-sm">
      {icon && <Icon name={icon} size={22} color={colors.primary} />}
      <View className="flex-1 gap-xs">
        <Text className="font-semibold text-label-lg text-text-strong">{title}</Text>
        {description && <Text className="font-regular text-body-sm text-text-muted">{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={title} accessibilityHint={description} disabled={disabled} />
    </Pressable>
  );
}
