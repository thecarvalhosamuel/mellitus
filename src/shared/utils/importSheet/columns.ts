import { normalizeText } from './cells';

export type ImportField = 'date' | 'time' | 'value' | 'context' | 'insulin' | 'correction' | 'cycleDay' | 'note';

/** Campo → índice da coluna na planilha. */
export type ColumnMapping = Partial<Record<ImportField, number>>;

export const IMPORT_FIELDS: { field: ImportField; label: string; required?: boolean }[] = [
  { field: 'date', label: 'Data (ou data e hora)', required: true },
  { field: 'time', label: 'Hora' },
  { field: 'value', label: 'Glicemia (mg/dL)', required: true },
  { field: 'context', label: 'Momento' },
  { field: 'insulin', label: 'Insulina (UI)' },
  { field: 'correction', label: 'Correção' },
  { field: 'cycleDay', label: 'Dia do ciclo' },
  { field: 'note', label: 'Nota' },
];

const includes = (header: string, words: string[]) => words.some((w) => header.includes(w));

// Ordem importa: "Dia do ciclo" antes de "Data/Dia", "Data/hora" antes de "Hora",
// e colunas de meta nunca viram glicemia.
const RULES: { field: ImportField; test: (h: string) => boolean }[] = [
  { field: 'correction', test: (h) => includes(h, ['correcao', 'correction']) },
  { field: 'insulin', test: (h) => includes(h, ['insulina', 'insulin']) },
  { field: 'cycleDay', test: (h) => includes(h, ['ciclo', 'cycle']) },
  { field: 'note', test: (h) => includes(h, ['nota', 'observ', 'obs', 'note', 'coment']) },
  { field: 'context', test: (h) => includes(h, ['momento', 'contexto', 'context', 'refeicao', 'meal', 'evento']) },
  {
    field: 'date',
    test: (h) => (h.includes('data') && h.includes('hora')) || includes(h, ['datetime', 'timestamp', 'date time']),
  },
  { field: 'time', test: (h) => /^(hora|horario|time)\b/.test(h) },
  { field: 'date', test: (h) => /^(data|date|dia)\b/.test(h) },
  {
    field: 'value',
    test: (h) =>
      !includes(h, ['meta', 'alvo', 'target', 'min', 'max']) &&
      (includes(h, ['glicemia', 'glicose', 'glucose', 'valor', 'value', 'leitura', 'resultado']) || h === 'mg/dl'),
  },
];

/** Mapeamento automático pelos cabeçalhos; cada campo usa a primeira coluna compatível. */
export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  headers.forEach((raw, index) => {
    const header = normalizeText(raw);
    if (!header) return;
    const rule = RULES.find((r) => r.test(header) && mapping[r.field] === undefined);
    if (rule) mapping[rule.field] = index;
  });
  return mapping;
}

export function missingRequired(mapping: ColumnMapping): ImportField[] {
  return IMPORT_FIELDS.filter((f) => f.required && mapping[f.field] === undefined).map((f) => f.field);
}
