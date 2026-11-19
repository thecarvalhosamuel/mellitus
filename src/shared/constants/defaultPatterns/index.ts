import type { ClinicalPattern } from '@/shared/types/pattern';

// ⚠️ Valores clínicos de EXEMPLO (DESIGN.md §5.3 e §13.4). Precisam de validação
// por profissional de saúde antes do lançamento. Não alterar sem pedido explícito.

export const STANDARD_PATTERN_ID = 'builtin-standard';
export const GESTATIONAL_PATTERN_ID = 'builtin-gestational';

const defaultAlerts = { hypo: 70, hyper: 200, hypoBypassDND: true };

export const DEFAULT_PATTERNS: ClinicalPattern[] = [
  {
    id: STANDARD_PATTERN_ID,
    name: 'Diabetes Comum',
    kind: 'standard',
    fasting: { min: 80, max: 130 },
    postprandial: { max: 180, windowHours: 2 },
    bedtime: { min: 100, max: 140 },
    alerts: defaultAlerts,
    status: 'active',
  },
  {
    id: GESTATIONAL_PATTERN_ID,
    name: 'Diabetes Gestacional',
    kind: 'gestational',
    condition: 'gestational',
    fasting: { min: 70, max: 95 },
    // O modelo guarda uma única janela pós-prandial: 1h ≤ 140 (2h ≤ 120 não é representável hoje).
    postprandial: { max: 140, windowHours: 1 },
    // Sem meta específica ao deitar no protocolo: usa a faixa de jejum (ver getTargetForContext).
    bedtime: {},
    alerts: defaultAlerts,
    status: 'inactive',
  },
];
