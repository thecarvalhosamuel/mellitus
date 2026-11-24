import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { eraseAllData } from '@/shared/hooks/useEraseData';
import { useToast } from '@/shared/hooks/useToast';

/** "Apagar todos os dados" com confirmação dupla (DESIGN.md §13.8). */
export function useEraseData() {
  const toast = useToast();
  const [erasing, setErasing] = useState(false);

  const erase = async () => {
    setErasing(true);
    try {
      await eraseAllData();
      router.navigate('/');
      toast.success('O app voltou ao início, como recém-instalado.', 'Dados apagados');
    } catch {
      toast.error('Não foi possível apagar os dados. Nada foi alterado.');
    } finally {
      setErasing(false);
    }
  };

  const confirmTwice = () =>
    Alert.alert(
      'Apagar todos os dados?',
      'Serão apagados as leituras, os padrões que você criou, os anexos, o nome e as configurações deste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Tem certeza?',
              'Não há cópia na nuvem: depois de apagar, não é possível recuperar. Se quiser guardar suas leituras, exporte a planilha pelo Histórico antes.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar tudo', style: 'destructive', onPress: () => void erase() },
              ],
            ),
        },
      ],
    );

  return { erasing, confirm: confirmTwice };
}
