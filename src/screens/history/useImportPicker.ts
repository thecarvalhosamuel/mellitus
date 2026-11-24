import { router } from 'expo-router';
import { useState } from 'react';

import { ImportFileError, pickSpreadsheet } from '@/services/import';
import { useToast } from '@/shared/hooks/useToast';
import { toImportTable } from '@/shared/utils/importSheet';
import { useImportStore } from '@/stores/import';

/** Escolhe a planilha e abre a pré-visualização (nada é gravado ainda). */
export function useImportPicker() {
  const toast = useToast();
  const [picking, setPicking] = useState(false);

  const pick = async () => {
    setPicking(true);
    try {
      const picked = await pickSpreadsheet();
      if (!picked) return;
      const table = toImportTable(picked.matrix, picked.firstRowNumber);
      if (table.rows.length === 0) {
        toast.error('Não encontramos linhas com dados nesta planilha.');
        return;
      }
      useImportStore.getState().setPending({ fileName: picked.fileName, table });
      router.push('/history/import');
    } catch (error) {
      toast.error(error instanceof ImportFileError ? error.message : 'Não foi possível abrir o arquivo. Tente de novo.');
    } finally {
      setPicking(false);
    }
  };

  return { picking, pick };
}
