import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';

export default function InviteRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const processInvite = async () => {
      if (!code) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        await AsyncStorage.setItem('pending_invite', code);
        
        if (session) {
          // Se já está logado, aceita o convite imediatamente
          await supabase.functions.invoke('accept-invite', {
            body: { invite_code: code }
          });
          await AsyncStorage.removeItem('pending_invite');
          router.replace('/(tabs)/contacts');
        } else {
          // Se não está logado, manda pra tela de welcome do convite
          router.replace('/(auth)/invite-welcome');
        }
      } catch (e) {

        router.replace('/(auth)/login');
      }
    };

    processInvite();
  }, [code, session, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00C853" />
    </View>
  );
}
