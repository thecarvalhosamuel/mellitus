// Converte a árvore de cores em variáveis CSS e no mapa de classes do Tailwind.
// Ex.: status.inRange.bg → variável `--color-status-in-range-bg`
//      → classe `bg-status-in-range-bg`.
// Módulo puro: usado pelo tailwind.config e pelo ThemeProvider.

type ColorTree = { [key: string]: string | ColorTree };
type TailwindColorTree = { [key: string]: string | TailwindColorTree };

const kebab = (key: string) => key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

const varName = (path: string[]) => `--color-${path.map(kebab).join('-')}`;

/** `{ '--color-card': '#FFFFFF', '--color-status-in-range-bg': '#ECFDF5', … }` */
export function toCssVariables(colors: ColorTree, path: string[] = []): Record<string, string> {
  return Object.entries(colors).reduce<Record<string, string>>((acc, [key, value]) => {
    const next = [...path, key];
    if (typeof value === 'string') acc[varName(next)] = value;
    else Object.assign(acc, toCssVariables(value, next));
    return acc;
  }, {});
}

/** `{ card: 'var(--color-card)', status: { 'in-range': { bg: 'var(…)' } } }` */
export function toTailwindColors(colors: ColorTree, path: string[] = []): TailwindColorTree {
  return Object.entries(colors).reduce<TailwindColorTree>((acc, [key, value]) => {
    const next = [...path, key];
    acc[kebab(key)] =
      typeof value === 'string' ? `var(${varName(next)})` : toTailwindColors(value, next);
    return acc;
  }, {});
}
