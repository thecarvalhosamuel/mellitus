// Datas de calendário no fuso do aparelho. Chave de dia = "YYYY-MM-DD".

const pad = (n: number) => String(n).padStart(2, '0');

/** Dia local de uma data/ISO como "YYYY-MM-DD". */
export function toDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDateKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

const DAY_MS = 86_400_000;

/** Diferença em dias de calendário (to − from). Imune a horário de verão. */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseDateKey(to) - parseDateKey(from)) / DAY_MS);
}

export function addDays(key: string, days: number): string {
  const d = new Date(parseDateKey(key) + days * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "HH:mm" → minutos desde 00:00. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
