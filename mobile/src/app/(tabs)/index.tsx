/**
 * Ágora — Tela Início / Dashboard (Sprint 9 — Redesign Final)
 * Reproduz fielmente o layout de referência enviado pelo usuário.
 * Nome do usuário vem dinamicamente do Supabase Auth.
 */

import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Menu, Bell, AlertTriangle, Map, Flag,
  Building2, ChevronRight, Car, UserCircle,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useLocation } from '@/hooks/useLocation';
import { GaugeChart, type RiskLevel } from '@/components/ui/GaugeChart';
import type { Alert } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDistanceLabel(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const d = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return d < 1000 ? `${d} m` : `${(d / 1000).toFixed(1)} km`;
}

function getTimeAgo(isoDate: string) {
  const mins = Math.round((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.round(mins / 60);
  return `há ${hrs} h`;
}

function getRiskConfig(confirmations: number): {
  level: RiskLevel; label: string; color: string; bg: string;
} {
  if (confirmations >= 5) return { level: 'high',   label: 'ALTO',   color: '#FF1744', bg: 'rgba(255,23,68,0.15)' };
  if (confirmations >= 2) return { level: 'medium', label: 'MÉDIO',  color: '#FFD600', bg: 'rgba(255,214,0,0.15)' };
  return                          { level: 'low',   label: 'BAIXO',  color: '#00E676', bg: 'rgba(0,230,118,0.12)' };
}

const CATEGORY_ICON: Record<string, React.FC<any>> = {
  furto:          Car,
  assedio:        UserCircle,
  suspeito:       UserCircle,
  infraestrutura: AlertTriangle,
  iluminacao:     AlertTriangle,
  outro:          AlertTriangle,
};

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    furto: 'Furto de veículo',
    assedio: 'Assédio',
    suspeito: 'Atividade suspeita',
    infraestrutura: 'Infraestrutura',
    iluminacao: 'Iluminação precária',
    outro: 'Ocorrência',
  };
  return map[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

// ─── Quick Action Cards ────────────────────────────────────────────────────────

interface ActionCard { id: string; icon: React.FC<any>; accent: string; bg: string; title: string; subtitle: string; onPress: () => void; }

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useLocation();
  const { alerts, loading } = useAlerts(location);

  const firstName = (user?.user_metadata?.display_name as string | undefined)
    ?.split(' ')[0] ?? 'Cidadão';

  const activeAlert = alerts.find(a => a.status === 'pending' || a.status === 'verified') ?? null;
  const totalAlerts = alerts.length;
  const overallRisk: RiskLevel = totalAlerts >= 5 ? 'high' : totalAlerts >= 2 ? 'medium' : 'low';
  const riskLabel = overallRisk === 'high' ? 'ALTO RISCO' : overallRisk === 'medium' ? 'MÉDIO RISCO' : 'BAIXO RISCO';
  const riskColor = overallRisk === 'high' ? '#FF1744' : overallRisk === 'medium' ? '#FFD600' : '#00E676';
  const riskBg    = overallRisk === 'high' ? 'rgba(255,23,68,0.18)' : overallRisk === 'medium' ? 'rgba(255,214,0,0.15)' : 'rgba(0,230,118,0.12)';

  const recentAlerts = alerts.slice(0, 3);

  const actions: ActionCard[] = [
    {
      id: 'report', icon: Flag,      accent: '#FF6B6B', bg: '#1A1A1A',
      title: 'Reportar',       subtitle: 'um alerta',
      onPress: () => router.push('/report-modal'),
    },
    {
      id: 'map',    icon: Map,       accent: '#00E676', bg: '#1A1A1A',
      title: 'Ver mapa',       subtitle: 'de risco',
      onPress: () => router.push('/(tabs)/map' as any),
    },
    {
      id: 'live',   icon: Bell,      accent: '#FFD600', bg: '#1A1A1A',
      title: 'Alertas',        subtitle: 'em tempo real',
      onPress: () => router.push('/(tabs)/alerts' as any),
    },
    {
      id: 'safe',   icon: Building2, accent: '#448AFF', bg: '#1A1A1A',
      title: 'Lojas parceiras', subtitle: 'de segurança',
      onPress: () => router.push('/(tabs)/partners' as any),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} accessibilityLabel="Menu">
            <Menu color={colors.textPrimary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellButton} accessibilityLabel="Notificações">
            <Bell color={colors.textPrimary} size={22} />
            {/* Ponto de notificação */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Saudação ───────────────────────────────────────────────────── */}
        <View style={styles.greeting}>
          <RNText style={styles.greetingTitle}>{'Olá, ' + firstName + '! 👋'}</RNText>
          <RNText style={styles.greetingSubtitle}>Sua segurança em primeiro lugar.</RNText>
        </View>

        {/* ── Card Alerta Ativo ───────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : activeAlert ? (
          <TouchableOpacity
            style={styles.activeAlertCard}
            onPress={() => router.push('/alert-details' as any)}
            accessibilityLabel="Ver alerta ativo"
          >
            <View style={styles.activeAlertTop}>
              <View style={styles.activeAlertBadge}>
                <RNText style={styles.activeAlertBadgeText}>ALERTA ATIVO</RNText>
              </View>
              <View style={styles.warningIconBox}>
                <AlertTriangle color="#FFFFFF" size={20} />
              </View>
            </View>
            <RNText style={styles.activeAlertTitle}>
              {categoryLabel(activeAlert.category)}
            </RNText>
            <RNText style={styles.activeAlertLink}>Ver detalhes  {'>'}</RNText>
          </TouchableOpacity>
        ) : null}

        {/* ── Card Nível de Risco (Gauge) ─────────────────────────────────── */}
        <View style={styles.riskCard}>
          <RNText style={styles.riskCardLabel}>Nível de risco na sua região</RNText>
          <View style={styles.gaugeRow}>
            <GaugeChart level={overallRisk} size={180} />
          </View>
          <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
            <RNText style={[styles.riskBadgeText, { color: riskColor }]}>
              {'● ' + riskLabel}
            </RNText>
          </View>
        </View>

        {/* ── Grid de Ações Rápidas ───────────────────────────────────────── */}
        <View style={styles.grid}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.gridCard, { backgroundColor: action.bg }]}
              onPress={action.onPress}
              accessibilityLabel={action.title + ' ' + action.subtitle}
            >
              <action.icon color={action.accent} size={24} strokeWidth={1.8} />
              <View style={styles.gridCardText}>
                <RNText style={styles.gridCardTitle}>{action.title}</RNText>
                <RNText style={styles.gridCardSubtitle}>{action.subtitle}</RNText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Alertas Próximos ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <RNText style={styles.sectionTitle}>Alertas próximos</RNText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/alerts' as any)}>
            <RNText style={styles.sectionLink}>Ver todos</RNText>
          </TouchableOpacity>
        </View>

        {!loading && recentAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <RNText style={styles.emptyText}>Nenhum alerta próximo no momento.</RNText>
          </View>
        )}

        {recentAlerts.map(alert => {
          const cfg = getRiskConfig(alert.confirmations);
          const IconComp = CATEGORY_ICON[alert.category] ?? AlertTriangle;
          const dist = location
            ? getDistanceLabel(location.latitude, location.longitude, alert.coordinate.latitude, alert.coordinate.longitude)
            : null;
          const timeAgo = getTimeAgo(alert.createdAt);

          return (
            <TouchableOpacity
              key={alert.id}
              style={styles.incidentRow}
              onPress={() => router.push('/alert-details' as any)}
              accessibilityLabel={categoryLabel(alert.category)}
            >
              {/* Ícone */}
              <View style={[styles.incidentIconBox, { backgroundColor: cfg.bg }]}>
                <IconComp color={cfg.color} size={20} strokeWidth={1.8} />
              </View>

              {/* Texto */}
              <View style={styles.incidentContent}>
                <RNText style={styles.incidentTitle} numberOfLines={1}>
                  {categoryLabel(alert.category)}
                </RNText>
                <RNText style={styles.incidentMeta}>
                  {dist ? dist + ' · ' : ''}{timeAgo}
                </RNText>
              </View>

              {/* Badge ALTO/MÉDIO/BAIXO */}
              <View style={[styles.incidentBadge, { backgroundColor: cfg.bg }]}>
                <RNText style={[styles.incidentBadgeText, { color: cfg.color }]}>
                  {cfg.label}
                </RNText>
              </View>

              <ChevronRight color={colors.textMuted} size={16} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconButton: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  bellButton: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FF1744',
    borderWidth: 1.5, borderColor: '#1A1A1A',
  },

  // Greeting
  greeting: { marginBottom: spacing.lg },
  greetingTitle: {
    fontSize: 26, fontWeight: '700', color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    marginBottom: 2,
  },
  greetingSubtitle: {
    fontSize: 13, color: '#888888',
    fontFamily: typography.fontFamily.regular,
  },

  // Active Alert Card
  loadingCard: {
    height: 80, backgroundColor: '#1E1E1E', borderRadius: borderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  activeAlertCard: {
    backgroundColor: '#1F0808',
    borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(255,23,68,0.4)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  activeAlertTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  activeAlertBadge: {
    backgroundColor: 'rgba(255,23,68,0.25)', borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  activeAlertBadgeText: {
    color: '#FF3B5C', fontSize: 10, fontWeight: '700',
    letterSpacing: 0.6, fontFamily: typography.fontFamily.bold,
  },
  warningIconBox: {
    width: 40, height: 40, borderRadius: borderRadius.sm,
    backgroundColor: '#FF1744', justifyContent: 'center', alignItems: 'center',
  },
  activeAlertTitle: {
    fontSize: 20, fontWeight: '700', color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
    lineHeight: 26, marginBottom: spacing.sm,
  },
  activeAlertLink: {
    fontSize: 13, color: '#888888', fontFamily: typography.fontFamily.medium,
  },

  // Risk Gauge Card
  riskCard: {
    backgroundColor: '#1A1A1A', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  riskCardLabel: {
    fontSize: 12, color: '#888888',
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.sm,
  },
  gaugeRow: { alignItems: 'center', marginBottom: spacing.sm },
  riskBadge: {
    alignSelf: 'flex-end', borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  riskBadgeText: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
    fontFamily: typography.fontFamily.bold,
  },

  // Quick Actions Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  gridCard: {
    width: '47%', borderRadius: 16,
    padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: '#2A2A2A',
    minHeight: 100,
  },
  gridCardText: { flex: 1, justifyContent: 'flex-end' },
  gridCardTitle: {
    fontSize: 14, fontWeight: '700', color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold, lineHeight: 18,
  },
  gridCardSubtitle: {
    fontSize: 13, color: '#888888',
    fontFamily: typography.fontFamily.regular, lineHeight: 16, marginTop: 1,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '600', color: '#FFFFFF',
    fontFamily: typography.fontFamily.medium,
  },
  sectionLink: {
    fontSize: 13, color: '#00E676',
    fontFamily: typography.fontFamily.medium,
  },

  // Empty State
  emptyState: {
    padding: spacing.xl, alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: borderRadius.md,
  },
  emptyText: { color: '#666', fontSize: 13, fontFamily: typography.fontFamily.regular },

  // Incident Rows
  incidentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  incidentIconBox: {
    width: 40, height: 40, borderRadius: borderRadius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  incidentContent: { flex: 1 },
  incidentTitle: {
    fontSize: 14, fontWeight: '600', color: '#FFFFFF',
    fontFamily: typography.fontFamily.medium,
  },
  incidentMeta: {
    fontSize: 11, color: '#666',
    fontFamily: typography.fontFamily.regular, marginTop: 1,
  },
  incidentBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  incidentBadgeText: {
    fontSize: 10, fontWeight: '700',
    fontFamily: typography.fontFamily.bold, letterSpacing: 0.5,
  },
});
