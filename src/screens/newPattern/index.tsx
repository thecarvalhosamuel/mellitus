import { router, useLocalSearchParams } from 'expo-router';

import { ScreenContainer } from '@/components/layout/screenContainer';

import { FormActions } from './components/formActions';
import { MedicalTeamStep } from './components/medicalTeamStep';
import { NewPatternHeader } from './components/newPatternHeader';
import { ProfileStep } from './components/profileStep';
import { TargetsStep } from './components/targetsStep';
import { TirSimulationCard } from './components/tirSimulationCard';
import { useNewPatternForm } from './useNewPatternForm';

// A frequência de medição fica em Ajustes (etapa 11), compartilhada por todos os padrões.
export function NewPatternScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const form = useNewPatternForm(id);

  return (
    <ScreenContainer>
      <NewPatternHeader isEdit={form.isEdit} onBack={() => router.back()} />
      <ProfileStep
        name={form.name}
        onNameChange={form.setName}
        condition={form.condition}
        onConditionChange={form.setCondition}
        nameError={form.errors.name}
      />
      <TargetsStep
        fasting={form.fasting}
        onFastingChange={form.setFasting}
        postMax={form.postMax}
        onPostMaxChange={form.setPostMax}
        windowHours={form.windowHours}
        onWindowChange={form.setWindowHours}
        bedtime={form.bedtime}
        onBedtimeChange={form.setBedtime}
        alerts={form.alerts}
        onAlertsChange={form.setAlerts}
        errors={form.errors}
      />
      <TirSimulationCard count={form.simulation.count} tir={form.simulation.tir} />
      <MedicalTeamStep
        enabled={form.doctorEnabled}
        onEnabledChange={form.setDoctorEnabled}
        doctor={form.doctor}
        onDoctorChange={form.setDoctor}
        attachments={form.attachments}
        onAttach={form.attach}
      />
      <FormActions
        saving={form.saving}
        isActive={form.isActive}
        isEdit={form.isEdit}
        onSaveAndActivate={() => form.save(true)}
        onSaveDraft={() => form.save(false)}
        onCancel={() => router.back()}
        onDelete={form.confirmDelete}
      />
    </ScreenContainer>
  );
}
