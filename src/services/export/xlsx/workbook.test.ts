import { read, utils } from 'xlsx';

import { buildWorkbookBytes } from './workbook';

describe('buildWorkbookBytes', () => {
  const rows = [
    ['Data', 'Glicemia (mg/dL)', 'Nota'],
    ['24/10/2024', 104, null],
    ['25/10/2024', 188, 'Café'],
  ];
  const book = read(buildWorkbookBytes(rows, 'Leituras: Out/2024', [12, 16, 40]), { type: 'array' });

  it('gera um .xlsx que reabre com os mesmos dados', () => {
    const sheet = book.Sheets[book.SheetNames[0]];
    expect(utils.sheet_to_json(sheet, { header: 1, defval: null })).toEqual(rows);
  });

  it('mantém glicemia como número', () => {
    const sheet = book.Sheets[book.SheetNames[0]];
    expect(sheet.B2.t).toBe('n');
  });

  it('limpa o nome da aba', () => {
    expect(book.SheetNames).toEqual(['Leituras  Out 2024']);
  });
});
