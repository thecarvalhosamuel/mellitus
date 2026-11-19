import type { TargetRange } from '../reading';

export type PatternKind = 'standard' | 'gestational' | 'custom';

export type PatternCondition =
  | 'strict-dm'
  | 'prediabetes'
  | 'athlete'
  | 'reactive-hypo'
  | 'gestational'
  | 'other';

export type PatternStatus = 'active' | 'draft' | 'inactive';

export type PostprandialWindow = 1 | 2;

export type GlucoseAlerts = {
  /** Abaixo disso: Hipo Leve. */
  hypo: number;
  /** Acima disso: Hiper Severa. */
  hyper: number;
  hypoBypassDND: boolean;
};

export type MedicalTeam = {
  name: string;
  crm: string;
  specialty: string;
  notes?: string;
  attachments?: string[];
};

export type ClinicalPattern = {
  id: string;
  name: string;
  kind: PatternKind;
  condition?: PatternCondition;
  fasting: TargetRange;
  postprandial: TargetRange & { windowHours: PostprandialWindow };
  bedtime: TargetRange;
  alerts: GlucoseAlerts;
  medicalTeam?: MedicalTeam;
  status: PatternStatus;
  reviewedAt?: string;
};

/** Faixas usadas para classificar uma leitura. */
export type PatternTargets = Pick<ClinicalPattern, 'fasting' | 'postprandial' | 'bedtime' | 'alerts'>;
