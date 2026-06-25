/**
 * Ágora — Tela de Recuperar Senha
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Info } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail para continuar.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setIsLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada (e spam) para redefinir sua senha.');
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text variant="h2" style={styles.brandName}>Ágora</Text>
        </View>

        {}
        <View style={styles.titleSection}>
          <Text variant="h2" style={styles.title}>Recuperar senha</Text>
          <Text variant="body" color={colors.textSecondary}>
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </Text>
        </View>

        {}
        <View style={styles.form}>
          <Input
            placeholder="gaby@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            iconLeft={<Mail color={colors.textMuted} size={20} />}
          />

          <Button 
            title={isLoading ? 'ENVIANDO...' : 'ENVIAR LINK'} 
            variant="primary" 
            onPress={handleResetPassword} 
            disabled={isLoading}
            style={styles.submitButton}
          />

          {}
          <View style={styles.alertCard}>
            <Info color={colors.textSecondary} size={16} />
            <Text variant="caption" color={colors.textSecondary} style={styles.alertText}>
              Verifique também a caixa de spam. O link expira em 30 minutos.
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {}
        <View style={styles.footer}>
          <Text variant="bodySmall" color={colors.textSecondary}>Lembrou da senha? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
              Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoImage: {
    width: 56,
    height: 56,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  titleSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  submitButton: {
    height: 56,
    marginTop: spacing.sm,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  alertText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
});
