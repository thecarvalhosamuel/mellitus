import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';

type NotificationPermissionBannerProps = { blocked: boolean; onRequest: () => void };

/** Lembretes ligados no app, mas sem permissão do aparelho: explica e oferece o caminho. */
export function NotificationPermissionBanner({ blocked, onRequest }: NotificationPermissionBannerProps) {
  const { colors } = useTheme();

  return (
    <View className="gap-sm rounded-card border border-status-off-target-border bg-status-off-target-bg p-md">
      <View className="flex-row gap-sm">
        <Icon name="notifications-off" size={22} color={colors.status.offTarget.fg} />
        <View className="flex-1 gap-xs">
          <Text className="font-bold text-label-lg text-text-strong">Notificações desligadas</Text>
          <Text className="font-regular text-body-sm text-text-secondary">
            {blocked
              ? 'Os lembretes estão ligados aqui, mas o aparelho não deixa o Mellitus avisar. Ative as notificações nos ajustes do aparelho.'
              : 'Os lembretes estão ligados aqui, mas o Mellitus ainda não tem permissão para avisar.'}
          </Text>
        </View>
      </View>
      <Button
        label={blocked ? 'Abrir ajustes do aparelho' : 'Permitir notificações'}
        icon={blocked ? 'open-in-new' : 'notifications-active'}
        variant="secondary"
        fullWidth
        onPress={onRequest}
      />
    </View>
  );
}
