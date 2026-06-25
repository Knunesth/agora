import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Sobre o Ágora</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text variant="display" color={colors.primary}>Ágora</Text>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>Versão 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text variant="body" style={styles.textCentered}>
            O Ágora é uma plataforma de inteligência colaborativa para prevenção de riscos urbanos.
          </Text>
          <Text variant="body" color={colors.textSecondary} style={[styles.textCentered, { marginTop: spacing.md }]}>
            Modelo de negócio: B2B2C — Cidadãos protegendo cidadãos.
          </Text>
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity style={styles.linkRow}>
            <Text variant="body" color={colors.primary}>Termos de Uso</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
            <Text variant="body" color={colors.primary}>Política de Privacidade</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.creditsContainer}>
          <Text variant="caption" color={colors.textMuted}>
            Desenvolvido por Kauã — Senac 2026
          </Text>
        </View>
      </View>
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
  content: { flex: 1, padding: spacing.lg },
  logoContainer: { alignItems: 'center', marginVertical: spacing.xxl },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.surfaceBorder },
  textCentered: { textAlign: 'center' },
  linksContainer: { backgroundColor: '#1A1A1A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.surfaceBorder },
  linkRow: { padding: spacing.lg, alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.surfaceBorder },
  creditsContainer: { alignItems: 'center', marginBottom: spacing.xl },
});
