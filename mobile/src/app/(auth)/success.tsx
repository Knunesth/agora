/**
 * Ágora — Tela de Sucesso Pós-Cadastro
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/contexts/AuthContext';

export default function SuccessScreen() {
  const router = useRouter();
  const { session } = useAuth();
  
  // Pegando o nome do usuário salvo nos metadados ou exibindo genérico
  const userName = session?.user?.user_metadata?.display_name || 'Cidadão';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ flex: 1 }} />
        
        {}
        <View style={styles.iconContainer}>
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <View style={styles.circleCore}>
                <Check color={colors.textInverse} size={32} strokeWidth={3} />
              </View>
            </View>
          </View>
        </View>

        {}
        <View style={styles.textContainer}>
          <Text variant="h2" style={styles.title}>Tudo pronto, {userName}!</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Login realizado com sucesso. Bem-vindo(a) à comunidade Ágora.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {}
        <Button 
          title="COMEÇAR A USAR  →" 
          variant="primary" 
          size="lg"
          onPress={() => router.replace('/(tabs)')} 
          style={styles.button}
        />
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
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  circleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS !== 'web' && {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 16,
    }),
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 28,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
  },
});
