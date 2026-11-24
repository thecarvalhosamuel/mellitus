import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottomSheet';
import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/shared/utils/cn';

type ExportMenuSheetProps = {
  visible: boolean;
  monthLabel: string;
  onClose: () => void;
  onExportPdf: () => void;
};

type Option = { icon: IconName; title: string; description: string; onPress?: () => void };

/** "Formatos oficiais": laudo PDF e planilha XLSX (DESIGN.md §5.2). */
export function ExportMenuSheet({ visible, monthLabel, onClose, onExportPdf }: ExportMenuSheetProps) {
  const { colors } = useTheme();
  const options: Option[] = [
    { icon: 'picture-as-pdf', title: 'PDF Médico (Laudo de Consulta)', description: 'Com curva, médias e TIR', onPress: onExportPdf },
    // Planilha XLSX entra na etapa 13.
    { icon: 'table-view', title: 'Planilha XLSX (Excel)', description: 'Tabela compatível com prontuários' },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Exportar">
      <Text className="font-regular text-body-sm text-text-secondary">
        Registros de {monthLabel}. O arquivo é gerado no aparelho e você escolhe com quem compartilhar.
      </Text>
      <View className="gap-sm">
        {options.map((option) => {
          const disabled = !option.onPress;
          return (
            <Pressable
              key={option.title}
              onPress={option.onPress}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              accessibilityLabel={`${option.title}. ${option.description}${disabled ? '. Em breve' : ''}`}
              className={cn(
                'min-h-control flex-row items-center gap-sm rounded-cta border border-control-border bg-control p-3 active:bg-control-pressed',
                disabled && 'opacity-60',
              )}>
              <View className="h-10 w-10 items-center justify-center rounded-cta bg-primary-tint">
                <Icon name={option.icon} size={22} color={colors.onPrimaryTint} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-label-lg text-text-strong">{option.title}</Text>
                <Text className="font-regular text-body-sm text-text-muted">{option.description}</Text>
              </View>
              {disabled ? <Badge label="Em breve" /> : <Icon name="chevron-right" size={22} color={colors.textMuted} />}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
