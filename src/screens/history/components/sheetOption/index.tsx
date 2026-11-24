import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

export type SheetOptionProps = { icon: IconName; title: string; description: string; onPress?: () => void };

/** Opção de menu em bottom sheet: ícone, título, descrição e seta (sem ação = "Em breve"). */
export function SheetOption({ icon, title, description, onPress }: SheetOptionProps) {
  const { colors } = useTheme();
  const disabled = !onPress;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${title}. ${description}${disabled ? '. Em breve' : ''}`}
      className={cn(
        'min-h-control flex-row items-center gap-sm rounded-cta border border-control-border bg-control p-3 active:bg-control-pressed',
        disabled && 'opacity-60',
      )}>
      <View className="h-10 w-10 items-center justify-center rounded-cta bg-primary-tint">
        <Icon name={icon} size={22} color={colors.onPrimaryTint} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-label-lg text-text-strong">{title}</Text>
        <Text className="font-regular text-body-sm text-text-muted">{description}</Text>
      </View>
      {disabled ? <Badge label="Em breve" /> : <Icon name="chevron-right" size={22} color={colors.textMuted} />}
    </Pressable>
  );
}
