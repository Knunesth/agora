/**
 * Ágora — Componente de Marker Customizado (Pin do Mapa)
 *
 * Responsável por renderizar o pino no mapa com base nas regras do negócio (schema Alert).
 * Implementa visualmente a Quarentena (RN-01).
 */


import { View, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Alert, RiskCategory } from '@/types';
import { colors } from '@/theme/colors';

// Mapeamento de cores baseado na categoria de risco
const CATEGORY_COLORS: Record<RiskCategory, string> = {
  furto: colors.danger,
  assedio: colors.danger,
  iluminacao: colors.warning,
  suspeito: colors.warning,
  infraestrutura: colors.info,
  outro: colors.textSecondary,
  sos: colors.danger,
};

interface AlertMarkerProps {
  alert: Alert;
  onPress?: (alert: Alert) => void;
}

export function AlertMarker({ alert, onPress }: AlertMarkerProps) {
  const isPending = alert.status === 'pending';
  const categoryColor = CATEGORY_COLORS[alert.category];

  return (
    <Marker
      coordinate={alert.coordinate}
      onPress={() => onPress?.(alert)}
      tracksViewChanges={false} // Performance optimization
    >
      <View style={styles.container}>
        {/* RN-01: Quarentena visual (Halo amarelo para não verificados) */}
        {isPending && (
          <View style={[styles.halo, { borderColor: colors.warning }]} />
        )}
        
        <View style={[styles.pin, { backgroundColor: isPending ? colors.surfaceElevated : categoryColor }]}>
          <View style={[styles.innerDot, { backgroundColor: isPending ? colors.warning : colors.background }]} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    opacity: 0.8,
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background, // Furo visual para destacar o inner dot
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
    }),
    elevation: 4,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
