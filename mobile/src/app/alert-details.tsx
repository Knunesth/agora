/**
 * Ágora — Tela de Detalhes do Alerta (Sprint 9)
 * Exibe o alerta completo com barra de consenso e botões de votação.
 */

import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert, Image, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ChevronLeft, AlertTriangle, MapPin, Clock, Flame } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/services/supabase';

export default function AlertDetailsScreen() {
  const router = useRouter();
  const { id, alert: alertParam } = useLocalSearchParams<{ id?: string, alert?: string }>();
  const { user } = useAuth();
  const { location } = useLocation();
  const { alerts, loading } = useAlerts(location);
  const [isVoting, setIsVoting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Tenta carregar o alerta que foi passado pela navegação para ser instantâneo
  let passedAlert = null;
  if (alertParam) {
    try { passedAlert = JSON.parse(alertParam); } catch (e) {}
  }

  // Busca o alerta pelo id ou usa o passado via param, ou fallback
  const alert = passedAlert || alerts.find(a => a.id === id) || alerts[0];

  if (!alert) {
    if (loading) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text variant="body" color={colors.textMuted} style={{ marginTop: spacing.md }}>Carregando detalhes...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.textMuted}>Alerta não encontrado.</Text>
          <Button title="Voltar" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const isVerified = alert.status === 'verified';
  const isOwnAlert = user?.id === alert.userId;
  const consensusPercent = Math.min(Math.round((alert.confirmations / 3) * 100), 100);
  const minutesAgo = Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 60000);

  // Busca endereço legível
  React.useEffect(() => {
    if (!alert) return;
    Location.reverseGeocodeAsync(alert.coordinate)
      .then(([r]) => {
        if (!r) return;
        const parts = [r.street, r.streetNumber, r.district, r.city].filter(Boolean);
        setAddress(parts.join(', ') || null);
      })
      .catch(() => setAddress(null));
  }, [alert?.id]);

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:  { label: 'Em análise', color: colors.warning },
    verified: { label: 'Verificado', color: colors.primary },
    expired:  { label: 'Expirado',   color: colors.textMuted },
    rejected: { label: 'Rejeitado',  color: colors.danger },
  };
  const status = statusConfig[alert.status] ?? statusConfig.pending;

  const handleVote = async (vote_type: 'confirm' | 'reject') => {
    if (!user) return;
    setIsVoting(true);
    try {
      const { error } = await supabase.from('alert_votes').insert({
        alert_id: alert.id,
        user_id: user.id,
        vote_type,
      });
      if (error?.code === '23505') {
        RNAlert.alert('Atenção', 'Você já votou neste alerta.');
      } else if (error) {
        throw error;
      } else {
        if (vote_type === 'confirm') {
          router.replace('/vote-confirmation' as any);
        } else {
          router.replace('/resolved-alert' as any);
        }
      }
    } catch (err: any) {
      RNAlert.alert('Erro', 'Falha ao registrar voto. Tente novamente.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDeleteAlert = async () => {
    const executeDelete = async () => {
      setIsVoting(true);
      try {
        const { error } = await supabase.from('alerts').delete().eq('id', alert.id);
        if (error) throw error;
        if (Platform.OS !== 'web') {
          RNAlert.alert('Sucesso', 'Alerta apagado com sucesso.');
        } else {
          window.alert('Alerta apagado com sucesso.');
        }
        router.back();
      } catch (err: any) {
        if (Platform.OS !== 'web') {
          RNAlert.alert('Erro', 'Falha ao apagar alerta.');
        } else {
          window.alert('Falha ao apagar alerta.');
        }
      } finally {
        setIsVoting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja apagar este alerta? Esta ação não pode ser desfeita.')) {
        executeDelete();
      }
    } else {
      RNAlert.alert(
        'Cancelar Alerta',
        'Tem certeza que deseja apagar este alerta? Esta ação não pode ser desfeita.',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim, apagar', style: 'destructive', onPress: executeDelete }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {}
          <View style={styles.categoryRow}>
            <View style={styles.categoryIcon}>
              <AlertTriangle color={colors.warning} size={32} />
            </View>
            <View>
              <Text variant="h2" style={styles.categoryTitle}>
                {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
              </Text>
              <Text variant="caption" color={colors.textMuted}>Categoria do alerta</Text>
            </View>
          </View>

          {}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <MapPin color={colors.textMuted} size={16} />
              <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
                {address ?? `${alert.coordinate.latitude.toFixed(4)}, ${alert.coordinate.longitude.toFixed(4)}`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock color={colors.textMuted} size={16} />
              <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
                Há {minutesAgo} minuto{minutesAgo !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Flame color={colors.warning} size={16} />
              <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
                {alert.confirmations} confirmação{alert.confirmations !== 1 ? 'ões' : ''}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.consensusCard}>
            <View style={styles.consensusHeader}>
              <Text variant="bodySmall" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                Progresso do consenso
              </Text>
              <Text variant="caption" color={colors.primary}>{consensusPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${consensusPercent}%` }]} />
            </View>
            <Text variant="caption" color={colors.textMuted}>
              {alert.confirmations} de 3 confirmações necessárias
            </Text>
          </View>

          {}
          <View style={styles.descriptionCard}>
            <Text variant="overline" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
              DESCRIÇÃO
            </Text>
            <Text variant="body" color={colors.textSecondary} style={{ lineHeight: 22 }}>
              {alert.description || 'Sem descrição adicional.'}
            </Text>
            
            {alert.userName && (
              <Text variant="caption" color={colors.primary} style={{ marginTop: spacing.sm, fontWeight: 'bold' }}>
                Relatado por: {alert.userName}
              </Text>
            )}
            
            {}
            {alert.photoUrl && (
              <View style={{ marginTop: spacing.md }}>
                <Text variant="overline" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
                  EVIDÊNCIA FOTOGRÁFICA
                </Text>
                <Image 
                  source={{ uri: alert.photoUrl }} 
                  style={styles.evidenceImage} 
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {}
          {!isVerified && !isOwnAlert && (
            <View style={styles.voteSection}>
              <Text variant="bodySmall" style={styles.voteQuestion}>
                Esta ocorrência ainda está lá?
              </Text>
              <View style={styles.voteButtons}>
                <TouchableOpacity
                  style={[styles.voteButton, styles.voteConfirm]}
                  onPress={() => handleVote('confirm')}
                  disabled={isVoting}
                >
                  <Text style={styles.voteConfirmText}>✓ Sim, ainda está</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voteButton, styles.voteReject]}
                  onPress={() => handleVote('reject')}
                  disabled={isVoting}
                >
                  <Text style={styles.voteRejectText}>✗ Não está mais</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isOwnAlert && (
            <View style={[styles.voteSection, { alignItems: 'center', paddingVertical: spacing.xl }]}>
              {!isVerified && (
                <Text variant="bodySmall" color={colors.primary} style={{ textAlign: 'center', marginBottom: spacing.md }}>
                  Este é o seu reporte. Aguarde os votos da comunidade para alcançar o consenso.
                </Text>
              )}
              <TouchableOpacity
                style={[styles.voteButton, styles.voteReject, { width: '100%', borderColor: colors.danger, borderWidth: 1 }]}
                onPress={handleDeleteAlert}
                disabled={isVoting}
              >
                <Text style={[styles.voteRejectText, { color: colors.danger }]}>Excluir Meu Alerta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg,
  },
  backButton: {
    width: 40, height: 40, borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  categoryRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl,
  },
  categoryIcon: {
    width: 60, height: 60, borderRadius: borderRadius.lg,
    backgroundColor: colors.warningMuted, justifyContent: 'center', alignItems: 'center',
  },
  categoryTitle: { fontSize: 24, color: colors.textPrimary },

  metaGrid: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { flex: 1 },

  consensusCard: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  consensusHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8, backgroundColor: colors.surfaceBorder,
    borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full,
  },

  descriptionCard: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  evidenceImage: {
    width: '100%', height: 200, borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },

  voteSection: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  voteQuestion: {
    color: colors.textPrimary, fontWeight: '600', fontSize: 16,
    textAlign: 'center', marginBottom: spacing.md,
  },
  voteButtons: { flexDirection: 'row', gap: spacing.md },
  voteButton: {
    flex: 1, height: 48, borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  voteConfirm: { backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primary },
  voteReject:  { backgroundColor: colors.surfaceBorder },
  voteConfirmText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  voteRejectText:  { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
