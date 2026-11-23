import { useMemo } from 'react';

import type { GlucoseReading, TargetRange } from '@/shared/types/reading';
import { glucoseDomain, linearScale, monotonePath, pickTickIndexes } from '@/shared/utils/chart';
import { toDateKey } from '@/shared/utils/date';

export const CHART_HEIGHT = 176;
export const PADDING = { top: 12, right: 12, bottom: 24, left: 34 };

/** Escalas, caminho da curva e rótulos do eixo X para o tamanho medido do gráfico. */
export function useChartScale(
  readings: GlucoseReading[],
  target: TargetRange,
  range: { from: Date; to: Date },
  width: number,
) {
  return useMemo(() => {
    const innerRight = Math.max(PADDING.left + 1, width - PADDING.right);
    const innerBottom = CHART_HEIGHT - PADDING.bottom;
    const x = linearScale([range.from.getTime(), range.to.getTime()], [PADDING.left, innerRight]);
    const domain = glucoseDomain(
      readings.map((r) => r.value),
      target,
    );
    const y = linearScale(domain, [innerBottom, PADDING.top]);

    const points = readings.map((r) => ({ reading: r, x: x(Date.parse(r.timestamp)), y: y(r.value) }));
    const line = monotonePath(points);
    const area =
      points.length > 1
        ? `${line} L${points[points.length - 1].x},${innerBottom} L${points[0].x},${innerBottom} Z`
        : '';

    // Rótulos do eixo X: até 4 dias distintos com leitura.
    const days = [...new Set(readings.map((r) => toDateKey(r.timestamp)))];
    const ticks = pickTickIndexes(days.length).map((i) => {
      const [yy, mm, dd] = days[i].split('-').map(Number);
      const noon = new Date(yy, mm - 1, dd, 12);
      return { dateKey: days[i], date: noon, x: x(noon.getTime()) };
    });

    return { x, y, domain, points, line, area, ticks, innerBottom, innerRight };
  }, [readings, target, range.from, range.to, width]);
}
