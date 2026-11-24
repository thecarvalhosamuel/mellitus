import { buildWorkbookBytes } from '@/services/export/xlsx/workbook';

import { readSpreadsheet } from './workbook';

describe('readSpreadsheet', () => {
  it('lê CSV com ";" sem converter datas no padrão americano', () => {
    const { matrix } = readSpreadsheet({ kind: 'csv', text: '﻿Data;Hora;Glicemia\n05/01/2024;07:30;104\n' });
    expect(matrix[0]).toEqual(['Data', 'Hora', 'Glicemia']);
    expect(matrix[1]).toEqual(['05/01/2024', '07:30', '104']);
  });

  it('lê a planilha exportada pelo próprio app', () => {
    const rows = [
      ['Data', 'Glicemia (mg/dL)'],
      ['24/10/2024', 104],
    ];
    const { matrix, firstRowNumber } = readSpreadsheet({ kind: 'binary', bytes: buildWorkbookBytes(rows, 'Leituras') });
    expect(matrix).toEqual(rows);
    expect(firstRowNumber).toBe(1);
  });
});
