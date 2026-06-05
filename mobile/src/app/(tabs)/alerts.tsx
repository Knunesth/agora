/**
 * Ágora — Tela de Alertas (Sprint 9)
 * Feed de alertas da região com header verde escuro e chips de risco.
 */

import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, Plus, AlertTriangle, Flame, ChevronRight } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAlerts } from '@/hooks/useAlerts';
import { useLocation } from '@/hooks/useLocation';

const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  furto: AlertTriangle,
  suspeito: AlertTriangle,
  assedio: AlertTriangle,
  iluminacao: AlertTriangle,
  infraestrutura: AlertTriangle,
  outro: AlertTriangle,
};

function getRisk(confirmations: number) {
  if (confirmations >= 5) return { label: 'ALTO', color: colors.danger, bg: colors.dangerMuted };
  if (confirmations >= 2) return { label: 'MÉDIO', color: colors.warning, bg: colors.warningMuted };
  return { label: 'BAIXO', color: colors.primary, bg: colors.primaryMuted };
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const d = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`;
}

export default function AlertsScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const { alerts, loading } = useAlerts(location);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Card Verde Escuro */}
      <View style={styles.headerCard}>
        <View style={styles.headerCardRow}>
          <Shield color={colors.primary} size={28} strokeWidth={1.5} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text variant="h3" style={styles.headerTitle}>Alertas da sua região</Text>
            <Text variant="caption" color={colors.primaryLight} style={{ lineHeight: 18 }}>
              Seja os olhos da sua cidade — seu alerta pode salvar vidas.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Botão Adicionar */}
        <Button
          title="+ Adicionar Novo Alerta"
          variant="primary"
          onPress={() => router.push('/report-modal')}
          style={styles.addButton}
        />

        {/* Estado de loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
              Buscando alertas na sua área...
            </Text>
          </View>
        )}

        {/* Estado vazio */}
        {!loading && alerts.length === 0 && (
          <View style={styles.emptyState}>
            <Shield color={colors.primary} size={40} strokeWidth={1} />
            <Text variant="bodySmall" color={colors.textMuted} style={{ marginTop: spacing.md, textAlign: 'center' }}>
              Nenhum alerta ativo na sua região.{'\n'}A área está segura por enquanto.
            </Text>
          </View>
        )}

        {/* Lista de Alertas */}
        {alerts.map((alert) => {
          const risk = getRisk(alert.confirmations);
          const IconComp = CATEGORY_ICONS[alert.category] ?? AlertTriangle;
          const dist = location
            ? getDistance(location.latitude, location.longitude, alert.coordinate.latitude, alert.coordinate.longitude)
            : null;
          const minutesAgo = Math.round(
            (Date.now() - new Date(alert.createdAt).getTime()) / 60000
          );

          return (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertCard}
              onPress={() => router.push('/alert-details' as any)}
              accessibilityLabel={`Alerta: ${alert.category}`}
            >
              <View style={[styles.alertIconBox, { backgroundColor: risk.bg }]}>
                <IconComp color={risk.color} size={22} />
              </View>

              <View style={styles.alertContent}>
                <View style={styles.alertTopRow}>
                  <Text variant="bodySmall" style={styles.alertCategory}>
                    {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                    <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
                  </View>
                </View>
                <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {alert.description}
                </Text>
                <View style={styles.alertMeta}>
                  <Text variant="caption" color={colors.textMuted}>
                    {dist ?? '—'} · há {minutesAgo}min
                  </Text>
                  <View style={styles.confirmations}>
                    <Flame color={colors.warning} size={13} />
                    <Text style={styles.confirmText}>{alert.confirmations}</Text>
                  </View>
                </View>
              </View>

              <ChevronRight color={colors.textMuted} size={18} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  headerCard: {
    backgroundColor: '#0D2818',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryMuted,
  },
  headerCardRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 18, marginBottom: 2 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  addButton: { marginBottom: spacing.lg, height: 52 },

  loadingContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xxl,
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
  },

  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  alertIconBox: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  alertContent: { flex: 1, gap: spacing.xs },
  alertTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  alertCategory: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  riskBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  riskText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  alertMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmations: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  confirmText: { color: colors.warning, fontSize: 12, fontWeight: '600' },
});
