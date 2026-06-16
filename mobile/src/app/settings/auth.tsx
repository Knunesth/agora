import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // No futuro isso viria de user_profiles.verified_cpf
  const isCpfVerified = true; 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Autenticação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text variant="overline" color={colors.textMuted} style={styles.label}>EMAIL CADASTRADO</Text>
          <View style={styles.row}>
            <Mail color={colors.textSecondary} size={20} />
            <Text variant="body" style={styles.rowText}>{user?.email || 'email@exemplo.com'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="overline" color={colors.textMuted} style={styles.label}>SEGURANÇA DA CONTA</Text>
          <TouchableOpacity style={styles.actionRow}>
            <Lock color={colors.textSecondary} size={20} />
            <Text variant="body" style={styles.actionText}>Alterar senha</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow}>
            <ShieldCheck color={colors.textSecondary} size={20} />
            <Text variant="body" style={styles.actionText}>Ativar verificação em duas etapas</Text>
            <View style={styles.badgeSoon}><Text variant="caption" color={colors.primary}>Em breve</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text variant="overline" color={colors.textMuted} style={styles.label}>IDENTIDADE</Text>
          <View style={styles.row}>
            {isCpfVerified ? (
              <ShieldCheck color="#00C853" size={20} />
            ) : (
              <AlertTriangle color="#FFD600" size={20} />
            )}
            <Text variant="body" style={styles.rowText} color={isCpfVerified ? '#00C853' : '#FFD600'}>
              {isCpfVerified ? 'CPF verificado ✓' : 'CPF não verificado'}
            </Text>
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
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.surfaceBorder },
  label: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { marginLeft: spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  actionText: { marginLeft: spacing.md, flex: 1 },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginVertical: spacing.md },
  badgeSoon: { backgroundColor: 'rgba(255,23,68,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
