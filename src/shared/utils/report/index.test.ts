import { DEFAULT_PATTERNS } from '@/shared/constants/defaultPatterns';
import { lightColors } from '@/shared/theme/colors';
import { buildReading } from '@/shared/utils/reading';

import { buildReportHtml, escapeHtml } from '.';

const pattern = {
  ...DEFAULT_PATTERNS[0],
  medicalTeam: { name: 'Drª Helena Campos', crm: 'CRM/SP 148.920', specialty: 'Endocrinologia' },
};
const at = (day: number, h: number) => new Date(2024, 9, day, h, 30).toISOString();
const readings = [
  buildReading('a', { value: 104, context: 'fasting', timestamp: at(24, 7), note: 'Café <com> leite & pão' }, pattern),
  buildReading('b', { value: 188, context: 'post-meal-2h', timestamp: at(22, 20), insulinUnits: 1, isCorrection: true }, pattern),
  buildReading('c', { value: 68, context: 'fasting', timestamp: at(21, 7) }, pattern),
];

const html = buildReportHtml({
  patientName: 'Carlos',
  periodLabel: 'Outubro 2024',
  range: { from: new Date(2024, 9, 1), to: new Date(2024, 10, 1) },
  generatedAt: new Date(2024, 9, 24, 12, 0),
  pattern,
  readings,
  colors: lightColors,
});

describe('escapeHtml', () => {
  it('neutraliza HTML vindo do usuário', () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe('&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;');
  });
});

describe('buildReportHtml', () => {
  it('tem cabeçalho, resumo, padrão, médico, curva e tabela', () => {
    expect(html).toContain('Relatório de Glicemia');
    expect(html).toContain('<strong>Carlos</strong> · Outubro 2024');
    expect(html).toContain('Diabetes Comum');
    expect(html).toContain('Drª Helena Campos · CRM/SP 148.920 · Endocrinologia');
    expect(html).toContain('<svg');
    expect(html.match(/<tr>/g)).toHaveLength(4); // cabeçalho + 3 leituras
  });

  it('mostra as leituras em ordem de data, com status, meta e insulina', () => {
    const order = ['21 de Outubro', '22 de Outubro', '24 de Outubro'].map((d) => html.indexOf(d));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html).toContain('Hipo Leve');
    expect(html).toContain('Acima da Meta');
    expect(html).toContain('Correção +1 UI');
    expect(html).toContain('máx 180');
  });

  it('escapa a nota do usuário', () => {
    expect(html).toContain('Café &lt;com&gt; leite &amp; pão');
    expect(html).not.toContain('<com>');
  });

  it('não vaza números inválidos', () => {
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
  });

  it('período vazio gera um laudo válido sem tabela', () => {
    const empty = buildReportHtml({
      periodLabel: 'Setembro 2024',
      range: { from: new Date(2024, 8, 1), to: new Date(2024, 9, 1) },
      generatedAt: new Date(2024, 9, 24),
      pattern: DEFAULT_PATTERNS[0],
      readings: [],
      colors: lightColors,
    });
    expect(empty).toContain('Sem medições no período.');
    expect(empty).not.toContain('<table>');
    expect(empty).not.toMatch(/NaN|undefined/);
  });
});
