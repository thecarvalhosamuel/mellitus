import { router } from 'expo-router';
import { useState } from 'react';

import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

import { CycleScheduleCard } from './components/cycleScheduleCard';
import { GlucoseCurveSection } from './components/glucoseCurveSection';
import { GreetingHeader } from './components/greetingHeader';
import { LastReadingCard } from './components/lastReadingCard';
import { NewReadingButton } from './components/newReadingButton';
import { RecentReadingsSection } from './components/recentReadingsSection';
import { useHomeData } from './useHomeData';

/** Rolou além disso: o CTA recolhe para o botão redondo. */
const SCROLL_COLLAPSE_THRESHOLD = 24;

export function HomeScreen() {
  const home = useHomeData();
  const [scrolled, setScrolled] = useState(false);

  return (
    <ScreenContainer
      bottomInset={64}
      onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > SCROLL_COLLAPSE_THRESHOLD)}
      floating={<NewReadingButton collapsed={scrolled} onPress={() => router.push('/newReading')} />}>
      <GreetingHeader name={home.profileName} patternName={home.patternName} />
      {home.lastReading ? (
        <LastReadingCard reading={home.lastReading} alerts={home.lastAlerts} monthStats={home.monthStats} />
      ) : (
        <EmptyState
          icon="water-drop"
          title="Nenhuma medição ainda"
          description="Registre sua primeira glicemia para acompanhar sua rotina por aqui."
        />
      )}
      {home.cycle && <CycleScheduleCard {...home.cycle} />}
      {home.lastReading && (
        <>
          <GlucoseCurveSection
            period={home.curve.period}
            periodOptions={home.curve.periodOptions}
            onChangePeriod={home.curve.setPeriod}
            range={home.curve.range}
            readings={home.curve.readings}
            stats={home.curve.stats}
            target={home.curve.target}
          />
          <RecentReadingsSection readings={home.recentReadings} onSeeAll={() => router.navigate('/history')} />
        </>
      )}
      {__DEV__ && (
        <Button label="Catálogo de componentes" variant="ghost" icon="widgets" onPress={() => router.push('/dev')} />
      )}
    </ScreenContainer>
  );
}
