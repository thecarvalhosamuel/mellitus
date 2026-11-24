import { decodeText, parseCsv } from '.';

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0));

describe('decodeText', () => {
  it('UTF-8 com e sem BOM', () => {
    // "após"
    expect(decodeText(bytes(0x61, 0x70, 0xc3, 0xb3, 0x73))).toBe('após');
    expect(decodeText(bytes(0xef, 0xbb, 0xbf, 0x61, 0x70, 0xc3, 0xb3, 0x73))).toBe('após');
  });

  it('cai para Windows-1252 quando não é UTF-8 (CSV do Excel em português)', () => {
    // "Correção;após" em Windows-1252
    expect(decodeText(bytes(...ascii('Corre'), 0xe7, 0xe3, ...ascii('o;ap'), 0xf3, 0x73))).toBe('Correção;após');
    expect(decodeText(bytes(0x80))).toBe('€');
  });
});

describe('parseCsv', () => {
  it('separa por delimitador, aceita CRLF e LF e ignora a quebra final', () => {
    expect(parseCsv('date;time;note\r\n2026-10-14;07:00;\n2026-10-15;08:00;ok\r\n', ';')).toEqual([
      ['date', 'time', 'note'],
      ['2026-10-14', '07:00', null],
      ['2026-10-15', '08:00', 'ok'],
    ]);
  });

  it('respeita aspas, delimitador e quebra de linha dentro delas', () => {
    expect(parseCsv('a,b\n"1,5","diz ""oi""\nnova linha"\n', ',')).toEqual([
      ['a', 'b'],
      ['1,5', 'diz "oi"\nnova linha'],
    ]);
  });

  it('linha vazia no meio vira linha de células vazias (o importador a ignora)', () => {
    expect(parseCsv('a;b\n\n1;2', ';')).toEqual([['a', 'b'], [null], ['1', '2']]);
  });
});
