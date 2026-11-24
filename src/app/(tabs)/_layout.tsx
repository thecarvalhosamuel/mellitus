import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { AppHeader } from '@/components/layout/appHeader';
import { TabBar } from '@/components/layout/tabBar';
import { TabBarFrameProvider } from '@/components/layout/tabBarFrame';
import { Icon, type IconName } from '@/components/ui/icon';
import { useSettingsStore } from '@/stores/settings';

// Abas (DESIGN.md §3.1): rótulo da aba em `title`, subtítulo do header em `headerTitle`.
const TABS: { name: string; title: string; subtitle: string; icon: IconName }[] = [
  { name: 'index', title: 'Início', subtitle: 'Início', icon: 'ssid-chart' },
  { name: 'history', title: 'Histórico', subtitle: 'Histórico E Registros', icon: 'calendar-month' },
  { name: 'goals', title: 'Metas', subtitle: 'Metas E Padrões', icon: 'track-changes' },
  { name: 'settings/index', title: 'Ajustes', subtitle: 'Configurações E Frequência', icon: 'tune' },
];

export default function TabsLayout() {
  const profileName = useSettingsStore((s) => s.settings.profile?.name);

  return (
    <TabBarFrameProvider>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerTransparent: true,
          header: ({ options }) => (
            <AppHeader
              subtitle={typeof options.headerTitle === 'string' ? options.headerTitle : (options.title ?? '')}
              profileName={profileName}
              onPressProfile={() => router.navigate('/settings')}
            />
          ),
        }}>
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              headerTitle: tab.subtitle,
              tabBarIcon: ({ color, size }) => <Icon name={tab.icon} color={String(color)} size={size} />,
            }}
          />
        ))}
      </Tabs>
    </TabBarFrameProvider>
  );
}
