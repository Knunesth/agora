/**
 * Ágora — Tela de Perfil (Sprint 9)
 * Avatar, stats, histórico de alertas e menu de configurações.
 * Regra: a palavra "denúncia" não aparece em nenhuma superfície visível ao usuário.
 */

import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell, Lock, MapPin, Info, ShieldCheck, LogOut, ChevronRight, Users,
} from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { useAlerts } from '@/hooks/useAlerts';
import { supabase } from '@/services/supabase';
import { Settings as SettingsIcon, Pencil } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useLocation();
  const { alerts } = useAlerts(location);
  const [profileName, setProfileName] = React.useState('Cidadão');
  const [isAdminDB, setIsAdminDB] = React.useState(false);

  const loadProfileData = React.useCallback(() => {
    if (user?.id) {
      supabase.from('user_profiles').select('display_name, is_admin').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            if (data.display_name) setProfileName(data.display_name);
            if (data.is_admin) setIsAdminDB(data.is_admin);
          }
        });
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const initials = (profileName || 'Cidadão')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n?.[0] || '')
    .join('')
    .toUpperCase();

  // Contagem de alertas do usuário logado
  const myAlerts = alerts.filter(a => a.userId === user?.id);
  const confirmedAlerts = myAlerts.filter(a => a.status === 'verified');
  const totalConfirmations = myAlerts.reduce((acc, a) => acc + (a.confirmations || 0), 0);

  const handleSignOut = async () => {
    RNAlert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); },
      },
    ]);
  };

  const email = user?.email || '';
  const role = user?.user_metadata?.role;
  const isKaua = email.toLowerCase() === 'kauathierry86@gmail.com';
  const isCesar = email.toLowerCase() === 'cesar57420926@edu.df.senac' || email.toLowerCase() === 'cesar57420926@edu.df.senac.br';
  const isAdmin = isKaua || isCesar || role === 'admin' || isAdminDB;

  const menuItems = [
    { id: 'notifications', icon: Bell, label: 'Notificações', onPress: () => router.push('/settings/notifications') },
    { id: 'privacy', icon: Lock, label: 'Privacidade', onPress: () => router.push('/settings/privacy') },
    { id: 'location', icon: MapPin, label: 'Localização', onPress: () => router.push('/settings/location') },
    { id: 'accessibility', icon: SettingsIcon, label: 'Acessibilidade', onPress: () => router.push('/settings/accessibility') },
    { id: 'about', icon: Info, label: 'Sobre o Ágora', onPress: () => router.push('/settings/about') },
    { id: 'auth', icon: ShieldCheck, label: 'Autenticação', onPress: () => router.push('/settings/auth') },
    { id: 'contacts', icon: Users, label: 'Contatos', onPress: () => router.push('/settings/contacts') },
  ];

  if (isAdmin) {
    menuItems.push({
      id: 'admin',
      icon: ShieldCheck,
      label: 'Painel Administrativo',
      onPress: () => router.push('/settings/admin'),
    });
  }

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    verified:   { label: 'CONFIRMADA', color: colors.primary,  bg: colors.primaryMuted },
    pending:    { label: 'ANALISANDO', color: colors.warning,  bg: colors.warningMuted },
    expired:    { label: 'EXPIRADA',   color: colors.textMuted, bg: colors.surfaceBorder },
    rejected:   { label: 'REJEITADA',  color: colors.danger,   bg: colors.dangerMuted },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text variant="h2" style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings/edit-profile')}>
            <Pencil color={colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>● CIDADÃO ATIVO</Text>
          </View>
          <Text variant="h3" style={styles.name}>{profileName}</Text>
          <Text variant="caption" color={colors.textMuted}>{user?.email}</Text>
        </View>

        {}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myAlerts.length}</Text>
            <Text variant="caption" color={colors.textSecondary}>Alertas feitos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {totalConfirmations}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>Votos Recebidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {confirmedAlerts.length}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>Confirmados</Text>
          </View>
        </View>

        {}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
          HISTÓRICO DE ALERTAS
        </Text>

        {myAlerts.length === 0 && (
          <View style={styles.emptyHistory}>
            <Text variant="caption" color={colors.textMuted}>
              Você ainda não criou nenhum alerta.
            </Text>
          </View>
        )}

        {(myAlerts || []).slice(0, 6).map((alert) => {
          const s = statusMap[alert.status] ?? statusMap.expired;
          const date = new Date(alert.createdAt).toLocaleDateString('pt-BR');

          return (
            <View key={alert.id} style={styles.historyRow}>
              <View style={styles.historyContent}>
                <Text variant="bodySmall" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                </Text>
                <Text variant="caption" color={colors.textMuted}>
                  Sua área · {date} · 👍 {alert.confirmations || 0}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
              </View>
            </View>
          );
        })}

        {}
        <Text variant="overline" color={colors.textMuted} style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
          CONFIGURAÇÕES
        </Text>

        <View style={styles.menuCard}>
          {(menuItems || []).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index < menuItems.length - 1 && styles.menuRowBorder,
              ]}
              onPress={item.onPress}
              accessibilityLabel={item.label}
            >
              <item.icon color={colors.textSecondary} size={20} />
              <Text variant="body" style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight color={colors.textMuted} size={18} />
            </TouchableOpacity>
          ))}
        </View>

        {}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color={colors.danger} size={18} />
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>

        {}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  editBtn: {
    padding: spacing.sm,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
  },
  headerTitle: { flex: 1, color: colors.textPrimary },

  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted, borderWidth: 2, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  initials: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  activeBadge: {
    backgroundColor: colors.primaryMuted, borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm, paddingVertical: 3, marginBottom: spacing.sm,
  },
  activeBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 22, color: colors.textPrimary, marginBottom: 2 },

  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.lg,
  },
  statDivider: { width: 1, backgroundColor: colors.surfaceBorder, marginVertical: spacing.md },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },

  sectionLabel: { marginBottom: spacing.sm },
  emptyHistory: {
    padding: spacing.lg, backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md, alignItems: 'center',
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  historyContent: { flex: 1, marginRight: spacing.sm },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.xs,
  },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  menuCard: {
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder,
  },
  menuLabel: { flex: 1, color: colors.textPrimary },

  signOutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.lg,
    backgroundColor: colors.dangerMuted, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.danger + '40',
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
});
