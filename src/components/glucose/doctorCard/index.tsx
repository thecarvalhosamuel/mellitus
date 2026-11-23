import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import type { MedicalTeam } from '@/shared/types/pattern';

type DoctorCardProps = { team: MedicalTeam; reviewedAt?: string };

/** Médico cadastrado manualmente pelo usuário (sem conta profissional no MVP). */
export function DoctorCard({ team, reviewedAt }: DoctorCardProps) {
  const details = [team.crm, team.specialty].filter(Boolean).join(' • ');

  return (
    <View className="flex-row items-center gap-sm rounded-card border border-inset-border bg-inset p-md">
      <Avatar name={team.name} size="md" />
      <View className="flex-1 gap-xs">
        <Text className="font-bold text-label-lg text-text-strong">{team.name || 'Médico(a)'}</Text>
        {details !== '' && <Text className="font-regular text-body-sm text-text-secondary">{details}</Text>}
        {reviewedAt && <Text className="font-medium text-body-sm text-primary">Revisado em {reviewedAt}</Text>}
      </View>
    </View>
  );
}
