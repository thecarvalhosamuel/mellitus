import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

type AppErrorStateProps = {
  title: string;
  description: string;
  /** Detalhe técnico: só aparece em desenvolvimento. */
  error?: Error;
  onRetry?: () => void;
};

/** Falha que impede a tela de abrir: mensagem calma, dados preservados, opção de tentar de novo. */
export function AppErrorState({ title, description, error, onRetry }: AppErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-sm bg-bg px-margin">
      <Text accessibilityRole="header" className="text-center font-bold text-headline-sm text-text-strong">
        {title}
      </Text>
      <Text className="text-center font-regular text-body-md text-text-secondary">{description}</Text>
      {onRetry && (
        <View className="mt-md self-stretch">
          <Button label="Tentar de novo" icon="refresh" variant="secondary" fullWidth onPress={onRetry} />
        </View>
      )}
      {__DEV__ && error && (
        <Text selectable className="mt-md font-regular text-body-sm text-status-danger-fg">
          {error.message}
        </Text>
      )}
    </View>
  );
}
