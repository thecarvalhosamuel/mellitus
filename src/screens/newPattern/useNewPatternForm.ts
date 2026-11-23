import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { Attachment } from '@/database/repositories/attachments';
import { pickDocumentAttachment, pickImageAttachment, type PickedFile } from '@/services/attachments';
import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';
import { useToast } from '@/shared/hooks/useToast';
import type { ClinicalPattern, GlucoseAlerts, PatternCondition, PostprandialWindow } from '@/shared/types/pattern';
import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { simulateTimeInRange, validatePatternDraft } from '@/shared/utils/pattern';
import { getPeriodRange } from '@/shared/utils/period';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';

type Doctor = { name: string; crm: string; specialty: string; notes: string };

/** Estado, validação, simulação e salvamento do padrão personalizado (DESIGN.md §5.4). */
export function useNewPatternForm(id?: string) {
  const toast = useToast();
  const existing = usePatternsStore((s) => s.patterns.find((p) => p.id === id && !p.isBuiltin));
  // Novo padrão começa com os valores do Diabetes Comum, para ajustar com o médico.
  const base = existing ?? DEFAULT_PATTERNS[0];

  const [name, setName] = useState(existing?.name ?? '');
  const [condition, setCondition] = useState<PatternCondition | undefined>(existing?.condition);
  const [fasting, setFasting] = useState<TargetRange>(base.fasting);
  const [postMax, setPostMax] = useState<number | undefined>(base.postprandial.max);
  const [windowHours, setWindowHours] = useState<PostprandialWindow>(base.postprandial.windowHours);
  const [bedtime, setBedtime] = useState<TargetRange>(base.bedtime);
  const [alerts, setAlerts] = useState<GlucoseAlerts>(base.alerts);
  const [doctorEnabled, setDoctorEnabled] = useState(existing ? !!existing.medicalTeam : true);
  const [doctor, setDoctor] = useState<Doctor>({
    name: existing?.medicalTeam?.name ?? '',
    crm: existing?.medicalTeam?.crm ?? '',
    specialty: existing?.medicalTeam?.specialty ?? '',
    notes: existing?.medicalTeam?.notes ?? '',
  });
  const [saved, setSaved] = useState<Attachment[]>([]);
  const [added, setAdded] = useState<PickedFile[]>([]);
  const [removed, setRemoved] = useState<Attachment[]>([]);
  const [recent, setRecent] = useState<GlucoseReading[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) usePatternsStore.getState().listAttachments(existing.id).then(setSaved).catch(() => undefined);
    const { from, to } = getPeriodRange('last-30');
    useReadingsStore.getState().listRange(from.toISOString(), to.toISOString()).then(setRecent).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targets = useMemo(
    () => ({ fasting, postprandial: { max: postMax, windowHours }, bedtime, alerts }),
    [fasting, postMax, windowHours, bedtime, alerts],
  );
  const errors = validatePatternDraft({ name, ...targets });
  const simulation = useMemo(() => simulateTimeInRange(recent, targets), [recent, targets]);

  const save = async (activate: boolean) => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || saving) {
      toast.error('Revise os campos destacados antes de salvar.');
      return;
    }
    setSaving(true);
    const pattern: ClinicalPattern = {
      id: existing?.id ?? randomUUID(),
      name: name.trim(),
      kind: 'custom',
      condition,
      ...targets,
      medicalTeam: doctorEnabled && doctor.name.trim() !== '' ? { ...doctor, name: doctor.name.trim() } : undefined,
      status: activate ? 'active' : existing?.status === 'active' ? 'active' : 'draft',
      reviewedAt: existing?.reviewedAt,
    };
    try {
      await usePatternsStore.getState().saveWithAttachments(pattern, { activate }, { added, removed });
      toast.success(activate ? `${pattern.name} ativo nos gráficos e relatórios.` : 'Rascunho salvo.', activate ? 'Padrão ativado!' : undefined);
      router.back();
    } catch {
      toast.error('Não foi possível salvar o padrão. Tente de novo.');
      setSaving(false);
    }
  };

  const attach = async (source: 'image' | 'document') => {
    try {
      const file = source === 'image' ? await pickImageAttachment() : await pickDocumentAttachment();
      if (file) setAdded((list) => [...list, file]);
    } catch {
      toast.error('Não foi possível anexar esse arquivo.');
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Excluir este padrão?', 'Os registros já feitos continuam com as metas da época.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await usePatternsStore.getState().remove(existing.id);
            toast.success('Padrão excluído.');
            router.back();
          } catch {
            toast.error('Não foi possível excluir o padrão.');
          }
        },
      },
    ]);
  };

  return {
    isEdit: !!existing,
    isActive: existing?.status === 'active',
    name, setName, condition, setCondition,
    fasting, setFasting, postMax, setPostMax, windowHours, setWindowHours, bedtime, setBedtime, alerts, setAlerts,
    doctorEnabled, setDoctorEnabled, doctor, setDoctor,
    attachments: [
      ...saved.filter((a) => !removed.includes(a)).map((a) => ({ key: a.id, name: a.fileUri.split('/').pop() ?? 'Anexo', mimeType: a.mimeType, onRemove: () => setRemoved((r) => [...r, a]) })),
      ...added.map((f, i) => ({ key: `new-${i}-${f.uri}`, name: f.name, mimeType: f.mimeType, onRemove: () => setAdded((l) => l.filter((x) => x !== f)) })),
    ],
    attach,
    errors: submitted ? errors : {},
    simulation,
    saving,
    save,
    confirmDelete,
  };
}
