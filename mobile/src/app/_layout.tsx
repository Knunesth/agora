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
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RouteGuard() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Só prossegue se a autenticação já carregou e o roteador estiver montado
    if (isLoading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === 'admin';


    if (!session && !inAuthGroup) {
      console.log('[RouteGuard] Redirecting to login: no session and not in auth group');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Com sessão -> redirecionar para as abas (admins e usuários comuns)
      console.log('[RouteGuard] Authenticated in auth group. Redirecting to /(tabs)');
      router.replace('/(tabs)');
    } else if (session && inAdminGroup) {
      const email = session.user?.email || '';
      const role = session.user?.user_metadata?.role;
      const isKaua = email.toLowerCase() === 'kauathierry86@gmail.com';
      const isCesar = email.toLowerCase() === 'cesar57420926@edu.df.senac' || email.toLowerCase() === 'cesar57420926@edu.df.senac.br';
      const isAdmin = isKaua || isCesar || role === 'admin';
      
      console.log('[RouteGuard] In admin group. Is admin?', isAdmin);
      if (!isAdmin) {
        console.log('[RouteGuard] Unauthorized access to admin. Redirecting to /(tabs)');
        router.replace('/(tabs)');
      }
    }
  }, [session, isLoading, segments, rootNavigationState]);

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
        <Stack.Screen name="admin" />
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
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}
