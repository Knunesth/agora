import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldAlert, Users, CheckCircle, Clock } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';

interface AdminStats {
  totalAlerts: number;
  totalUsers: number;
  pendingAlerts: number;
  verifiedToday: number;
}

export default function AdminScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalAlerts: 0, totalUsers: 0, pendingAlerts: 0, verifiedToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { count: totalAlerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true });
      const { count: totalUsers } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: pendingAlerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const { count: verifiedToday } = await supabase.from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified')
        .gte('created_at', today.toISOString());

      setStats({
        totalAlerts: totalAlerts || 0,
        totalUsers: totalUsers || 0,
        pendingAlerts: pendingAlerts || 0,
        verifiedToday: verifiedToday || 0,
      });
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Painel Administrativo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={styles.iconBox}><ShieldAlert color={colors.primary} size={24} /></View>
            <Text variant="h2" style={styles.statValue}>{loading ? '...' : stats.totalAlerts}</Text>
            <Text variant="caption" color={colors.textMuted}>Total de Alertas</Text>
          </View>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(68, 138, 255, 0.1)' }]}><Users color="#448AFF" size={24} /></View>
            <Text variant="h2" style={styles.statValue}>{loading ? '...' : stats.totalUsers}</Text>
            <Text variant="caption" color={colors.textMuted}>Total de Usuários</Text>
          </View>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 214, 0, 0.1)' }]}><Clock color="#FFD600" size={24} /></View>
            <Text variant="h2" style={styles.statValue}>{loading ? '...' : stats.pendingAlerts}</Text>
            <Text variant="caption" color={colors.textMuted}>Alertas Pendentes</Text>
          </View>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}><CheckCircle color="#00C853" size={24} /></View>
            <Text variant="h2" style={styles.statValue}>{loading ? '...' : stats.verifiedToday}</Text>
            <Text variant="caption" color={colors.textMuted}>Verificados Hoje</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary },
  content: { padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '47%', backgroundColor: '#1A1A1A', borderRadius: 16, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,23,68,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  statValue: { marginBottom: 4 },
});
