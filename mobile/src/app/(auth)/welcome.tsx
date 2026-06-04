/**
 * Ágora — Tela de Boas-Vindas
 * Nova tela inicial do fluxo de Autenticação.
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native'; // Mantido para outras telas se necessário
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo Centralizada */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text variant="h1" style={styles.brandName}>Ágora</Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.slogan}>
            Sua segurança em primeiro lugar
          </Text>
        </View>

        {/* Textos da Comunidade */}
        <View style={styles.textContainer}>
          <Text variant="body" color={colors.textSecondary} style={styles.centerText}>
            Cidadãos protegendo cidadãos.
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.centerText}>
            Receba alertas em tempo real e ajude
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.centerText}>
            a tornar sua região mais segura.
          </Text>
        </View>

        {/* Botões de Ação */}
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
            variant="secondary" // Usando secondary que vira outlined ou ghost dependendo do visual
            size="lg"
            onPress={() => router.push('/(auth)/register')} 
            style={styles.buttonGhost}
          />
        </View>
        
        <Text variant="caption" color={colors.textMuted} style={styles.terms}>
          Ao continuar, você aceita nossos Termos e Política de Privacidade.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoImage: {
    width: 88,
    height: 88,
    marginBottom: spacing.md,
  },
  brandName: {
    fontSize: 40,
    letterSpacing: -1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  slogan: {
    fontSize: 14,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  centerText: {
    textAlign: 'center',
    fontSize: 15,
  },
  actionContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
  },
  buttonGhost: {
    width: '100%',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
  },
});
