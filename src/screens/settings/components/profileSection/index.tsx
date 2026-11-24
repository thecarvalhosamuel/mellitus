import { Text } from 'react-native';

import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/textField';

type ProfileSectionProps = { name: string; onNameChange: (name: string) => void };

/** Nome do avatar, da saudação e do laudo (só neste aparelho). */
export function ProfileSection({ name, onNameChange }: ProfileSectionProps) {
  return (
    <Card>
      <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
        Perfil
      </Text>
      <TextField
        label="Nome"
        value={name}
        onChangeText={onNameChange}
        placeholder="Seu nome (opcional)"
        maxLength={40}
        autoCapitalize="words"
        helper="Aparece na saudação, no avatar e no laudo em PDF."
      />
    </Card>
  );
}
