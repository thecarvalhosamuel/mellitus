import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SelectField } from '@/components/ui/selectField';
import { IMPORT_FIELDS, type ImportField } from '@/shared/utils/importSheet';

type ColumnMappingCardProps = {
  valueOf: (field: ImportField) => string;
  options: { value: string; label: string }[];
  onChange: (field: ImportField, value: string) => void;
  missing: ImportField[];
};

/** Qual coluna da planilha alimenta cada campo (detectado automaticamente, ajustável). */
export function ColumnMappingCard({ valueOf, options, onChange, missing }: ColumnMappingCardProps) {
  const missingLabels = IMPORT_FIELDS.filter((f) => missing.includes(f.field)).map((f) => f.label);

  return (
    <Card>
      <View className="gap-xs">
        <Text accessibilityRole="header" className="font-bold text-headline-sm text-text-strong">
          Colunas da planilha
        </Text>
        <Text className="font-regular text-body-sm text-text-secondary">
          Reconhecemos as colunas pelo cabeçalho. Ajuste se algo não estiver certo.
        </Text>
      </View>
      {IMPORT_FIELDS.map(({ field, label, required }) => (
        <SelectField
          key={field}
          label={required ? `${label} *` : label}
          value={valueOf(field)}
          options={options}
          onChange={(value) => onChange(field, value)}
        />
      ))}
      {missingLabels.length > 0 && (
        <Text accessibilityLiveRegion="polite" className="font-semibold text-body-sm text-status-off-target-fg">
          Escolha a coluna de: {missingLabels.join(' e ')}.
        </Text>
      )}
    </Card>
  );
}
