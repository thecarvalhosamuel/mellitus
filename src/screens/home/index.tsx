import { router } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

import { GreetingHeader } from './components/greetingHeader';
import { LastReadingCard } from './components/lastReadingCard';
import { NewReadingButton } from './components/newReadingButton';
import { RecentReadingsSection } from './components/recentReadingsSection';
import { useHomeData } from './useHomeData';

// Ciclo do dia, curva glicêmica e métricas do mês entram na etapa 9.
export function HomeScreen() {
  const { profileName, patternName, lastReading, recentReadings } = useHomeData();

  return (
    <>
      <ScreenContainer bottomInset={72}>
        <GreetingHeader name={profileName} patternName={patternName} />
        {lastReading ? (
          <>
            <LastReadingCard reading={lastReading} />
            <RecentReadingsSection readings={recentReadings} onSeeAll={() => router.navigate('/history')} />
          </>
        ) : (
          <EmptyState
            icon="water-drop"
            title="Nenhuma medição ainda"
            description="Registre sua primeira glicemia para acompanhar sua rotina por aqui."
          />
        )}
        {__DEV__ && (
          <Button label="Catálogo de componentes" variant="ghost" icon="widgets" onPress={() => router.push('/dev')} />
        )}
      </ScreenContainer>
      <NewReadingButton onPress={() => router.push('/newReading')} />
    </>
  );
}
