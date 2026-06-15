/**
 * Ágora — Painel do Administrador (MVP)
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, ShieldCheck, Database, Users, AlertTriangle, Settings, Activity } from 'lucide-react-native';
import { Text, Card, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Administração</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome Banner ─────────────────────────────────────── */}
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.shieldIconContainer}>
              <ShieldCheck color={colors.primary} size={28} />
            </View>
            <View>
              <Text variant="h3" style={styles.welcomeTitle}>Olá, Administrador!</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {user?.email || 'admin@agora.app'}
              </Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>SESSÃO PROTEGIDA</Text>
          </View>
        </Card>

        {/* ── System Stats Placeholders ───────────────────────────── */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
          VISÃO GERAL DO SISTEMA
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Activity color={colors.primary} size={20} style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>99.9%</Text>
            <Text variant="caption" color={colors.textSecondary}>API Status</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle color={colors.warning} size={20} style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>12</Text>
            <Text variant="caption" color={colors.textSecondary}>Alertas Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Users color={colors.info} size={20} style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>148</Text>
            <Text variant="caption" color={colors.textSecondary}>Usuários Online</Text>
          </View>
        </View>

        {/* ── Management Placeholders ────────────────────────────── */}
        <Text variant="overline" color={colors.textMuted} style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
          GERENCIAMENTO (PLACEHOLDERS)
        </Text>

        
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('MVP', 'Módulo de gerenciamento de empresas em desenvolvimento.')}>
            <AlertTriangle color={colors.textSecondary} size={20} />
            <View style={styles.menuTextContainer}>
              <Text variant="body" style={styles.menuLabel}>Gerenciar Empresas Parceiras</Text>
              <Text variant="caption" color={colors.textMuted}>Adicionar empresas parceiras</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuRowBorder} />

          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('MVP', 'Módulo de moderação de alertas em desenvolvimento.')}>
            <AlertTriangle color={colors.textSecondary} size={20} />
            <View style={styles.menuTextContainer}>
              <Text variant="body" style={styles.menuLabel}>Moderar Alertas</Text>
              <Text variant="caption" color={colors.textMuted}>Validar ou rejeitar alertas em análise</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuRowBorder} />

          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('MVP', 'Módulo de gerenciamento de usuários em desenvolvimento.')}>
            <Users color={colors.textSecondary} size={20} />
            <View style={styles.menuTextContainer}>
              <Text variant="body" style={styles.menuLabel}>Controle de Usuários</Text>
              <Text variant="caption" color={colors.textMuted}>Visualizar pontuações de confiança e suspensões</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuRowBorder} />

          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('MVP', 'Módulo de configurações do sistema em desenvolvimento.')}>
            <Settings color={colors.textSecondary} size={20} />
            <View style={styles.menuTextContainer}>
              <Text variant="body" style={styles.menuLabel}>Parâmetros Gerais</Text>
              <Text variant="caption" color={colors.textMuted}>Configurar tempo de quarentena e raios de busca</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuRowBorder} />

          <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert('MVP', 'Módulo de logs de banco de dados em desenvolvimento.')}>
            <Database color={colors.textSecondary} size={20} />
            <View style={styles.menuTextContainer}>
              <Text variant="body" style={styles.menuLabel}>Logs do Sistema</Text>
              <Text variant="caption" color={colors.textMuted}>Visualizar logs de atividades e migrações</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Logout Button ──────────────────────────────────────── */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color={colors.danger} size={18} />
          <Text style={styles.signOutText}>Sair do Painel Admin</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: '#0A0A0A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  welcomeCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  shieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuRowBorder: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: spacing.lg,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.dangerMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger + '40',
    marginBottom: spacing.xl,
  },
  signOutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
