import { forwardRef, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ShieldAlert, Info, ArrowRight, Car, UserCircle, AlertTriangle } from 'lucide-react-native';
import Svg, { Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { Alert } from '@/types';
import { useLocation } from '@/hooks/useLocation';

export type RiskLevel = 'low' | 'medium' | 'high';

interface RiskDetailsSheetProps {
  alerts: Alert[];
  onClose: () => void;
}

export const getRiskLevel = (alerts: Alert[]): RiskLevel => {
  const critical = alerts.filter(a => 
    a.category === 'furto' && a.status === 'verified'
  ).length;
  const total = alerts.length;
  
  if (critical >= 3 || total >= 10) return 'high';
  if (critical >= 1 || total >= 5) return 'medium';
  return 'low';
};

const CATEGORY_INFO: Record<string, { icon: any, label: string }> = {
  furto: { icon: Car, label: 'Crimes em progresso' },
  suspeito: { icon: UserCircle, label: 'Atividades suspeitas' },
  iluminacao: { icon: AlertTriangle, label: 'Iluminação precária' },
  infraestrutura: { icon: AlertTriangle, label: 'Infraestrutura' },
  assedio: { icon: UserCircle, label: 'Assédio' },
  outro: { icon: Info, label: 'Outros' }
};

export const RiskDetailsSheet = forwardRef<BottomSheet, RiskDetailsSheetProps>(
  ({ alerts, onClose }, ref) => {
    const router = useRouter();
    const { location } = useLocation();
    const [district, setDistrict] = useState('sua região');
    const snapPoints = useMemo(() => ['70%', '90%'], []);

    useEffect(() => {
      if (location) {
        Location.reverseGeocodeAsync(location).then(([r]) => {
          if (r?.district) setDistrict(r.district);
          else if (r?.city) setDistrict(r.city);
        }).catch(() => {});
      }
    }, [location]);

    const level = getRiskLevel(alerts);
    const riskLabel = level === 'high' ? 'ALTO RISCO' : level === 'medium' ? 'MÉDIO RISCO' : 'BAIXO RISCO';
    const riskColor = level === 'high' ? '#FF1744' : level === 'medium' ? '#FFD600' : '#00E676';
    
    const tipText = level === 'high' 
      ? 'Área com atividade elevada. Evite deslocamentos desnecessários e use o SOS se precisar de ajuda.'
      : level === 'medium'
      ? 'Fique atento ao seu entorno. Evite locais isolados e mantenha contatos de confiança atualizados.'
      : 'Sua região está tranquila no momento. Continue reportando para manter o mapa atualizado.';

    const counts = useMemo(() => {
      const c: Record<string, number> = { furto: 0, suspeito: 0, iluminacao: 0, infraestrutura: 0, assedio: 0, outro: 0 };
      alerts.forEach(a => {
        if (c[a.category] !== undefined) c[a.category]++;
        else c.outro++;
      });
      return c;
    }, [alerts]);

    // Simple histogram for last 6 hours
    const chartData = useMemo(() => {
      const now = new Date();
      const bins = [0,0,0,0,0,0]; // from -5h to 0h
      alerts.forEach(a => {
        const d = new Date(a.createdAt);
        const diffHrs = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
        if (diffHrs >= 0 && diffHrs < 6) {
          bins[5 - diffHrs]++;
        }
      });
      return bins;
    }, [alerts]);

    const maxBar = Math.max(...chartData, 1); // avoid /0
    
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.surfaceBorder }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
      >
        <BottomSheetScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldAlert color={riskColor} size={24} style={{ marginRight: 8 }} />
              <Text variant="h3">Nível de Risco — {district}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <View style={[styles.dot, { backgroundColor: riskColor }]} />
              <Text style={{ color: riskColor, fontWeight: 'bold' }}>{riskLabel}</Text>
            </View>
          </View>

          {/* Section 1 - Summary */}
          <View style={styles.section}>
            <Text style={styles.infoText}>📍 Raio monitorado: 5km ao redor da sua localização</Text>
            <Text style={styles.infoText}>🔴 Total de alertas ativos: {alerts.length}</Text>
            <Text style={styles.infoText}>⏳ Última atualização: agora</Text>
          </View>

          {/* Section 2 - Breakdown */}
          <View style={styles.section}>
            {Object.keys(counts).map(cat => {
              if (cat === 'outro' && counts[cat] === 0) return null;
              const info = CATEGORY_INFO[cat];
              const IconComp = info?.icon || Info;
              return (
                <View key={cat} style={styles.row}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconComp size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                    <Text>{info?.label || 'Outros'}</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: counts[cat] > 0 ? colors.textPrimary : colors.textMuted }}>
                    {counts[cat]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Section 3 - Histogram */}
          <View style={styles.section}>
            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: 16 }}>Histórico (últimas 6h)</Text>
            <Svg height="80" width="100%">
              {chartData.map((val, i) => {
                const w = 30;
                const spacing = 15;
                const totalW = chartData.length * w + (chartData.length - 1) * spacing;
                const startX = 0; // Or center it
                const x = startX + i * (w + spacing);
                const h = (val / maxBar) * 80 || 5; // min 5px height
                const y = 80 - h;
                return (
                  <Rect key={i} x={x} y={y} width={w} height={h} rx={4} fill={colors.primaryMuted} />
                );
              })}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: (6 * 30 + 5 * 15), marginTop: 8 }}>
              {chartData.map((_, i) => (
                <Text key={i} variant="caption" color={colors.textMuted} style={{ width: 30, textAlign: 'center' }}>
                  -{5-i}h
                </Text>
              ))}
            </View>
          </View>

          {/* Section 4 - Tips */}
          <View style={[styles.tipBox, { borderColor: riskColor }]}>
            <Text style={{ color: riskColor }}>{tipText}</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              router.push('/(tabs)/alerts');
            }}
          >
            <Text style={styles.actionBtnText}>Ver todos os alertas</Text>
            <ArrowRight color="#000" size={18} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  section: { 
    marginBottom: spacing.xl,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  infoText: { marginBottom: spacing.sm, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tipBox: { 
    padding: spacing.md, 
    borderRadius: borderRadius.md, 
    borderWidth: 1, 
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: spacing.xl
  },
  actionBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16
  }
});
