import { create } from 'zustand';

import type { ImportTable } from '@/shared/utils/importSheet';

export type PendingImport = { fileName: string; table: ImportTable };

type ImportState = {
  /** Planilha escolhida no Histórico, à espera da pré-visualização. Só em memória. */
  pending: PendingImport | null;
  setPending(pending: PendingImport): void;
  clear(): void;
};

export const useImportStore = create<ImportState>()((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  clear: () => set({ pending: null }),
}));
