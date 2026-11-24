// Leitura de CSV sem depender do motor JS do aparelho (TextDecoder) nem do SheetJS:
// decodificação e parser próprios, pequenos e testados.

/** Windows-1252 nos bytes 0x80–0x9F; o resto é igual ao Latin-1. */
const CP1252_HIGH = [
  0x20ac, 0x81, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x8d, 0x017d, 0x8f,
  0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x9d, 0x017e, 0x0178,
];

/** UTF-8 estrito; `null` se houver sequência inválida (arquivo em outra codificação). */
function decodeUtf8(bytes: Uint8Array): string | null {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    let cp: number;
    let extra: number;
    if (b < 0x80) {
      cp = b;
      extra = 0;
    } else if (b >= 0xc2 && b <= 0xdf) {
      cp = b & 0x1f;
      extra = 1;
    } else if (b >= 0xe0 && b <= 0xef) {
      cp = b & 0x0f;
      extra = 2;
    } else if (b >= 0xf0 && b <= 0xf4) {
      cp = b & 0x07;
      extra = 3;
    } else {
      return null;
    }
    if (i + extra >= bytes.length && extra > 0) return null;
    for (let k = 1; k <= extra; k++) {
      const next = bytes[i + k];
      if ((next & 0xc0) !== 0x80) return null;
      cp = (cp << 6) | (next & 0x3f);
    }
    if ((extra === 2 && cp < 0x800) || (extra === 3 && (cp < 0x10000 || cp > 0x10ffff))) return null;
    out += String.fromCodePoint(cp);
    i += extra + 1;
  }
  return out;
}

function decodeCp1252(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += String.fromCharCode(b >= 0x80 && b <= 0x9f ? CP1252_HIGH[b - 0x80] : b);
  return out;
}

/**
 * Texto de um CSV: UTF-8 (com ou sem BOM) ou, se não for UTF-8 válido,
 * Windows-1252 — o "CSV (separado por vírgulas)" do Excel em português.
 */
export function decodeText(bytes: Uint8Array): string {
  const text = decodeUtf8(bytes) ?? decodeCp1252(bytes);
  return text.replace(/^﻿/, '');
}

/** CSV em linhas de células (aspas com "" escapado, CRLF ou LF). Célula vazia vira `null`. */
export function parseCsv(text: string, delimiter: string): (string | null)[][] {
  const rows: (string | null)[][] = [];
  let row: (string | null)[] = [];
  let cell = '';
  let quoted = false;
  let wasQuoted = false;

  const endCell = () => {
    row.push(cell === '' && !wasQuoted ? null : cell);
    cell = '';
    wasQuoted = false;
  };
  const endRow = () => {
    endCell();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === '') {
      quoted = true;
      wasQuoted = true;
    } else if (ch === delimiter) {
      endCell();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else {
      cell += ch;
    }
  }
  // Última linha sem quebra no fim (ignora o "\n" final do arquivo).
  if (cell !== '' || wasQuoted || row.length > 0) endRow();
  return rows;
}
