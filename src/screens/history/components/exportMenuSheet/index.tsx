import { Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottomSheet';

import { SheetOption } from '../sheetOption';

type ExportMenuSheetProps = {
  visible: boolean;
  monthLabel: string;
  onClose: () => void;
  onExportPdf: () => void;
  onExportXlsx: () => void;
};

/** "Formatos oficiais": laudo PDF e planilha XLSX (DESIGN.md §5.2). */
export function ExportMenuSheet({ visible, monthLabel, onClose, onExportPdf, onExportXlsx }: ExportMenuSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Exportar">
      <Text className="font-regular text-body-sm text-text-secondary">
        Registros de {monthLabel}. O arquivo é gerado no aparelho e você escolhe com quem compartilhar.
      </Text>
      <View className="gap-sm">
        <SheetOption
          icon="picture-as-pdf"
          title="PDF Médico (Laudo de Consulta)"
          description="Com curva, médias e TIR"
          onPress={onExportPdf}
        />
        <SheetOption
          icon="table-view"
          title="Planilha XLSX (Excel)"
          description="Tabela compatível com prontuários"
          onPress={onExportXlsx}
        />
      </View>
    </BottomSheet>
  );
}
