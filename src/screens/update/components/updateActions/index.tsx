import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';

type UpdateActionsProps = { opening: boolean; skipping: boolean; onUpdate: () => void; onSkip: () => void };

/** "Atualizar agora" e "Pular por hoje", com o aviso do que muda ao adiar. */
export function UpdateActions({ opening, skipping, onUpdate, onSkip }: UpdateActionsProps) {
  return (
    <View className="gap-sm">
      <GradientButton
        label="Atualizar agora"
        icon="download"
        onPress={onUpdate}
        loading={opening}
        loadingLabel="Abrindo…"
        disabled={skipping}
      />
      <Button
        label="Pular por hoje"
        variant="ghost"
        fullWidth
        onPress={onSkip}
        loading={skipping}
        loadingLabel="Pulando…"
        disabled={opening}
        accessibilityHint="O aviso volta a aparecer amanhã"
      />
      <Text className="text-center font-regular text-body-sm text-text-muted">
        Lembraremos você de novo amanhã.
      </Text>
    </View>
  );
}
