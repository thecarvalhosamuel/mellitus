import { router } from 'expo-router';
import { useState } from 'react';

import { SharingUnavailableError, shareImportTemplate } from '@/services/export/xlsx';
import { ImportFileError, pickSpreadsheet } from '@/services/import';
import { useToast } from '@/shared/hooks/useToast';
import { toImportTable } from '@/shared/utils/importSheet';
import type { TemplateFormat } from '@/shared/utils/importTemplate';
import { useImportStore } from '@/stores/import';

/** Menu Importar: escolher a planilha (abre a pré-visualização) ou baixar o modelo. */
export function useImportPicker() {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [picking, setPicking] = useState(false);

  const pick = async () => {
    setMenuOpen(false);
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

  const downloadTemplate = async (format: TemplateFormat) => {
    setMenuOpen(false);
    setPicking(true);
    try {
      await shareImportTemplate(format);
    } catch (error) {
      toast.error(
        error instanceof SharingUnavailableError
          ? 'Este aparelho não permite compartilhar arquivos.'
          : 'Não foi possível gerar o modelo. Tente de novo.',
      );
    } finally {
      setPicking(false);
    }
  };

  return {
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    picking,
    pick,
    downloadTemplate,
  };
}
