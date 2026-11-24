import { Text, View } from 'react-native';

import { InfoBanner } from '@/components/ui/infoBanner';
import { TextField } from '@/components/ui/textField';

type WelcomeStepProps = { name: string; onNameChange: (name: string) => void; maxLength: number };

/** Boas-vindas, privacidade e o nome (opcional) usado no avatar e na saudação. */
export function WelcomeStep({ name, onNameChange, maxLength }: WelcomeStepProps) {
  return (
    <View className="gap-md">
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-lg text-text-strong">
          Boas-vindas ao Mellitus
        </Text>
        <Text className="font-regular text-body-md text-text-secondary">
          Registre suas glicemias, acompanhe as metas combinadas com seu médico e leve um histórico organizado para a
          consulta.
        </Text>
      </View>
      <InfoBanner
        icon="smartphone"
        title="Seus dados ficam neste aparelho"
        description="Sem conta, sem nuvem. Nada sai daqui sem você pedir."
      />
      <TextField
        label="Como podemos te chamar?"
        value={name}
        onChangeText={onNameChange}
        placeholder="Seu nome (opcional)"
        maxLength={maxLength}
        autoCapitalize="words"
        helper="Aparece na saudação e no laudo em PDF. Você pode mudar depois em Ajustes."
      />
    </View>
  );
}
