import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

type HistoryEmptyStateProps = {
  /** Algum filtro de momento ativo (há leituras, mas não desse tipo). */
  filtered: boolean;
  /** Nenhuma leitura em mês nenhum: oferece trazer as de uma planilha. */
  firstUse: boolean;
  onResetFilter: () => void;
  onImport: () => void;
};

/** Sem registros: limpar filtro, ou, no primeiro uso, importar de uma planilha. */
export function HistoryEmptyState({ filtered, firstUse, onResetFilter, onImport }: HistoryEmptyStateProps) {
  if (filtered) {
    return (
      <EmptyState
        icon="content-paste-off"
        title="Nenhum registro encontrado"
        description="Não há medições correspondentes aos filtros selecionados neste mês."
        action={<Button label="Ver todos os registros" variant="secondary" fullWidth onPress={onResetFilter} />}
      />
    );
  }
  if (firstUse) {
    return (
      <EmptyState
        icon="content-paste-off"
        title="Nenhum registro ainda"
        description="Registre sua primeira glicemia ou traga as medições que você já tem em planilha."
        action={
          <Button label="Importar de uma planilha" icon="file-upload" variant="secondary" fullWidth onPress={onImport} />
        }
      />
    );
  }
  return (
    <EmptyState
      icon="content-paste-off"
      title="Nenhum registro encontrado"
      description="Não há medições neste mês."
    />
  );
}
