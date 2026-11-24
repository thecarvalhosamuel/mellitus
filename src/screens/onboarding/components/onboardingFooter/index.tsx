import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';

type OnboardingFooterProps = {
  canGoBack: boolean;
  isLast: boolean;
  canContinue: boolean;
  finishing: boolean;
  onBack: () => void;
  onNext: () => void;
};

/** "Continuar" / "Começar" e "Voltar". */
export function OnboardingFooter({ canGoBack, isLast, canContinue, finishing, onBack, onNext }: OnboardingFooterProps) {
  return (
    <View className="gap-sm">
      <GradientButton
        label={isLast ? 'Começar' : 'Continuar'}
        icon={isLast ? 'check-circle' : 'arrow-forward'}
        onPress={onNext}
        disabled={!canContinue}
        loading={finishing}
        loadingLabel="Preparando…"
      />
      {canGoBack && <Button label="Voltar" variant="ghost" fullWidth onPress={onBack} disabled={finishing} />}
    </View>
  );
}
