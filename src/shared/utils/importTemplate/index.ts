import { READING_CONTEXTS } from '@/shared/constants/readingContexts';
import { IMPORT_HEADERS } from '@/shared/utils/importSheet';
import type { SpreadsheetCell } from '@/shared/utils/spreadsheet';

// Modelo de planilha para o usuário preencher e importar (Histórico → Importar).
// É a fonte única: o app gera o arquivo no aparelho e docs/ guarda uma cópia
// conferida por teste.

export type TemplateSheet = { name: string; rows: SpreadsheetCell[][]; widths: number[] };

export type TemplateFormat = 'xlsx' | 'csv';

export const TEMPLATE_FILE_NAMES: Record<TemplateFormat, string> = {
  xlsx: 'mellitus-modelo-importacao.xlsx',
  csv: 'mellitus-modelo-importacao.csv',
};

const H = IMPORT_HEADERS;

/** Cabeçalho do modelo: nomes curtos em inglês, reconhecidos pelo importador. */
export const TEMPLATE_HEADERS = [H.date, H.time, H.value, H.context, H.insulin, H.correction, H.cycleDay, H.note];

const EXAMPLE_ROWS: SpreadsheetCell[][] = [
  ['24/10/2024', '07:30', 104, 'Jejum', null, null, 'A', null],
  ['24/10/2024', '14:00', 162, '2h pós-refeição', 2, 'Sim', 'A', 'Almoço com arroz e feijão'],
  ['24/10/2024', '22:00', 118, 'Ao deitar', null, null, 'A', null],
  ['25/10/2024', '07:45', 96, 'Jejum', null, null, 'B', null],
];

/**
 * Modelo em CSV: só o cabeçalho (sem exemplos, para nada fictício ser importado).
 * ";" e BOM UTF-8: o Excel em português abre direto e a vírgula decimal não conflita.
 */
export function buildImportTemplateCsv(): string {
  return `﻿${TEMPLATE_HEADERS.join(';')}\r\n`;
}

/** Aba "Leituras" (só o cabeçalho, é a importada) e aba "Instruções" com formatos e exemplo. */
export function buildImportTemplateSheets(): TemplateSheet[] {
  const moments = Object.values(READING_CONTEXTS).map((c) => [c.label]);
  return [
    { name: 'Leituras', rows: [TEMPLATE_HEADERS], widths: [12, 8, 17, 18, 13, 10, 12, 40] },
    {
      name: 'Instruções',
      widths: [18, 12, 46, 28, 13, 10, 12, 30],
      rows: [
        ['Como preencher a planilha de importação do Mellitus'],
        [],
        ['1. Preencha uma leitura por linha na aba "Leituras" (a primeira aba).'],
        ['2. Não renomeie nem apague o cabeçalho. Colunas opcionais podem ficar vazias.'],
        ['3. Salve como .xlsx (ou .csv) e, no app, toque em Histórico → Importar → Escolher planilha.'],
        ['4. Confira a pré-visualização: nada é gravado antes de você tocar em "Importar".'],
        [],
        ['Coluna', 'Obrigatória', 'O que é e formato', 'Exemplo'],
        [H.date, 'Sim', 'Data da medição: dd/mm/aaaa (dia primeiro)', '24/10/2024'],
        [H.time, 'Sim', 'Hora da medição: hh:mm, de 00:00 a 23:59', '07:30'],
        [H.value, 'Sim', 'Glicemia em mg/dL: número de 20 a 600', '104'],
        [H.context, 'Não', 'Momento: um dos valores da lista abaixo (vazio = Outro)', 'Jejum'],
        [H.insulin, 'Não', 'Insulina em UI: número; aceita vírgula decimal', '1,5'],
        [H.correction, 'Não', '"Sim" se a insulina foi de correção', 'Sim'],
        [H.cycleDay, 'Não', 'Dia do ciclo alternado: A ou B', 'A'],
        [H.note, 'Não', 'Nota: texto livre', 'Café com leite'],
        [],
        [`Valores aceitos em "${H.context}"`],
        ...moments,
        [],
        ['Bom saber'],
        ['• Leituras já salvas no aparelho (mesmo dia, hora e valor) são ignoradas, então reimportar não duplica.'],
        ['• Linhas com data no futuro, glicemia vazia ou fora de 20–600 mg/dL aparecem na pré-visualização e não são importadas.'],
        ['• Status (no alvo, acima da meta…) e metas são calculados pelo app com o padrão ativo.'],
        ['• A planilha exportada pelo próprio Mellitus também pode ser importada sem ajustes.'],
        [],
        ['Exemplo de preenchimento (esta aba não é importada)'],
        TEMPLATE_HEADERS,
        ...EXAMPLE_ROWS,
      ],
    },
  ];
}
