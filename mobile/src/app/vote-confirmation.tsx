/**
 * Ágora — Confirmação de Voto (Sprint 9)
 * Tela de feedback após confirmar que um alerta ainda está ativo.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

export default function VoteConfirmationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={{ flex: 1 }} />

        {}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Flame color={colors.warning} size={48} />
          </View>
        </View>

        {}
        <View style={styles.textContainer}>
          <Text variant="h2" style={styles.title}>Obrigado por confirmar!</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            O índice de risco da área foi atualizado no mapa em tempo real.
          </Text>
        </View>

        {}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Flame color={colors.warning} size={20} />
            <Text variant="body" style={styles.statLabel}>Confirmações agora</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>+1</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text variant="bodySmall" color={colors.textSecondary}>
              Sua contribuição ajuda a manter a comunidade informada e segura.
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {}
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
  iconCircle: {
    width: 100, height: 100, borderRadius: borderRadius.full,
    backgroundColor: colors.warningMuted,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.warning + '40',
  },

  textContainer: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 26, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { textAlign: 'center', lineHeight: 24 },

  statsCard: {
    width: '100%', backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: spacing.xl,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statLabel: { color: colors.textPrimary, flex: 1 },
  counterBadge: {
    backgroundColor: colors.warningMuted, borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  counterText: { color: colors.warning, fontWeight: '700', fontSize: 14 },
  statDivider: { height: 1, backgroundColor: colors.surfaceBorder, marginVertical: spacing.md },

  button: { width: '100%', marginBottom: spacing.xl },
});
