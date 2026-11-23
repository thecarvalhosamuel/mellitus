// Escalas e traçado da curva glicêmica (DESIGN.md §4.6). Funções puras, sem SVG.

export type Point = { x: number; y: number };

export type LinearScale = (value: number) => number;

/** Escala linear de [d0, d1] para [r0, r1]. Domínio vazio cai no meio da faixa. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]): LinearScale {
  if (d1 === d0) return () => (r0 + r1) / 2;
  return (value) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

/**
 * Domínio do eixo Y: sempre mostra a faixa-alvo inteira e todas as leituras,
 * com folga, arredondado para dezenas.
 */
export function glucoseDomain(values: number[], target: { min?: number; max?: number }): [number, number] {
  const lows = [...values, target.min ?? 70, 70];
  const highs = [...values, target.max ?? 180, 180];
  const low = Math.max(20, Math.floor((Math.min(...lows) - 10) / 10) * 10);
  const high = Math.ceil((Math.max(...highs) + 20) / 10) * 10;
  return [low, high];
}

/**
 * Caminho SVG suave que não ultrapassa os pontos (curva monotônica em X,
 * Fritsch–Carlson): picos e vales não inventam valores que não existem.
 */
export function monotonePath(points: Point[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M${points[0].x},${points[0].y}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    slope.push(dx[i] === 0 ? 0 : (points[i + 1].y - points[i].y) / dx[i]);
  }

  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }

  const round = (v: number) => Math.round(v * 100) / 100;
  let d = `M${round(points[0].x)},${round(points[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const c1x = p0.x + dx[i] / 3;
    const c1y = p0.y + (tangent[i] * dx[i]) / 3;
    const c2x = p1.x - dx[i] / 3;
    const c2y = p1.y - (tangent[i + 1] * dx[i]) / 3;
    d += ` C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(p1.x)},${round(p1.y)}`;
  }
  return d;
}

/** Até `count` índices bem espaçados, sempre com o primeiro e o último (rótulos do eixo X). */
export function pickTickIndexes(length: number, count = 4): number[] {
  if (length <= 0) return [];
  if (length <= count) return Array.from({ length }, (_, i) => i);
  const step = (length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(i * step));
}
