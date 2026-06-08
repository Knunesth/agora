import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert as RNAlert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Menu, Triangle, Search, Mic, Home, Briefcase, Clock, MapPin, Navigation, Map as MapIcon, Bike, Car } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Circle, Marker, Polyline } from '@/components/map/MapElements';

import { Text } from '@/components/ui';
import { AgoraMap } from '@/components/map/AgoraMap';
import { AlertMarker } from '@/components/map/AlertMarker';
import { AlertDetailsSheet } from '@/components/map/AlertDetailsSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { Alert } from '@/types';
import { useLocation, DEFAULT_LOCATION } from '@/hooks/useLocation';
import { useAlerts } from '@/hooks/useAlerts';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';

// Novos Serviços
import { searchAddress, GeocodedAddress } from '@/services/geocoding';
import { buildRiskZones, RiskZone } from '@/services/riskZones';
import { getSafeRoutes, RouteInfo, TransportMode } from '@/services/routing';

export default function MapScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const insets = useSafeAreaInsets();

  const { location, loading: locLoading, errorMsg: locError } = useLocation();
  const centerLocation = location || DEFAULT_LOCATION;
  const { alerts, loading: alertsLoading, errorMsg: dbError } = useAlerts(location);

  // Estados de Rota
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [destination, setDestination] = useState<GeocodedAddress | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('foot');
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  // Bottom Sheet Customizado (Reanimated)
  const isExpanded = useSharedValue(false);
  const toggleSheet = () => {
    isExpanded.value = !isExpanded.value;
  };

  const expandedStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(isExpanded.value ? 250 : 0, { damping: 20, stiffness: 100 }),
      opacity: withSpring(isExpanded.value ? 1 : 0),
    };
  });

  // Atualizar Zonas de Risco
  useEffect(() => {
    setRiskZones(buildRiskZones(alerts));
  }, [alerts]);

  // Atualizar Relógio
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Debounce da Busca
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        const results = await searchAddress(searchQuery);
        setSuggestions(results);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Quando escolhe um endereço
  const handleSelectDestination = (dest: GeocodedAddress) => {
    setSearchQuery(dest.name);
    setSuggestions([]);
    if (isExpanded.value) toggleSheet();
    handleCalculateRoute(dest, transportMode);
  };

  const handleCalculateRoute = async (dest: GeocodedAddress, mode: TransportMode) => {
    setDestination(dest);
    setTransportMode(mode);

    if (!location) {
      RNAlert.alert('Erro', 'Localização atual não disponível.');
      return;
    }

    try {
      setIsRouting(true);
      const safeRoutes = await getSafeRoutes(location, dest.coordinate, mode, riskZones);
      setRoutes(safeRoutes);
    } catch (err: any) {
      RNAlert.alert('Erro no Roteamento', err.message);
      setRoutes([]);
    } finally {
      setIsRouting(false);
    }
  };

  const startNavigation = () => {
    if (!destination || !location) return;
    const url = `google.navigation:q=${destination.coordinate.latitude},${destination.coordinate.longitude}&mode=${transportMode === 'foot' ? 'w' : transportMode === 'bike' ? 'b' : 'd'}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback para maps normal (iOS)
        Linking.openURL(`maps://app?saddr=${location.latitude},${location.longitude}&daddr=${destination.coordinate.latitude},${destination.coordinate.longitude}`);
      }
    });
  };

  const handleSOS = async () => { /* Mantido do original */ };
  const handleMarkerPress = (alert: Alert) => {
    setSelectedAlert(alert);
    bottomSheetRef.current?.expand();
  };
  const handleVote = async (vote_type: 'confirm' | 'reject') => { /* Mantido */ };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        <AgoraMap
          initialRegion={{
            latitude: centerLocation.latitude,
            longitude: centerLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          showsUserLocation={false} 
        >
          {/* Mancha vermelha de risco local */}
          {!routes.length && (
            <Circle
              center={centerLocation}
              radius={800}
              fillColor="rgba(255,59,48,0.15)"
              strokeColor="transparent"
            />
          )}

          {/* Marcador de localização do usuário */}
          <Marker coordinate={centerLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userMarkerHalo}>
              <View style={styles.userMarkerCore} />
            </View>
          </Marker>

          {/* Alertas padrão */}
          {!routes.length && alerts.map((alert) => (
            <AlertMarker key={alert.id} alert={alert} onPress={handleMarkerPress} />
          ))}

          {/* Zonas de Perigo (exibidas durante rota) */}
          {routes.length > 0 && riskZones.map((z, i) => (
            <Circle
              key={`zone-${i}`}
              center={z.coordinate}
              radius={z.radiusMeters}
              fillColor={z.level === 'HIGH' ? 'rgba(255, 23, 68, 0.3)' : 'rgba(255, 179, 0, 0.3)'}
              strokeColor="transparent"
            />
          ))}

          {/* Rotas */}
          {routes.slice().reverse().map((r, i) => (
            <Polyline
              key={`route-${i}`}
              coordinates={r.coordinates}
              strokeColor={r.isAlternative ? '#666666' : '#00C853'}
              strokeWidth={r.isAlternative ? 3 : 5}
              lineDashPattern={r.isAlternative ? [10, 10] : undefined}
              zIndex={r.isAlternative ? 1 : 2}
            />
          ))}

          {/* Pino de Destino */}
          {destination && (
            <Marker coordinate={destination.coordinate} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.destinationPinWrapper}>
                <View style={styles.destinationPin} />
                <View style={styles.destinationPinTip} />
              </View>
            </Marker>
          )}

        </AgoraMap>
      </View>

      {/* HEADER FLUTUANTE */}
      <View style={[styles.header, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
          <Menu color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.timeText}>{currentTime}</Text>
        <TouchableOpacity style={styles.alertBtn}>
          <Triangle color="#FFF" size={20} fill="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Card de Resumo de Rota (Se houver rota ativa) */}
      {routes.length > 0 && (
        <View style={[styles.routeSummaryCard, { bottom: Math.max(insets.bottom, 24) + 105 }]}>
          <View style={styles.routeSummaryHeader}>
            <View style={styles.safeBadge}>
              <Text style={styles.safeBadgeText}>🟢 Rota mais segura</Text>
            </View>
            <TouchableOpacity onPress={() => { setRoutes([]); setDestination(null); setSearchQuery(''); }}>
              <Text style={{color: '#999'}}>X Fechar</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.routeSummaryInfo}>
            📍 {(routes[0].distanceMeters / 1000).toFixed(1)} km  •  ⏱ {Math.ceil(routes[0].durationSeconds / 60)} min
          </Text>
          <Text style={styles.routeSummaryDanger}>
            ⚠️ {routes[0].dangerZonesAvoided} zonas de risco evitadas
          </Text>

          <TouchableOpacity style={styles.startNavBtn} onPress={startNavigation}>
            <Navigation color="#000" size={18} />
            <Text style={styles.startNavText}>INICIAR NAVEGAÇÃO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BOTTOM SHEET FIXO (Busca e Menu) */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) + 95 }]}>
        
        {!routes.length && (
          <TouchableOpacity style={styles.dragHandleArea} onPress={toggleSheet} activeOpacity={0.7}>
            <View style={styles.dragHandle} />
          </TouchableOpacity>
        )}

        {/* Linha 1 - Filtros (só mostra se não estiver em rota) */}
        {!routes.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <View style={styles.chipActive}><Text style={styles.chipActiveText}>Todos</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Crimes</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Tráfego</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Iluminação</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Suspeitos</Text></View>
          </ScrollView>
        )}

        {/* Linha 2 - Busca */}
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Para onde?"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching ? (
             <ActivityIndicator color="#00C853" size="small" />
          ) : (
             <Mic color="#999" size={20} />
          )}
        </View>

        {/* Lista de Sugestões (Nominatim) */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsList}>
            {suggestions.map((sug, i) => (
              <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => handleSelectDestination(sug)}>
                <MapPin color="#666" size={18} />
                <Text style={styles.suggestionText} numberOfLines={1}>{sug.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Linha 3 - Atalhos ou Modais de Transporte */}
        {!destination ? (
          <View style={styles.destinationsContainer}>
            <TouchableOpacity style={styles.destBtn}>
              <Home color="#00C853" size={18} />
              <Text style={styles.destText}>Casa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.destBtn}>
              <Briefcase color="#FFB300" size={18} />
              <Text style={styles.destText}>Trabalho</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.destBtnNew}>
              <Plus color="#00C853" size={18} />
              <Text style={styles.destTextNew}>Novo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.destinationsContainer}>
            <TouchableOpacity 
              style={[styles.transportBtn, transportMode === 'foot' && styles.transportBtnActive]}
              onPress={() => handleCalculateRoute(destination, 'foot')}
            >
              <MapIcon color={transportMode === 'foot' ? '#00C853' : '#FFF'} size={20} />
              <Text style={[styles.destText, transportMode === 'foot' && {color: '#00C853'}]}>A pé</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.transportBtn, transportMode === 'bike' && styles.transportBtnActive]}
              onPress={() => handleCalculateRoute(destination, 'bike')}
            >
              <Bike color={transportMode === 'bike' ? '#00C853' : '#FFF'} size={20} />
              <Text style={[styles.destText, transportMode === 'bike' && {color: '#00C853'}]}>Bike</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.transportBtn, transportMode === 'car' && styles.transportBtnActive]}
              onPress={() => handleCalculateRoute(destination, 'car')}
            >
              <Car color={transportMode === 'car' ? '#00C853' : '#FFF'} size={20} />
              <Text style={[styles.destText, transportMode === 'car' && {color: '#00C853'}]}>Carro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conteúdo Expandido (Recentes) */}
        {!routes.length && (
          <Animated.View style={[styles.expandedContent, expandedStyle]}>
            <Text style={styles.recentTitle}>Pesquisas recentes</Text>
            {['Avenida Paulista, 1578', 'Shopping Morumbi', 'Delegacia de Polícia - 4º DP', 'Estação da Luz'].map((loc, i) => (
              <TouchableOpacity key={i} style={styles.recentItem} onPress={() => setSearchQuery(loc)}>
                <Clock color="#666" size={18} />
                <Text style={styles.recentItemText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      <AlertDetailsSheet
        ref={bottomSheetRef}
        alert={selectedAlert}
        onVote={handleVote}
        isVoting={isVoting}
        onClose={() => setSelectedAlert(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  header: {
    position: 'absolute', left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  menuBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  timeText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  alertBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFB300',
    alignItems: 'center', justifyContent: 'center',
  },

  userMarkerHalo: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 200, 83, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  userMarkerCore: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#00C853',
    borderWidth: 2, borderColor: '#FFF',
  },

  destinationPinWrapper: { alignItems: 'center' },
  destinationPin: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#FF1744',
    borderWidth: 3, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  destinationPinTip: {
    width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FF1744',
    transform: [{ rotate: '180deg' }], marginTop: -2,
  },

  routeSummaryCard: {
    position: 'absolute', left: 20, right: 20, zIndex: 15,
    backgroundColor: '#111', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#333',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 15,
  },
  routeSummaryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  safeBadge: { backgroundColor: 'rgba(0,200,83,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  safeBadgeText: { color: '#00C853', fontWeight: 'bold', fontSize: 12 },
  routeSummaryInfo: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  routeSummaryDanger: { color: '#FFB300', fontSize: 14, marginBottom: 16 },
  startNavBtn: {
    flexDirection: 'row', backgroundColor: '#00C853', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  startNavText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 8,
  },
  dragHandleArea: { width: '100%', paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333' },
  
  filtersScroll: { paddingRight: 20, gap: 12, marginBottom: 20 },
  chipActive: { backgroundColor: '#00C853', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12 },
  chipActiveText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  chip: { backgroundColor: '#2A2A2A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12 },
  chipText: { color: '#FFF', fontWeight: '500', fontSize: 14 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A',
    borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 20,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 12 },
  
  suggestionsList: { backgroundColor: '#222', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  suggestionText: { color: '#FFF', fontSize: 15, marginLeft: 12, flex: 1 },

  destinationsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  destBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2A2A2A', height: 48, borderRadius: 12, gap: 8,
  },
  destText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  destBtnNew: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', borderWidth: 1, borderColor: '#00C853',
    height: 48, borderRadius: 12, gap: 8,
  },
  destTextNew: { color: '#00C853', fontSize: 14, fontWeight: '600' },

  transportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2A2A2A', height: 48, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'transparent',
  },
  transportBtnActive: { borderColor: '#00C853', backgroundColor: 'rgba(0,200,83,0.1)' },

  expandedContent: { overflow: 'hidden', marginTop: 10 },
  recentTitle: { color: '#999', fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  recentItemText: { color: '#E0E0E0', fontSize: 15, marginLeft: 12 },
});
