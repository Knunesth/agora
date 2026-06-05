/**
 * Ágora — Alerta Resolvido (Sprint 9)
 * Tela de feedback após votar que o alerta não está mais ativo.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Users } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

export default function ResolvedAlertScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={{ flex: 1 }} />

        {/* Ícone */}
        <View style={styles.iconContainer}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <View style={styles.iconCore}>
                <Check color={colors.textInverse} size={28} strokeWidth={3} />
              </View>
            </View>
          </View>
        </View>

        {/* Textos */}
        <View style={styles.textContainer}>
          <Text variant="h2" style={styles.title}>Ocorrência resolvida</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Obrigado por manter sua comunidade segura. O alerta foi removido do mapa.
          </Text>
        </View>

        {/* Card de Atualização */}
        <View style={styles.updateCard}>
          <View style={styles.updateRow}>
            <Check color={colors.primary} size={18} />
            <Text variant="bodySmall" color={colors.primary} style={{ flex: 1, marginLeft: spacing.sm }}>
              Mapa atualizado — Outros usuários Ágora foram notificados de que a área voltou ao normal.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users color={colors.textSecondary} size={20} />
            <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
              Vizinhos notificados
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.pointsValue}>+10</Text>
            <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
              Pontos de cidadania
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Botão */}
        <Button
          title="Voltar para alertas"
          variant="primary"
          onPress={() => router.replace('/(tabs)/alerts' as any)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center' },

  iconContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  iconOuter: {
    width: 120, height: 120, borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  iconInner: {
    width: 88, height: 88, borderRadius: borderRadius.full,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  iconCore: {
    width: 56, height: 56, borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  textContainer: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 26, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { textAlign: 'center', lineHeight: 24 },

  updateCard: {
    width: '100%', backgroundColor: '#0D2818',
    borderRadius: borderRadius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.primaryMuted, marginBottom: spacing.lg,
  },
  updateRow: { flexDirection: 'row', alignItems: 'flex-start' },

  statsRow: {
    width: '100%', flexDirection: 'row',
    backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statDivider: { width: 1, backgroundColor: colors.surfaceBorder, marginVertical: spacing.md },
  pointsValue: { color: colors.primary, fontSize: 24, fontWeight: '700' },

  button: { width: '100%', marginBottom: spacing.xl },
});
