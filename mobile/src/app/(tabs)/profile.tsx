/**
 * Ágora — Tela de Perfil Simplificada (MVP Sprint 7)
 *
 * Exibe métricas diretas de utilidade sem expor Gamificação (Trust Score é invisível).
 */

import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text, Card, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card variant="elevated" style={statStyles.card}>
      <Text variant="h2" color={color} align="center">
        {value}
      </Text>
      <Text
        variant="overline"
        color={colors.textSecondary}
        align="center"
        style={{ marginTop: spacing.xs }}
      >
        {label}
      </Text>
    </Card>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [totalReported, setTotalReported] = useState<number>(0);
  const [totalVerified, setTotalVerified] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        // 1. Busca total de alertas criados pelo usuário
        const { count: reportedCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Busca total de alertas do usuário que foram confirmados
        const { count: verifiedCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'verified');

        setTotalReported(reportedCount || 0);
        setTotalVerified(verifiedCount || 0);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [user]);

  const handleLogout = async () => {
    RNAlert.alert('Sair', 'Tem certeza que deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar e Identidade */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Shield color={colors.background} size={40} />
          </View>
          <Text variant="h2" style={{ marginTop: spacing.md }}>
            Cidadão
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary}>
            {user?.email}
          </Text>
        </View>

        {/* Estatísticas MVP */}
        <View style={styles.section}>
          <Text variant="h3">Seu Impacto na Rede</Text>
          
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <View style={styles.statsGrid}>
              <StatCard label="ALERTAS EMITIDOS" value={totalReported} color={colors.primary} />
              <StatCard label="VERIFICADOS (ÚTEIS)" value={totalVerified} color={colors.trustHigh || colors.success} />
            </View>
          )}
          
          <Text variant="bodySmall" color={colors.textMuted} align="center" style={{ marginTop: spacing.md }}>
            O seu Trust Score e seu peso na comunidade são calculados silenciosamente em segundo plano para garantir a segurança da rede de Guardiões.
          </Text>
        </View>

        {/* Zona de Perigo / Ações */}
        <View style={[styles.section, { marginTop: spacing.xxl }]}>
          <Button 
            title="Sair da Conta" 
            variant="ghost" 
            onPress={handleLogout}
            icon={<LogOut size={20} color={colors.primary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.lg,
  },
});
