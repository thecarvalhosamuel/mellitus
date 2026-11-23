import { Text, View } from 'react-native';

import { CycleProgressRing } from '@/components/glucose/cycleProgressRing';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type CycleScheduleCardProps = {
  title: string;
  todayTag?: string;
  moments: { label: string; time?: string; done: boolean }[];
  done: number;
  total: number;
  tomorrow: string;
};

/** "Frequência Programada": momentos de hoje feitos/pendentes, amanhã e anel 1/3 (DESIGN.md §5.1). */
export function CycleScheduleCard({ title, todayTag, moments, done, total, tomorrow }: CycleScheduleCardProps) {
  const { colors } = useTheme();

  return (
    <Card variant="highlight">
      <View className="flex-row items-start gap-md">
        <View className="flex-1 gap-sm">
          <View className="flex-row items-center gap-xs">
            <Icon name="event-repeat" size={20} color={colors.primary} />
            <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
              {title}
            </Text>
          </View>
          {todayTag && <Badge label={todayTag} tone="primary" />}
          {moments.length === 0 ? (
            <Text className="font-regular text-body-md text-text-secondary">
              Hoje é dia de descanso. Aproveite o dia leve.
            </Text>
          ) : (
            <View className="gap-xs">
              {moments.map((moment, index) => (
                <View key={`${moment.label}-${index}`} className="flex-row items-center gap-xs">
                  <Icon
                    name={moment.done ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={moment.done ? colors.status.inRange.fg : colors.textMuted}
                  />
                  <Text
                    className={cn(
                      'font-medium text-body-sm',
                      moment.done ? 'text-status-in-range-fg' : 'text-text-secondary',
                    )}>
                    {moment.label}
                    {moment.time ? ` · ${moment.time}` : ''} ({moment.done ? 'Feito' : 'Pendente'})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {total > 0 && <CycleProgressRing done={done} total={total} />}
      </View>
      <View className="flex-row items-center gap-xs">
        <Icon name="event" size={16} color={colors.textMuted} />
        <Text className="flex-1 font-regular text-body-sm text-text-muted">{tomorrow}</Text>
      </View>
    </Card>
  );
}
