import type { TargetRange } from '@/shared/types/reading';
import { daysBetween, toDateKey } from '@/shared/utils/date';

// Formatação pt-BR feita à mão (sem depender do Intl do motor JS), com a
// capitalização usada no DESIGN ("Quinta-feira, 24 de Outubro").

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');
const toDate = (date: Date | string) => (typeof date === 'string' ? new Date(date) : date);

/** Número com vírgula decimal: 1.5 → "1,5". */
export function formatNumber(value: number, decimals = 0): string {
  const fixed = value.toFixed(decimals);
  return (decimals > 0 ? fixed.replace(/\.?0+$/, '') : fixed).replace('.', ',');
}

/** Valor de glicemia sem unidade: 104.4 → "104". A unidade "mg/dL" é renderizada à parte. */
export function formatGlucose(value: number): string {
  return String(Math.round(value));
}

/** Meta da leitura: "80–130", "máx 180", "mín 70" ou "" sem meta. */
export function formatTargetRange(target: TargetRange | undefined): string {
  if (!target) return '';
  const { min, max } = target;
  if (min !== undefined && max !== undefined) return `${min}–${max}`;
  if (max !== undefined) return `máx ${max}`;
  if (min !== undefined) return `mín ${min}`;
  return '';
}

/** Fração 0–1 em porcentagem inteira: 0.876 → "88%". */
export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** Variabilidade: 18.4 → "±18". */
export function formatVariability(sd: number): string {
  return `±${Math.round(sd)}`;
}

/** Insulina: "0 UI", "1,5 UI", "Correção +1 UI". */
export function formatInsulin(units: number | undefined, isCorrection = false): string {
  const amount = formatNumber(units ?? 0, 1);
  return isCorrection ? `Correção +${amount} UI` : `${amount} UI`;
}

/** "07:30" */
export function formatTime(date: Date | string): string {
  const d = toDate(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "24 de Outubro" */
export function formatDayMonth(date: Date | string): string {
  const d = toDate(date);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "Quinta-feira, 24 de Outubro" */
export function formatLongDate(date: Date | string): string {
  const d = toDate(date);
  return `${WEEKDAYS[d.getDay()]}, ${formatDayMonth(d)}`;
}

/** "21 Out" (eixo do gráfico). */
export function formatShortDate(date: Date | string): string {
  const d = toDate(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** "Outubro 2024" (month 1–12). */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

const relativeDay = (date: Date, now: Date) => {
  const diff = daysBetween(toDateKey(date), toDateKey(now));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return null;
};

/** Cabeçalho de grupo do histórico: "Hoje, 24 de Outubro" / "Terça-feira, 22 de Outubro". */
export function formatDayHeader(date: Date | string, now: Date = new Date()): string {
  const d = toDate(date);
  const relative = relativeDay(d, now);
  return relative ? `${relative}, ${formatDayMonth(d)}` : formatLongDate(d);
}

/** "Hoje às 07:30" / "Ontem às 22:15" / "22/10 às 20:30". */
export function formatReadingMoment(date: Date | string, now: Date = new Date()): string {
  const d = toDate(date);
  const day = relativeDay(d, now) ?? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  return `${day} às ${formatTime(d)}`;
}

/** "1 registro" / "3 registros". */
export function formatReadingCount(count: number): string {
  return `${count} ${count === 1 ? 'registro' : 'registros'}`;
}
