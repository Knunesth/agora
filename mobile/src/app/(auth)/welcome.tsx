/**
 * Ágora — Tela de Boas-Vindas (Sprint 9 — Corrigida)
 * Usa apenas RNText nativo para evitar crash no Fabric renderer.
 * SafeAreaView vem de react-native-safe-area-context (não de react-native).
 */

import React from 'react';
import { View, StyleSheet, Image, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>

        {}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <RNText style={styles.brandName}>Ágora</RNText>
          <RNText style={styles.slogan}>Sua segurança em primeiro lugar.</RNText>
        </View>

        {}
        <View style={styles.textContainer}>
          <RNText style={styles.descText}>
            {'Cidadãos protegendo cidadãos.\nReceba alertas em tempo real e ajude\na tornar sua região mais segura.'}
          </RNText>
        </View>

        {}
        <View style={styles.actionContainer}>
          <Button
            title="ENTRAR  →"
            variant="primary"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          />
          <Button
            title="Criar conta"
            variant="secondary"
            size="lg"
            onPress={() => router.push('/(auth)/register')}
            style={styles.button}
          />
        </View>

        {}
        <RNText style={styles.terms}>
          {'Ao continuar, você aceita nossos Termos e Política de Privacidade.'}
        </RNText>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
  },

  logoContainer: { alignItems: 'center', marginTop: spacing.xl },
  logoImage: { width: 88, height: 88, marginBottom: spacing.md },
  brandName: {
    fontSize: 40, fontWeight: '700', color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1, marginBottom: spacing.xs,
  },
  slogan: {
    fontSize: 14, color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular, textAlign: 'center',
  },

  textContainer: { alignItems: 'center' },
  descText: {
    fontSize: 15, color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center', lineHeight: 24,
  },

  actionContainer: { gap: spacing.md },
  button: { width: '100%' },

  terms: {
    fontSize: 11, color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center', lineHeight: 16,
  },
});
