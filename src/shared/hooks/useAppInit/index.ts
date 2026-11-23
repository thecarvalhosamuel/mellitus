import { useEffect, useState } from 'react';

import { openDatabase } from '@/database/client';
import { runMigrations } from '@/database/migrations';
import { runSeed } from '@/database/seed';
import { usePatternsStore } from '@/stores/patterns';
import { useReadingsStore } from '@/stores/readings';
import { useSettingsStore } from '@/stores/settings';

type InitState = { ready: boolean; error: Error | null };

/** Abre o banco → migrations → seed → carrega padrão ativo, settings e recentes (DESIGN.md §13.2). */
export async function initializeApp(): Promise<void> {
  const db = await openDatabase();
  await runMigrations(db);
  await runSeed();
  await Promise.all([useSettingsStore.getState().load(), usePatternsStore.getState().load()]);
  await useReadingsStore.getState().load();
}

export function useAppInit(): InitState {
  const [state, setState] = useState<InitState>({ ready: false, error: null });

  useEffect(() => {
    initializeApp()
      .then(() => setState({ ready: true, error: null }))
      .catch((error: unknown) => {
        console.error('[init] falha ao inicializar o app', error);
        setState({ ready: true, error: error instanceof Error ? error : new Error(String(error)) });
      });
  }, []);

  return state;
}
