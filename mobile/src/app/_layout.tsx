/**
 * Ágora — Root Layout
 *
 * Responsável por:
 * 1. Carregar fontes Inter (Google Fonts)
 * 2. Configurar tema dark mode
 * 3. Controlar splash screen
 * 4. Prover o Stack navigator raiz
 */

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { colors } from '@/theme/colors';

// Impedir que a splash feche antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

// Handler global — define como notificações se comportam quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { supabase } from '@/services/supabase';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import NetInfo from '@react-native-community/netinfo';
import { alertQueue } from '@/services/alertQueue';
import { Alert as RNAlert } from 'react-native';

function RouteGuard() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // Processar queue automaticamente
  useEffect(() => {
    let wasOffline = false;

    const unsubscribe = NetInfo.addEventListener(async state => {
      const online = state.isConnected && state.isInternetReachable;

      if (online && wasOffline) {
        // Voltou a ter internet — processa a queue silenciosamente
        const count = await alertQueue.count();
        if (count > 0) {
          const result = await alertQueue.process();
          if (result.sent > 0) {
            // Notifica o usuário que os alertas pendentes foram enviados
            setTimeout(() => {
              RNAlert.alert(
                '✅ Alertas enviados',
                `${result.sent} alerta${result.sent > 1 ? 's' : ''} pendente${result.sent > 1 ? 's' : ''} foram enviados com sucesso.`
              );
            }, 1000);
          }
        }
      }

      wasOffline = !online;
    });

    return unsubscribe;
  }, []);

  // Registra o dispositivo para push notifications após o usuário estar autenticado
  usePushNotifications();

  useEffect(() => {
    // Só prossegue se a autenticação já carregou e o roteador estiver montado
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {

      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Com sessão -> redirecionar para as abas (admins e usuários comuns)

      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, rootNavigationState]);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const path = parsed.path || '';
        
        // Exemplo: agora://convite/ABCDEF
        if (path.startsWith('convite/')) {
          const inviteCode = path.replace('convite/', '');
          await AsyncStorage.setItem('pending_invite', inviteCode);
          
          if (session) {
            // Se já está logado, aceita o convite imediatamente
            await supabase.functions.invoke('accept-invite', {
              body: { invite_code: inviteCode }
            });
            await AsyncStorage.removeItem('pending_invite');
            // Redireciona para contatos para ver a novidade
            router.push('/settings/contacts');
          } else {
            // Se não está logado, manda pra tela de welcome do convite
            router.replace('/(auth)/invite-welcome');
          }
        }
      } catch (e) {

      }
    };

    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, [session]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="report-modal" 
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="sos-modal" 
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="address-modal" 
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AccessibilityProvider>
        <AuthProvider>
          <RouteGuard />
        </AuthProvider>
      </AccessibilityProvider>
    </GestureHandlerRootView>
  );
}
