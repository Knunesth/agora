/**
 * Ágora — Hook de Registro de Push Notifications
 *
 * Registra o dispositivo no Expo Push Notification Service e salva
 * o ExpoPushToken na tabela `push_tokens` do Supabase.
 *
 * ⚠️  LIMITAÇÃO IMPORTANTE:
 *     Push notifications REMOTAS não funcionam no Expo Go.
 *     Para testar, use um build de desenvolvimento:
 *       npx expo run:android
 *       npx expo run:ios
 *     Ou um build de produção via EAS Build.
 *
 * ⚠️  EAS Project ID:
 *     O `extra.eas.projectId` em app.config.js deve conter o ID real do seu
 *     projeto no Expo Application Services (EAS).
 *     Encontre em: https://expo.dev/accounts/[usuário]/projects/agora
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase';


async function registerForPushNotifications(): Promise<void> {
  // Push não é suportado no ambiente web — expo-notifications lança exceção
  if (Platform.OS === 'web') return;

  // Push remoto só funciona em dispositivo físico (não emulador, não Expo Go)
  if (!Device.isDevice) {
    console.log('[PushNotifications] Ignorado: não é dispositivo físico.');
    return;
  }

  // 1. Solicitar permissão
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[PushNotifications] Permissão negada pelo usuário.');
    return;
  }

  // 2. Criar canais Android (obrigatório no Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sos', {
      name: 'SOS Emergência',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // SOS ignora Não Perturbe
    });

    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alertas próximos',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  // 3. Obter token Expo Push
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('[PushNotifications] extra.eas.projectId não configurado em app.config.js.');
    return;
  }

  let token: string;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenData.data;
  } catch (err) {
    console.error('[PushNotifications] Erro ao obter token:', err);
    return;
  }

  // 4. Identificar usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[PushNotifications] Usuário não autenticado — token não salvo.');
    return;
  }

  // 5. Salvar token no Supabase (upsert — evita duplicatas por dispositivo)
  const platform: 'ios' | 'android' | 'web' =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: user.id, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    );

  if (error) {
    console.error('[PushNotifications] Erro ao salvar token:', error.message);
  } else {
    console.log(`[PushNotifications] Token registrado (${platform}) ✓`);
  }
}


export function usePushNotifications(): void {
  useEffect(() => {
    registerForPushNotifications();
  }, []);
}
