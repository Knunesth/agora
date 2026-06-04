/**
 * Ágora — Supabase Client Setup
 * Integra a inicialização com o AsyncStorage para persistência local
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [Supabase] Credenciais não encontradas no .env. ' +
    'O aplicativo não conseguirá buscar dados reais.'
  );
}

// Dummy storage para evitar crash no ambiente Server Side (SSR) do Expo Web (onde window é undefined)
const DummyStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

const appStorage = Platform.OS === 'web' && typeof window === 'undefined' 
  ? DummyStorage 
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: appStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
