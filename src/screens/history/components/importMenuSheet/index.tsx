import { Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';
import type { TemplateFormat } from '@/shared/utils/importTemplate';

import { SheetOption } from '../sheetOption';

type ImportMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPickFile: () => void;
  onDownloadTemplate: (format: TemplateFormat) => void;
};

/** Importar: escolher a planilha ou baixar o modelo para preencher. */
export function ImportMenuSheet({ visible, onClose, onPickFile, onDownloadTemplate }: ImportMenuSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Importar">
      <Text className="font-regular text-body-sm text-text-secondary">
        Traga medições que você já tem em planilha. Antes de gravar, você confere tudo numa pré-visualização.
      </Text>
      <View className="gap-sm">
        <SheetOption
          icon="upload-file"
          title="Escolher planilha"
          description="Arquivo .xlsx, .xls ou .csv"
          onPress={onPickFile}
        />
        <SheetOption
          icon="download"
          title="Baixar modelo em Excel (.xlsx)"
          description="Com as colunas certas e uma aba de instruções"
          onPress={() => onDownloadTemplate('xlsx')}
        />
        <SheetOption
          icon="download"
          title="Baixar modelo em CSV"
          description="Só o cabeçalho, para qualquer editor de planilhas"
          onPress={() => onDownloadTemplate('csv')}
        />
      </View>
    </BottomSheet>
  );
}
