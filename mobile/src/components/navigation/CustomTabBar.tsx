/**
 * Ágora — Custom Tab Bar com botão SOS central (Sprint 9)
 * Layout: [Início | Mapa] [SOS] [Alertas | Perfil]
 * O botão SOS nunca é afetado por outros tokens de design.
 */

import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, Text as RNText,
  Alert as RNAlert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Map, Bell, User } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import * as ExpoLocation from 'expo-location';

const TAB_CONFIG: Record<string, { icon: React.FC<any>; label: string }> = {
  index:   { icon: Home, label: 'Início' },
  map:     { icon: Map,  label: 'Mapa' },
  alerts:  { icon: Bell, label: 'Alertas' },
  profile: { icon: User, label: 'Perfil' },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const doSOS = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        RNAlert.alert('GPS necessário', 'Precisamos da sua localização para emitir o SOS.');
        return;
      }
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      const location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      const { data, error } = await supabase.functions.invoke('sos-alert', {
        body: { location, user_id: user?.id },
      });
      if (error) throw error;

      RNAlert.alert(
        '🚨 REDE DE CONFIANÇA ACIONADA',
        `Contatos pessoais notificados: ${data?.contacts_notified ?? 0}\nGuardiões próximos: ${data?.guardians_notified ?? 0}`,
        [{ text: 'ENTENDIDO' }]
      );
    } catch (err: any) {
      RNAlert.alert('Erro Crítico', 'Falha ao emitir SOS. Ligue 190 imediatamente.\n' + err.message);
    }
  };

  const handleSOS = () => {
    RNAlert.alert(
      '🚨 Ativar SOS de Emergência?',
      'Sua localização será enviada à sua rede de confiança e aos Guardiões próximos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'ATIVAR SOS', style: 'destructive', onPress: doSOS },
      ]
    );
  };

  const visibleRoutes = state.routes.filter(r => TAB_CONFIG[r.name]);
  const leftRoutes  = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const renderTab = (route: typeof state.routes[0]) => {
    const routeIndex = state.routes.findIndex(r => r.key === route.key);
    const isFocused = state.index === routeIndex || (state.routes[state.index]?.name === 'partners' && route.name === 'index');
    const cfg = TAB_CONFIG[route.name];
    if (!cfg) return null;
    const IconComp = cfg.icon;
    const iconColor = isFocused ? '#00E676' : '#6B7280'; // Verde brilhante ativo, Cinza azulado inativo

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabItem}
        onPress={() => navigation.navigate(route.name)}
        accessibilityLabel={cfg.label}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
      >
        <IconComp color={iconColor} size={22} strokeWidth={isFocused ? 2.5 : 1.8} />
        <RNText style={[styles.tabLabel, { color: iconColor }]}>{cfg.label}</RNText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {/* Left tabs */}
      <View style={styles.side}>
        {leftRoutes.map((r) => renderTab(r))}
      </View>

      {/* SOS Center Button — sobrepondo a borda superior */}
      <View style={styles.sosWrapper}>
        <View style={styles.glowEffect} />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSOS}
          style={styles.sosTouchable}
          accessibilityLabel="Botão SOS Emergência"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['#FF7B9C', '#FF3B5C', '#D31F41']}
            locations={[0, 0.5, 1]}
            style={styles.sosButton}
          >
            {/* Efeito de brilho mais sutil */}
            <View style={styles.sosTopHighlight} />
            
            <View style={styles.sosTextContainer}>
              <RNText style={styles.sosText}>SOS</RNText>
            </View>
            <RNText style={styles.sosSubText}>EMERGÊNCIA</RNText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Right tabs */}
      <View style={styles.side}>
        {rightRoutes.map((r) => renderTab(r))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000', 
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Sombra suave para destacar a tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 24,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.semiBold,
    letterSpacing: 0.3,
  },

  // SOS — Fixando a posição exata
  sosWrapper: {
    width: 72,
    height: 72,
    position: 'absolute',
    left: '50%',
    marginLeft: -36, // Metade de 72
    bottom: 16, 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF3B5C',
    opacity: 0.5,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  sosTouchable: {
    width: 82, // 72 + padding
    height: 82,
    borderRadius: 41,
    backgroundColor: '#000000', // Mesma cor da tab bar
    padding: 5, // Borda
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sosButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sosTopHighlight: {
    position: 'absolute',
    top: -6,
    width: '80%',
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ scaleX: 1.4 }],
  },
  sosTextContainer: {
    transform: [{ scaleX: 1.8 }], 
    marginTop: -2,
    marginBottom: 0,
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15, 
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.black,
    textShadowColor: 'rgba(255,255,255,0.4)', 
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sosSubText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 6.5,
    letterSpacing: 1.5,
    lineHeight: 8,
    fontFamily: typography.fontFamily.bold,
  },
});
