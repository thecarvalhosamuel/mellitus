import { GLUCOSE_STATUS, TIR_GOAL } from '@/shared/constants/glucose';
import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import type { ThemeColors } from '@/shared/theme/colors';
import type { ClinicalPattern } from '@/shared/types/pattern';
import type { GlucoseReading } from '@/shared/types/reading';
import {
  formatDayMonth,
  formatGlucose,
  formatInsulin,
  formatLongDate,
  formatPercent,
  formatShortDate,
  formatTargetRange,
  formatTime,
  formatVariability,
} from '@/shared/utils/format';
import { getStatusFamily, getTargetForContext } from '@/shared/utils/glucose';
import { groupByDay } from '@/shared/utils/history';
import { computeStats } from '@/shared/utils/stats';

import { buildChartSvg } from './chartSvg';

export type ReportInput = {
  patientName?: string;
  periodLabel: string;
  range: { from: Date; to: Date };
  generatedAt: Date;
  pattern: ClinicalPattern;
  readings: GlucoseReading[];
  /** Cores do tema claro (papel branco). */
  colors: ThemeColors;
};

/** Texto do usuário (notas, nomes) nunca entra cru no HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const dash = (value: string) => (value === '' ? '—' : value);

/**
 * Laudo para levar à consulta (DESIGN.md §13.7): resumo do período, padrão e
 * médico, curva glicêmica e tabela de leituras. Sem hash, assinatura ou protocolo.
 */
export function buildReportHtml(input: ReportInput): string {
  const { colors, pattern } = input;
  const stats = computeStats(input.readings);
  const days = groupByDay(input.readings, 'asc');
  const statusColor = (r: GlucoseReading) => {
    const family = getStatusFamily(r.status);
    return family === 'inRange' ? colors.text : colors.status[family].fg;
  };

  const summary = [
    ['Medições', String(stats.count)],
    ['Média', stats.mean !== null ? `${formatGlucose(stats.mean)} mg/dL` : '—'],
    ['Variabilidade', stats.sd !== null ? `${formatVariability(stats.sd)} mg/dL` : '—'],
    ['Mínima', stats.min ? `${stats.min.value} mg/dL · ${formatShortDate(stats.min.timestamp)}` : '—'],
    ['Máxima', stats.max ? `${stats.max.value} mg/dL · ${formatShortDate(stats.max.timestamp)}` : '—'],
    ['No alvo (TIR)', stats.count ? `${formatPercent(stats.tir.inRange)} (meta &gt; ${formatPercent(TIR_GOAL)})` : '—'],
  ]
    .map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');

  const tir = stats.count
    ? `<div class="tir">
        <div style="flex:${stats.tir.below};background:${colors.status.offTarget.base}"></div>
        <div style="flex:${stats.tir.inRange};background:${colors.status.inRange.base}"></div>
        <div style="flex:${stats.tir.above};background:${colors.status.offTarget.base}"></div>
      </div>
      <p class="muted">Abaixo da meta ${formatPercent(stats.tir.below)} · No alvo ${formatPercent(stats.tir.inRange)} · Acima da meta ${formatPercent(stats.tir.above)}</p>`
    : '';

  const doctor = pattern.medicalTeam
    ? `<p><strong>Médico(a):</strong> ${escapeHtml(pattern.medicalTeam.name)}${pattern.medicalTeam.crm ? ` · ${escapeHtml(pattern.medicalTeam.crm)}` : ''}${pattern.medicalTeam.specialty ? ` · ${escapeHtml(pattern.medicalTeam.specialty)}` : ''}</p>`
    : '';

  const rows = days
    .map((day) =>
      day.readings
        .map(
          (r, i) => `<tr>
            <td>${i === 0 ? formatDayMonth(r.timestamp) : ''}</td>
            <td>${formatTime(r.timestamp)}</td>
            <td>${READING_CONTEXTS[r.context].label}</td>
            <td class="num" style="color:${statusColor(r)}"><strong>${r.value}</strong></td>
            <td>${dash(formatTargetRange(r.target))}</td>
            <td style="color:${statusColor(r)}">${GLUCOSE_STATUS[r.status].label}</td>
            <td>${r.insulinUnits !== undefined ? formatInsulin(r.insulinUnits, r.isCorrection) : '—'}</td>
            <td>${r.note ? escapeHtml(r.note) : ''}</td>
          </tr>`,
        )
        .join(''),
    )
    .join('');

  const chart = stats.count
    ? buildChartSvg(input.readings, getTargetForContext(pattern, 'fasting'), input.range, colors)
    : '<p class="muted">Sem medições no período.</p>';

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  @page { margin: 18mm 14mm; }
  body { font-family: -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif; color: ${colors.text}; font-size: 11px; }
  h1 { color: ${colors.primary}; font-size: 20px; margin: 0; }
  h2 { font-size: 13px; margin: 18px 0 8px; border-bottom: 1px solid ${colors.cardBorder}; padding-bottom: 4px; }
  .muted { color: ${colors.textMuted}; }
  .grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .metric { flex: 1 1 30%; background: ${colors.inset}; border-radius: 6px; padding: 8px; }
  .metric span { display: block; color: ${colors.textSecondary}; font-size: 10px; }
  .metric strong { font-size: 13px; }
  .tir { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px; background: ${colors.track}; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; color: ${colors.textSecondary}; border-bottom: 1px solid ${colors.cardBorder}; padding: 4px; }
  td { padding: 4px; border-bottom: 1px solid ${colors.divider}; vertical-align: top; }
  tr { page-break-inside: avoid; }
  .num { font-variant-numeric: tabular-nums; }
  footer { margin-top: 18px; color: ${colors.textMuted}; font-size: 9px; }
</style></head>
<body>
  <h1>Mellitus · Relatório de Glicemia</h1>
  <p>${input.patientName ? `<strong>${escapeHtml(input.patientName)}</strong> · ` : ''}${escapeHtml(input.periodLabel)}</p>

  <h2>Resumo do período</h2>
  <div class="grid">${summary}</div>
  ${tir}

  <h2>Padrão de acompanhamento</h2>
  <p><strong>${escapeHtml(pattern.name)}</strong></p>
  <p>Jejum/pré-refeição ${dash(formatTargetRange(pattern.fasting))} · ${pattern.postprandial.windowHours}h pós-refeição ${dash(formatTargetRange(pattern.postprandial))} · Ao deitar ${dash(formatTargetRange(pattern.bedtime)) === '—' ? 'igual ao jejum' : formatTargetRange(pattern.bedtime)} · Alertas: hipo &lt; ${pattern.alerts.hypo}, hiper &gt; ${pattern.alerts.hyper} (mg/dL)</p>
  ${doctor}

  <h2>Curva glicêmica</h2>
  ${chart}

  <h2>Leituras</h2>
  ${
    stats.count
      ? `<table><thead><tr><th>Dia</th><th>Hora</th><th>Momento</th><th>mg/dL</th><th>Meta</th><th>Status</th><th>Insulina</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="muted">Sem medições no período.</p>'
  }

  <footer>
    Gerado no aparelho pelo Mellitus em ${formatLongDate(input.generatedAt)}, às ${formatTime(input.generatedAt)}.
    Registros feitos pelo próprio paciente; cada leitura mostra a meta vigente quando foi registrada.
    Este relatório apoia a consulta e não substitui avaliação médica.
  </footer>
</body></html>`;
}
