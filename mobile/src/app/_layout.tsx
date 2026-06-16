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
import { colors } from '@/theme/colors';

// Impedir que a splash feche antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { supabase } from '@/services/supabase';

function RouteGuard() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Só prossegue se a autenticação já carregou e o roteador estiver montado
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      console.log('[RouteGuard] Redirecting to login: no session and not in auth group');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Com sessão -> redirecionar para as abas (admins e usuários comuns)
      console.log('[RouteGuard] Authenticated in auth group. Redirecting to /(tabs)');
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
        console.error('[DeepLink Error]', e);
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
    <AccessibilityProvider>
      <AuthProvider>
        <RouteGuard />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
