import { runInTransaction } from '../client';
import { maintenanceRepository } from '../repositories/maintenance';
import { runSeed } from '../seed';

/**
 * "Apagar todos os dados" (DESIGN.md §13.8): limpa tudo e grava de novo os
 * padrões e configurações de fábrica numa transação; depois compacta o arquivo.
 */
export async function wipeDatabase(today: Date = new Date()): Promise<void> {
  await runInTransaction(async () => {
    await maintenanceRepository.deleteAll();
    await runSeed(today);
  });
  // Compactar é melhor esforço: os dados já não existem para o app.
  await maintenanceRepository.compact().catch(() => undefined);
}
