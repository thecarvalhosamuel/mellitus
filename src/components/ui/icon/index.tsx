import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

type IconProps = {
  name: IconName;
  /** Cor semântica vinda do tema (`useTheme().colors`), nunca hex direto. */
  color: string;
  size?: number;
  /** Ícones decorativos ficam ocultos para leitores de tela. */
  accessibilityLabel?: string;
};

// Wrapper único de ícones (Material). Trocar a fonte de ícones no futuro
// (ex.: Material Symbols) muda só este arquivo.
export function Icon({ name, color, size = 24, accessibilityLabel }: IconProps) {
  return (
    <MaterialIcons
      name={name}
      color={color}
      size={size}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    />
  );
}
