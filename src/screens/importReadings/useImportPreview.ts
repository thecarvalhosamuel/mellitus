import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useToast } from '@/shared/hooks/useToast';
import {
  type ColumnMapping,
  type ImportField,
  type ImportParseResult,
  detectColumns,
  missingRequired,
  parseImportTable,
} from '@/shared/utils/importSheet';
import { buildReading } from '@/shared/utils/reading';
import { useImportStore } from '@/stores/import';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';

/** Quantas leituras aparecem na amostra da pré-visualização. */
const PREVIEW_LIMIT = 5;
const NONE = 'none';

const columnLetter = (index: number): string =>
  (index >= 26 ? columnLetter(Math.floor(index / 26) - 1) : '') + String.fromCharCode(65 + (index % 26));

/** Mapeamento de colunas, validação, duplicatas e confirmação da importação. */
export function useImportPreview() {
  const toast = useToast();
  const pending = useImportStore((s) => s.pending);
  const pattern = usePatternsStore((s) => s.active);
  const [mapping, setMapping] = useState<ColumnMapping>(() => (pending ? detectColumns(pending.table.headers) : {}));
  const [importing, setImporting] = useState(false);
  // Chaves já gravadas no banco, ligadas ao resultado que as originou (evita mostrar dados velhos).
  const [existing, setExisting] = useState<{ source: ImportParseResult; keys: Set<string> } | null>(null);

  const missing = missingRequired(mapping);
  const parsed = useMemo(
    () => (pending && missing.length === 0 ? parseImportTable(pending.table, mapping) : null),
    [pending, mapping, missing.length],
  );

  useEffect(() => {
    if (!parsed) return;
    let alive = true;
    useReadingsStore
      .getState()
      .findExistingKeys(parsed.candidates.map((c) => ({ timestamp: c.input.timestamp, value: c.input.value })))
      .then((keys) => alive && setExisting({ source: parsed, keys }))
      .catch(() => alive && setExisting({ source: parsed, keys: new Set() }));
    return () => {
      alive = false;
    };
  }, [parsed]);

  const existingKeys = parsed && existing?.source === parsed ? existing.keys : null;
  const toImport = parsed && existingKeys ? parsed.candidates.filter((c) => !existingKeys.has(c.key)) : [];
  const duplicates = parsed && existingKeys ? parsed.duplicatesInFile + parsed.candidates.length - toImport.length : 0;
  const sample = pattern
    ? toImport.slice(0, PREVIEW_LIMIT).map((c) => buildReading(`preview-${c.row}`, c.input, pattern))
    : [];

  const columnOptions = [
    { value: NONE, label: 'Não importar' },
    ...(pending?.table.headers ?? []).map((header, index) => ({
      value: String(index),
      label: `${columnLetter(index)} · ${header || 'Sem título'}`,
    })),
  ];

  const setColumn = (field: ImportField, value: string) =>
    setMapping((current) => {
      const next = { ...current };
      if (value === NONE) delete next[field];
      else next[field] = Number(value);
      return next;
    });

  const close = () => {
    useImportStore.getState().clear();
    router.back();
  };

  const confirm = async () => {
    if (toImport.length === 0) return;
    setImporting(true);
    try {
      const inserted = await useReadingsStore.getState().importMany(toImport.map((c) => c.input));
      toast.success(
        inserted === 1 ? '1 leitura foi importada.' : `${inserted} leituras foram importadas.`,
        'Importação concluída',
      );
      close();
    } catch {
      toast.error('Não foi possível importar. Nenhuma leitura foi gravada.');
    } finally {
      setImporting(false);
    }
  };

  return {
    fileName: pending?.fileName,
    hasFile: pending !== null,
    totalRows: pending?.table.rows.length ?? 0,
    patternName: pattern?.name ?? '',
    mapping,
    columnValue: (field: ImportField) => (mapping[field] === undefined ? NONE : String(mapping[field])),
    columnOptions,
    setColumn,
    missing,
    checking: parsed !== null && existingKeys === null,
    toImportCount: toImport.length,
    duplicates,
    issues: parsed?.issues ?? [],
    sample,
    importing,
    confirm,
    cancel: close,
  };
}
