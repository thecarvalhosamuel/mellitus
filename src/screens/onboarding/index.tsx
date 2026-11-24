import { ScreenContainer } from '@/components/layout/screenContainer';

import { NotificationsStep } from './components/notificationsStep';
import { OnboardingFooter } from './components/onboardingFooter';
import { OnboardingProgress } from './components/onboardingProgress';
import { PatternStep } from './components/patternStep';
import { WelcomeStep } from './components/welcomeStep';
import { ONBOARDING_STEPS, useOnboarding } from './useOnboarding';

/** Primeiro uso: nome → padrão inicial → lembretes. */
export function OnboardingScreen() {
  const onboarding = useOnboarding();

  return (
    <ScreenContainer variant="plain">
      <OnboardingProgress step={onboarding.step} total={ONBOARDING_STEPS} />
      {onboarding.step === 0 && (
        <WelcomeStep name={onboarding.name} onNameChange={onboarding.setName} maxLength={onboarding.nameMax} />
      )}
      {onboarding.step === 1 && (
        <PatternStep patterns={onboarding.patterns} selectedId={onboarding.patternId} onSelect={onboarding.setPatternId} />
      )}
      {onboarding.step === 2 && (
        <NotificationsStep status={onboarding.notifications} onAsk={onboarding.askNotifications} />
      )}
      <OnboardingFooter
        canGoBack={onboarding.step > 0}
        isLast={onboarding.isLast}
        canContinue={onboarding.canContinue}
        finishing={onboarding.finishing}
        onBack={onboarding.back}
        onNext={onboarding.next}
      />
    </ScreenContainer>
  );
}
