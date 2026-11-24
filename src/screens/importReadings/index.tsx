import { ScreenContainer } from '@/components/layout/screenContainer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';

import { ColumnMappingCard } from './components/columnMappingCard';
import { ImportActions } from './components/importActions';
import { ImportHeader } from './components/importHeader';
import { ImportSampleList } from './components/importSampleList';
import { ImportSummaryCard } from './components/importSummaryCard';
import { useImportPreview } from './useImportPreview';

/** Pré-visualização da planilha: mapear colunas, conferir e só então gravar (DESIGN.md §13.7). */
export function ImportReadingsScreen() {
  const preview = useImportPreview();

  if (!preview.hasFile) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="upload-file"
          title="Nenhuma planilha aberta"
          description="Volte ao Histórico e toque em Importar para escolher o arquivo."
          action={<Button label="Voltar para Histórico" variant="secondary" fullWidth onPress={preview.cancel} />}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ImportHeader
        fileName={preview.fileName}
        totalRows={preview.totalRows}
        patternName={preview.patternName}
        onBack={preview.cancel}
      />
      <ColumnMappingCard
        valueOf={preview.columnValue}
        options={preview.columnOptions}
        onChange={preview.setColumn}
        missing={preview.missing}
      />
      {preview.missing.length === 0 && (
        <ImportSummaryCard
          checking={preview.checking}
          toImport={preview.toImportCount}
          duplicates={preview.duplicates}
          issues={preview.issues}
        />
      )}
      <ImportSampleList readings={preview.sample} total={preview.toImportCount} />
      <ImportActions
        count={preview.toImportCount}
        disabled={preview.checking || preview.missing.length > 0}
        importing={preview.importing}
        onConfirm={preview.confirm}
        onCancel={preview.cancel}
      />
    </ScreenContainer>
  );
}
