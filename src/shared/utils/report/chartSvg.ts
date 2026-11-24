import type { ThemeColors } from '@/shared/theme/colors';
import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { glucoseDomain, linearScale, monotonePath, pickTickIndexes } from '@/shared/utils/chart';
import { toDateKey } from '@/shared/utils/date';
import { formatShortDate } from '@/shared/utils/format';
import { getStatusFamily } from '@/shared/utils/glucose';

const PAD = { top: 12, right: 12, bottom: 26, left: 36 };

/**
 * Curva glicêmica como SVG em texto para o laudo (mesmas escalas do app):
 * corredor-alvo, linha suave e pontos na cor do status.
 */
export function buildChartSvg(
  readings: GlucoseReading[],
  target: TargetRange,
  range: { from: Date; to: Date },
  colors: ThemeColors,
  size: { width: number; height: number } = { width: 680, height: 220 },
): string {
  const { width, height } = size;
  const sorted = [...readings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  const x = linearScale([range.from.getTime(), range.to.getTime()], [PAD.left, width - PAD.right]);
  const domain = glucoseDomain(sorted.map((r) => r.value), target);
  const y = linearScale(domain, [height - PAD.bottom, PAD.top]);
  const points = sorted.map((r) => ({ r, x: x(Date.parse(r.timestamp)), y: y(r.value) }));

  const bandTop = y(target.max ?? domain[1]);
  const bandBottom = y(target.min ?? domain[0]);
  const parts: string[] = [
    `<rect x="${PAD.left}" y="${bandTop}" width="${width - PAD.left - PAD.right}" height="${Math.max(0, bandBottom - bandTop)}" fill="${colors.status.inRange.base}" fill-opacity="0.14"/>`,
  ];
  for (const limit of [target.min, target.max]) {
    if (limit === undefined) continue;
    const ly = y(limit);
    parts.push(
      `<line x1="${PAD.left}" x2="${width - PAD.right}" y1="${ly}" y2="${ly}" stroke="${colors.status.inRange.base}" stroke-width="1" stroke-dasharray="4 4"/>`,
      `<text x="${PAD.left - 6}" y="${ly + 3}" font-size="9" text-anchor="end" fill="${colors.textMuted}">${limit}</text>`,
    );
  }
  parts.push(
    `<line x1="${PAD.left}" x2="${width - PAD.right}" y1="${height - PAD.bottom}" y2="${height - PAD.bottom}" stroke="${colors.cardBorder}"/>`,
  );
  if (points.length > 1) {
    parts.push(`<path d="${monotonePath(points)}" fill="none" stroke="${colors.primary}" stroke-width="2" stroke-linejoin="round"/>`);
  }
  for (const { r, x: px, y: py } of points) {
    const family = getStatusFamily(r.status);
    const fill = family === 'inRange' ? colors.primary : colors.status[family].base;
    parts.push(`<circle cx="${px}" cy="${py}" r="3" fill="${fill}" stroke="#FFFFFF" stroke-width="1"/>`);
  }
  const days = [...new Set(sorted.map((r) => toDateKey(r.timestamp)))];
  for (const index of pickTickIndexes(days.length, 6)) {
    const [yy, mm, dd] = days[index].split('-').map(Number);
    const noon = new Date(yy, mm - 1, dd, 12);
    parts.push(
      `<text x="${x(noon.getTime())}" y="${height - 8}" font-size="9" text-anchor="middle" fill="${colors.textMuted}">${formatShortDate(noon)}</text>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Curva glicêmica do período">${parts.join('')}</svg>`;
}
