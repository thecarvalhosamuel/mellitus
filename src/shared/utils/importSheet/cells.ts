import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { CycleDay, MealContext } from '@/shared/types/reading';

/** Célula crua lida da planilha (SheetJS com `raw: true`). */
export type Cell = string | number | boolean | null | undefined;

export type DateParts = { y: number; m: number; d: number; h?: number; min?: number };
export type TimeParts = { h: number; min: number };

/** Minúsculas, sem acentos e com espaços simples (comparação de cabeçalhos e rótulos). */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export const cellText = (cell: Cell) => (cell === null || cell === undefined ? '' : String(cell).trim());

/** Número de série do Excel (dias desde 30/12/1899) em partes, sem depender do fuso. */
function serialToParts(serial: number): Required<DateParts> {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(serial * 1440) * 60_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() };
}

const isValidDay = ({ y, m, d }: DateParts) => {
  const date = new Date(y, m - 1, d);
  return y >= 1900 && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};
const isValidTime = (h: number, min: number) => h >= 0 && h <= 23 && min >= 0 && min <= 59;

const DAY_FIRST = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(?:[ T,]+(\d{1,2})[:h](\d{2})(?::\d{2})?)?$/;
const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Data (com hora opcional): série do Excel, "dd/mm/aaaa [hh:mm]" (padrão
 * brasileiro, dia primeiro) ou ISO "aaaa-mm-dd[Thh:mm[Z]]".
 */
export function parseDateCell(cell: Cell): DateParts | null {
  if (typeof cell === 'number') return cell >= 1 && Number.isFinite(cell) ? serialToParts(cell) : null;
  const text = cellText(cell);
  let parts: DateParts | null = null;

  const br = DAY_FIRST.exec(text);
  if (br) {
    const year = Number(br[3]);
    parts = { d: Number(br[1]), m: Number(br[2]), y: br[3].length === 2 ? 2000 + year : year };
    if (br[4] !== undefined) Object.assign(parts, { h: Number(br[4]), min: Number(br[5]) });
  }
  const iso = !br && ISO.exec(text);
  if (iso) {
    if (iso[6]) {
      // Com fuso explícito: converte para o horário local do aparelho.
      const date = new Date(text.replace(' ', 'T'));
      if (Number.isNaN(date.getTime())) return null;
      return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), min: date.getMinutes() };
    }
    parts = { y: Number(iso[1]), m: Number(iso[2]), d: Number(iso[3]) };
    if (iso[4] !== undefined) Object.assign(parts, { h: Number(iso[4]), min: Number(iso[5]) });
  }

  if (!parts || !isValidDay(parts)) return null;
  if (parts.h !== undefined && !isValidTime(parts.h, parts.min ?? 0)) return null;
  return parts;
}

/** Hora: "07:30", "7h30", "07:30:12" ou fração de dia do Excel (0,3125). */
export function parseTimeCell(cell: Cell): TimeParts | null {
  if (typeof cell === 'number') {
    if (!Number.isFinite(cell) || cell < 0) return null;
    const { h, min } = serialToParts(1 + (cell % 1));
    return { h, min };
  }
  const match = /^(\d{1,2})[:h](\d{2})(?::\d{2})?$/i.exec(cellText(cell));
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  return isValidTime(h, min) ? { h, min } : null;
}

/** Número aceitando vírgula decimal e unidade junto ("104 mg/dL", "1,5"). */
export function parseNumberCell(cell: Cell): number | null {
  if (typeof cell === 'number') return Number.isFinite(cell) ? cell : null;
  const text = cellText(cell)
    .replace(/mg\/dl|ui|u\b/gi, '')
    .replace(',', '.')
    .trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

const CONTEXT_LOOKUP = new Map<string, MealContext>(
  (Object.keys(READING_CONTEXTS) as MealContext[]).flatMap((id) => [
    [id, id],
    [normalizeText(READING_CONTEXTS[id].label), id],
  ]),
);

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

/** Momento da leitura por rótulo, identificador ou palavras comuns; sem pista vira "Outro". */
export function parseContextCell(cell: Cell): MealContext {
  const text = normalizeText(cellText(cell));
  if (!text) return 'other';
  const exact = CONTEXT_LOOKUP.get(text);
  if (exact) return exact;

  if (has(text, ['jejum', 'fasting', 'em jejum'])) return 'fasting';
  if (has(text, ['madrugada', 'overnight', 'night'])) return 'overnight';
  if (has(text, ['deitar', 'dormir', 'bedtime', 'bed'])) return 'bedtime';
  const after = has(text, ['pos', 'depois', 'after', 'post']);
  const before = has(text, ['pre', 'antes', 'before']);
  if (has(text, ['jantar', 'janta', 'dinner'])) return after ? 'post-dinner' : 'pre-dinner';
  if (after) return /\b1 ?h\b/.test(text) ? 'post-meal-1h' : 'post-meal-2h';
  if (before) return 'pre-meal';
  return 'other';
}

/** "Sim", "S", "x", "1", "true" → true. */
export function parseYesCell(cell: Cell): boolean {
  if (typeof cell === 'boolean') return cell;
  return ['sim', 's', 'x', '1', 'true', 'yes', 'y'].includes(normalizeText(cellText(cell)));
}

/** "A", "B" ou "Dia A". */
export function parseCycleDayCell(cell: Cell): CycleDay | undefined {
  const text = normalizeText(cellText(cell)).replace(/^dia /, '');
  return text === 'a' ? 'A' : text === 'b' ? 'B' : undefined;
}
