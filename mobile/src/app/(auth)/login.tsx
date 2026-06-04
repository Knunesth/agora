/**
 * Ágora — Tela de Login Renovada (Sprint 8)
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, Mail, Lock, Eye, EyeOff, CheckSquare } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Erro no Login', error.message);
    }
    // RouteGuard toma conta do sucesso.
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header (Back + Logo) */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <View style={styles.logoCenter}>
            <Image
              source={require('@/assets/images/logo-transparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text variant="h2" style={styles.brandName}>Ágora</Text>
          </View>
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        {/* Titles */}
        <View style={styles.titleSection}>
          <Text variant="h2" style={styles.welcomeTitle}>Bem-vinda de volta</Text>
          <Text variant="body" color={colors.textSecondary}>
            Entre na sua conta para continuar.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            placeholder="gaby@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            iconLeft={<Mail color={colors.textMuted} size={20} />}
          />

          <Input
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            iconLeft={<Lock color={colors.textMuted} size={20} />}
            iconRight={showPassword ? <EyeOff color={colors.textMuted} size={20} /> : <Eye color={colors.textMuted} size={20} />}
            onIconRightPress={() => setShowPassword(!showPassword)}
          />

          {/* Options row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberButton}
              onPress={() => setRememberMe(!rememberMe)}
            >
              {rememberMe ? (
                <CheckSquare color={colors.primary} size={20} />
              ) : (
                <View style={styles.checkboxEmpty} />
              )}
              <Text variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: 8 }}>
                Lembrar-me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          </View>

          <Button 
            title={isLoading ? 'Acessando...' : 'ENTRAR'} 
            variant="primary" 
            onPress={handleLogin} 
            disabled={isLoading}
            style={styles.loginButton}
          />
        </View>

        {/* Social Dividers */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text variant="caption" color={colors.textMuted} style={styles.dividerText}>
            OU CONTINUE COM
          </Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText} color={colors.textPrimary}>G Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialText} color={colors.textPrimary}> Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" color={colors.textSecondary}>Novo no Ágora? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
              Criar conta
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
    justifyContent: 'space-between',
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
  logoCenter: {
    alignItems: 'center',
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
  welcomeTitle: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  loginButton: {
    height: 56,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontWeight: '500',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
});
