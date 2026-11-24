import { Text } from 'react-native';

import { Card } from '@/components/ui/card';

type ReleaseNotesCardProps = { notes: string };

/** "O que há de novo" com as notas da release em texto simples. */
export function ReleaseNotesCard({ notes }: ReleaseNotesCardProps) {
  return (
    <Card>
      <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
        O que há de novo
      </Text>
      <Text className="font-regular text-body-md text-text-secondary">{notes}</Text>
    </Card>
  );
}
