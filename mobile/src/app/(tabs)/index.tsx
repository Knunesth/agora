/**
 * Ágora — Tela do Mapa (RF-01: Mapa de riscos em tempo real)
 *
 * Sprint 2: Integrado com backend Supabase (PostGIS).
 */

import { useState, useRef } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

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
  const router = useRouter();
  const { user } = useAuth();
  
  // 1. Obtém GPS do usuário
  const { location, loading: locLoading, errorMsg: locError } = useLocation();
  const centerLocation = location || DEFAULT_LOCATION;
  
  // 2. Busca alertas no raio de 5km do GPS (RPC PostGIS)
  const { alerts, loading: alertsLoading, errorMsg: dbError } = useAlerts(location);

  const handleSOS = async () => {
    if (!location) {
      RNAlert.alert('GPS Indisponível', 'Precisamos da sua localização para emitir o SOS.');
      return;
    }

    try {
      // 1. Invoca a Edge Function que burla as regras normais de alertas
      const { data, error } = await supabase.functions.invoke('sos-alert', {
        body: { location, user_id: user?.id }
      });

      if (error) throw error;

      // 2. Feedback tátil e visual da Rede de Confiança
      RNAlert.alert(
        'REDE DE CONFIANÇA ACIONADA', 
        `Notificamos:\n- ${data.contacts_notified} contatos pessoais.\n- ${data.guardians_notified} Guardiões próximos a você.\n\nEles estão a caminho. Link de rastreio da ocorrência:\n${data.tracking_url}`,
        [{ text: 'ENTENDIDO' }]
      );
      
      console.log('[SOS Tracking Expires At]:', data.tracking_expires_at);
      
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
        if (error.code === '23505') { // Código do Postgres para UNIQUE violation
          RNAlert.alert('Atenção', 'Você já votou neste alerta.');
        } else {
          throw error;
        }
      } else {
        RNAlert.alert('Voto Registrado', 'Sua colaboração ajuda a manter a rede segura!');
        // O ideal é chamar um refresh no useAlerts aqui, ou atualizar o state local.
        // Como o webhook cuidará do status, o app pode precisar re-buscar os dados (dependendo do polling/realtime)
        bottomSheetRef.current?.close();
      }
    } catch (err: any) {
      RNAlert.alert('Erro', 'Falha ao registrar voto. Tente novamente.');
    } finally {
      setIsVoting(false);
    }
  };

  const isLoading = locLoading || alertsLoading;
  const hasError = locError || dbError;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Overlap */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Ágora"
        />
        <View style={styles.headerText}>
          <Text variant="h3" color={colors.primary}>Ágora</Text>
          {hasError && (
            <Text variant="overline" color={colors.warning}>
              {locError ? 'GPS INDISPONÍVEL' : 'OFFLINE'}
            </Text>
          )}
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {isLoading && !location ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: spacing.md }}>
              Sincronizando com a rede...
            </Text>
          </View>
        ) : (
          <AgoraMap
            initialRegion={{
              latitude: centerLocation.latitude,
              longitude: centerLocation.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          >
            {alerts.map((alert) => (
              <AlertMarker 
                key={alert.id} 
                alert={alert} 
                onPress={handleMarkerPress} 
              />
            ))}
          </AgoraMap>
        )}
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {/* Adicionar Novo Alerta (RF-03) */}
        <View style={styles.addAlertWrapper}>
          <SOSButton onActivate={() => router.push('/report-modal')} />
          <View style={styles.addAlertOverlay}>
            <Plus color={colors.background} size={28} />
          </View>
        </View>

        {/* Botão de Emergência SOS (RF-04) */}
        <SOSButton onActivate={handleSOS} />
      </View>

      <AlertDetailsSheet 
        ref={bottomSheetRef}
        alert={selectedAlert}
        onVote={handleVote}
        isVoting={isVoting}
        onClose={() => setSelectedAlert(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerText: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: spacing.lg,
    zIndex: 100,
    alignItems: 'center',
    gap: spacing.md,
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
