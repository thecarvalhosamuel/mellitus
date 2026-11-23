import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/iconButton';
import { useTheme } from '@/shared/hooks/useTheme';

export type AttachmentItem = { key: string; name: string; mimeType: string; onRemove: () => void };

type AttachmentListProps = { items: AttachmentItem[] };

/** Receitas e laudos anexados (foto ou PDF), com remoção. */
export function AttachmentList({ items }: AttachmentListProps) {
  const { colors } = useTheme();
  if (items.length === 0) return null;

  return (
    <View className="gap-xs">
      {items.map((item) => (
        <View key={item.key} className="flex-row items-center gap-sm rounded-input border border-inset-border bg-inset pl-3">
          <Icon name={item.mimeType === 'application/pdf' ? 'picture-as-pdf' : 'image'} size={20} color={colors.primary} />
          <Text numberOfLines={1} className="flex-1 font-medium text-body-sm text-text-secondary">
            {item.name}
          </Text>
          <IconButton icon="close" accessibilityLabel={`Remover ${item.name}`} onPress={item.onRemove} size={20} />
        </View>
      ))}
    </View>
  );
}
