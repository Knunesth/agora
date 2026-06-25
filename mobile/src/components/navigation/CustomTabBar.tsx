import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText, Platform, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  withSequence,
  withSpring
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Home, Map, Bell, User } from 'lucide-react-native';
import { useLocation } from '@/hooks/useLocation';

const TAB_CONFIG: Record<string, { icon: React.FC<any>; label: string }> = {
  index:   { icon: Home, label: 'Início' },
  map:     { icon: Map,  label: 'Mapa' },
  alerts:  { icon: Bell, label: 'Alertas' },
  profile: { icon: User, label: 'Perfil' },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location: userLocation } = useLocation();
  
  // Animação de pulso do Glow externo (escala de 1.0 a 1.08 em 2s loop)
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // Loop infinito
      false
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const sosScale = useSharedValue(1);
  const animatedSosButton = useAnimatedStyle(() => ({
    transform: [{ scale: sosScale.value }],
  }));

  const handleSOSActivate = async () => {
    // Apenas navega para o modal de SOS
    router.push('/sos-modal');
  };

  const visibleRoutes = state.routes.filter(r => TAB_CONFIG[r.name]);
  const leftRoutes  = visibleRoutes.slice(0, 2);
  const rightRoutes = visibleRoutes.slice(2);

  const renderTab = (route: typeof state.routes[0]) => {
    const isFocused = state.routes[state.index]?.key === route.key || 
                      (state.routes[state.index]?.name === 'partners' && route.name === 'index');
    const cfg = TAB_CONFIG[route.name];
    if (!cfg) return null;
    
    const IconComp = cfg.icon;
    const color = isFocused ? '#00C853' : '#6B6B6B';

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabItem}
        onPress={() => navigation.navigate(route.name)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          {isFocused && <View style={styles.activeIconGlow} />}
          <IconComp color={color} size={24} strokeWidth={isFocused ? 2.5 : 2} />
        </View>
        <RNText style={[styles.tabLabel, { color }]}>{cfg.label}</RNText>
        {}
        <View style={[styles.activeUnderline, { opacity: isFocused ? 1 : 0 }]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      
      {}
      <View style={styles.pillContainer}>
        
        {}
        <View style={styles.side}>
          {leftRoutes.map(renderTab)}
        </View>

        {}
        <View style={styles.centerSpace} />

        {}
        <View style={styles.side}>
          {rightRoutes.map(renderTab)}
        </View>

      </View>

      {}
      <View style={[styles.sosContainer, { bottom: Math.max(insets.bottom, 16) + 12 }]} pointerEvents="box-none">
        
        {}
        <Animated.View style={[styles.glowWrapper, animatedGlow]} pointerEvents="none">
          <View style={styles.glowOuter} />
          <View style={styles.glowInner} />
        </Animated.View>

        {}
        <Pressable
          onPressIn={() => {
            sosScale.value = withTiming(0.85, { duration: 800 });
          }}
          onPressOut={() => {
            sosScale.value = withSpring(1, { damping: 12, stiffness: 200 });
          }}
          onLongPress={handleSOSActivate}
          delayLongPress={800}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.alert('Segure o botão SOS por 1 segundo para ativar a emergência.');
            } else {
              Alert.alert('Atenção', 'Segure o botão SOS por 1 segundo para ativar a emergência.');
            }
          }}
        >
          <Animated.View style={[styles.sosButtonOuter, animatedSosButton]}>
            <LinearGradient
              colors={['#FF5555', '#990000']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.sosButtonInner}
            >
              {}
              <View style={styles.sosHighlight} />
              
              <View style={styles.sosTextWrapper}>
                <RNText style={styles.sosTextMain}>SOS</RNText>
                <RNText style={styles.sosTextSub}>EMERGÊNCIA</RNText>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  pillContainer: {
    height: 76,
    backgroundColor: '#111111',
    borderRadius: 38, // Border radius generoso (pílula)
    borderWidth: 1,
    borderColor: '#242424',
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
    }),
    elevation: 20,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
  },
  centerSpace: {
    width: 100, // Espaço ajustado
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    flex: 1, // Distribui igualmente no espaço disponível
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 83, 0.15)', // Sutil reflexo verde no fundo do ícone
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeUnderline: {
    marginTop: 6,
    height: 2,
    width: 24,
    backgroundColor: '#00C853',
    borderRadius: 1,
  },

  
  sosContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -42, // (width / 2)
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  
  // Camadas de Glow (simulando box-shadow suave)
  glowWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
  },
  glowOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 23, 68, 0.08)',
  },
  glowInner: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#FF1744',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    }),
    elevation: 8,
  },

  // Ring externo e Corpo físico
  sosButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A0000', // Ring esmeralda/vinho muito escuro (#8B0000 base + sombra)
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
    }),
    elevation: 15,
    // Efeito de gradiente do ring (topo claro, base escura)
    borderTopWidth: 2,
    borderTopColor: '#A00000',
    borderBottomWidth: 3,
    borderBottomColor: '#200000',
  },
  sosButtonInner: {
    width: 72, // Ring com ~4px de espessura de cada lado (80-72=8)
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Sombra interna 3D (simulada por bordas)
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.5)',
  },
  
  // Efeito "físico" de luz 3D translúcida no topo
  sosHighlight: {
    position: 'absolute',
    top: 0,
    left: '10%',
    width: '80%',
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    transform: [{ scaleX: 1.2 }], // Alonga o semicírculo
  },

  // Textos
  sosTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
    ...(Platform.OS !== 'web' && {
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    }),
  },
  sosTextMain: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 0.5,
    userSelect: 'none',
  },
  sosTextSub: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 7,
    letterSpacing: 0.5,
    marginTop: -2,
    textAlign: 'center',
    userSelect: 'none',
  },
});
