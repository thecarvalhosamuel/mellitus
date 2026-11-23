import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type CatalogSectionProps = { title: string; children: ReactNode };

export function CatalogSection({ title, children }: CatalogSectionProps) {
  return (
    <View className="gap-sm">
      <Text accessibilityRole="header" className="font-bold text-label-sm uppercase text-text-muted">
        {title}
      </Text>
      {children}
    </View>
  );
}
