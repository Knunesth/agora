import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Menu, Triangle, Search, Mic, Home, Briefcase } from 'lucide-react-native';
import { Circle, Marker } from 'react-native-maps';

import { Text } from '@/components/ui';
import { SOSButton } from '@/components/sos';
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

export default function MapScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const { location, loading: locLoading, errorMsg: locError } = useLocation();
  const centerLocation = location || DEFAULT_LOCATION;
  const { alerts, loading: alertsLoading, errorMsg: dbError } = useAlerts(location);

  const handleSOS = async () => {
    if (!location) {
      RNAlert.alert('GPS Indisponível', 'Precisamos da sua localização para emitir o SOS.');
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('sos-alert', {
        body: { location, user_id: user?.id }
      });
      if (error) throw error;
      RNAlert.alert(
        'REDE DE CONFIANÇA ACIONADA',
        `Notificamos:\n- ${data.contacts_notified} contatos pessoais.\n- ${data.guardians_notified} Guardiões próximos a você.\n\nEles estão a caminho.`,
        [{ text: 'ENTENDIDO' }]
      );
    } catch (err: any) {
      RNAlert.alert('Erro Crítico', 'Falha ao emitir SOS. Ligue 190. Detalhe: ' + err.message);
    }
  };

  const handleMarkerPress = (alert: Alert) => {
    setSelectedAlert(alert);
    bottomSheetRef.current?.expand();
  };

  const handleVote = async (vote_type: 'confirm' | 'reject') => {
    if (!selectedAlert || !user) return;
    setIsVoting(true);
    try {
      const { error } = await supabase.from('alert_votes').insert({
        alert_id: selectedAlert.id,
        user_id: user.id,
        vote_type
      });
      if (error) {
        if (error.code === '23505') {
          RNAlert.alert('Atenção', 'Você já votou neste alerta.');
        } else {
          throw error;
        }
      } else {
        RNAlert.alert('Voto Registrado', 'Sua colaboração ajuda a manter a rede segura!');
        bottomSheetRef.current?.close();
      }
    } catch (err: any) {
      RNAlert.alert('Erro', 'Falha ao registrar voto. Tente novamente.');
    } finally {
      setIsVoting(false);
    }
  };

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
          {/* Mancha vermelha de risco */}
          <Circle
            center={centerLocation}
            radius={800}
            fillColor="rgba(255,59,48,0.3)"
            strokeColor="transparent"
          />

          {/* Marcador de localização do usuário */}
          <Marker coordinate={centerLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userMarkerHalo}>
              <View style={styles.userMarkerCore} />
            </View>
          </Marker>

          {alerts.map((alert) => (
            <AlertMarker
              key={alert.id}
              alert={alert}
              onPress={handleMarkerPress}
            />
          ))}
        </AgoraMap>
      </View>

      {/* HEADER FLUTUANTE */}
      <View style={[styles.header, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.menuBtn}>
          <Menu color="#FFF" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.timeText}>{currentTime}</Text>
        
        <TouchableOpacity style={styles.alertBtn}>
          <Triangle color="#FFF" size={20} fill="#FFF" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET FIXO */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) + 60 }]}>
        <View style={styles.dragHandle} />
        
        {/* Linha 1 - Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <View style={styles.chipActive}><Text style={styles.chipActiveText}>Todos</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Crimes</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Tráfego</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Iluminação</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Suspeitos</Text></View>
        </ScrollView>

        {/* Linha 2 - Busca */}
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Para onde?"
            placeholderTextColor="#999"
          />
          <Mic color="#999" size={20} />
        </View>

        {/* Linha 3 - Atalhos */}
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
      </View>

      {/* FABs Originais da tela */}
      <View style={styles.fabContainer}>
        <View style={styles.addAlertWrapper}>
          <SOSButton onActivate={() => router.push('/report-modal')} />
          <View style={styles.addAlertOverlay}>
            <Plus color={colors.background} size={28} />
          </View>
        </View>
        <SOSButton onActivate={handleSOS} />
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
  container: { 
    flex: 1, 
    backgroundColor: '#1A202C' 
  },
  
  // Header
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Map Markers
  userMarkerHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00C853',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Bottom Sheet Fixo
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginBottom: 20,
  },
  filtersScroll: {
    paddingRight: 20,
    gap: 12,
    marginBottom: 20,
  },
  chipActive: {
    backgroundColor: '#00C853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  chipActiveText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  chipText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  destinationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  destBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  destText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  destBtnNew: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00C853',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  destTextNew: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: '600',
  },

  // FAB 
  fabContainer: {
    position: 'absolute',
    top: 120, // Move for test, since bottom sheet is taking bottom
    right: 20,
    zIndex: 20, // Requested by prompt
    alignItems: 'center',
    gap: 16,
  },
  addAlertWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAlertOverlay: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
