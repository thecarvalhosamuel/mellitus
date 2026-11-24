import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/infoBanner';

type NotificationsStepProps = { status: 'unknown' | 'granted' | 'denied'; onAsk: () => void };

/** Permissão de notificações, explicada antes do pedido do sistema. */
export function NotificationsStep({ status, onAsk }: NotificationsStepProps) {
  return (
    <View className="gap-md">
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
          Lembretes no seu ritmo
        </Text>
        <Text className="font-regular text-body-md text-text-secondary">
          Avisamos nos horários de medição da sua rotina e depois das refeições. Você ajusta horários e frequência em
          Ajustes.
        </Text>
      </View>
      {status === 'granted' ? (
        <InfoBanner icon="notifications-active" title="Lembretes permitidos" description="Tudo pronto para avisar nos horários." />
      ) : status === 'denied' ? (
        <InfoBanner
          icon="notifications-off"
          title="Lembretes desligados"
          description="Sem problema. Se mudar de ideia, permita as notificações do Mellitus nos ajustes do aparelho."
        />
      ) : (
        <Button label="Permitir lembretes" icon="notifications-active" variant="outlined" fullWidth onPress={onAsk} />
      )}
    </View>
  );
}
