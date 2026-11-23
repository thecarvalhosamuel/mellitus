import type { ClinicalPattern, PatternCondition } from '@/shared/types/pattern';

/** Condição ou objetivo clínico do padrão personalizado (DESIGN.md §5.4). */
export const PATTERN_CONDITIONS: { value: PatternCondition; label: string }[] = [
  { value: 'strict-dm', label: 'Diabetes Tipo 1/2 com Alvo Estrito' },
  { value: 'prediabetes', label: 'Pré-Diabetes & Resistência Insulínica' },
  { value: 'athlete', label: 'Atleta / Treinamento de Alta Intensidade' },
  { value: 'reactive-hypo', label: 'Hipoglicemia Reativa / Pós-Bariátrica' },
  { value: 'gestational', label: 'Diabetes Gestacional (Protocolo Rígido)' },
  { value: 'other', label: 'Outro Ajuste Especializado' },
];

/**
 * Subtítulo do card do padrão. Sem citar entidades (SBD, ADA…) até a validação
 * clínica confirmar o uso (DESIGN.md §11, pendências).
 */
export function describePattern(pattern: Pick<ClinicalPattern, 'kind' | 'condition'>): string {
  if (pattern.kind === 'standard') return 'Tipo 1, Tipo 2 e LADA, para adultos';
  if (pattern.kind === 'gestational') return 'Pré-natal e obstetrícia';
  const condition = PATTERN_CONDITIONS.find((c) => c.value === pattern.condition);
  return condition?.label ?? 'Configurado por você ou pelo seu médico';
}
