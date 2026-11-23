import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { DoctorCard } from '@/components/glucose/doctorCard';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradientButton';
import { InfoBanner } from '@/components/ui/infoBanner';

import { GoalsHeader } from './components/goalsHeader';
import { PatternCard } from './components/patternCard';
import { useGoals } from './useGoals';

export function GoalsScreen() {
  const goals = useGoals();

  return (
    <ScreenContainer>
      <GoalsHeader />
      <InfoBanner
        icon="lightbulb"
        title="Por que o padrão importa?"
        description="Gráficos, avisos de hipo e hiper e relatórios se adaptam aos limites escolhidos. Leituras antigas mantêm a meta da época."
      />
      <View accessibilityRole="radiogroup" accessibilityLabel="Padrões de acompanhamento" className="gap-sm">
        {goals.patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isActive={pattern.id === goals.activeId}
            selected={pattern.id === goals.selected?.id}
            onSelect={() => goals.select(pattern.id)}
            onEdit={pattern.isBuiltin ? undefined : () => goals.edit(pattern.id)}
          />
        ))}
      </View>
      <Button label="Criar Padrão Personalizado" variant="outlined" icon="add-circle-outline" fullWidth onPress={goals.create} />
      {goals.selected?.medicalTeam && (
        <DoctorCard team={goals.selected.medicalTeam} reviewedAt={goals.selected.reviewedAt} />
      )}
      <GradientButton
        label="Salvar e Aplicar Padrão"
        icon="check-circle"
        onPress={goals.apply}
        disabled={!goals.canApply}
        loading={goals.applying}
        loadingLabel="Aplicando…"
      />
      <Text className="text-center font-regular text-body-sm text-text-muted">
        Você pode alternar entre os padrões a qualquer momento sem perder os registros já feitos.
      </Text>
    </ScreenContainer>
  );
}
