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

import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function RouteGuard() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Sem sessão -> forçar welcome
      router.replace('/(auth)/welcome');
    } else if (session && inAuthGroup) {
      // Com sessão -> pular para o mapa
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

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
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}
