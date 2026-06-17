/**
 * Ágora — Tela de Login (Sprint 9 — Corrigida)
 * Usa apenas RNText nativo para evitar o crash "Text strings must be rendered within a Text component".
 */

import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, Image, Text as RNText, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { supabase } from '@/services/supabase';

// Credenciais de teste — visíveis somente em modo DEV
const TEST_EMAIL    = 'teste@agora.app';
const TEST_PASSWORD = 'Agora@2025';

export default function LoginScreen() {
  const router = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isLoadingRef = useRef(false);

  const handleLogin = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isLoadingRef.current) return;
    
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Preencha email e senha.');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        } else {
          setErrorMsg(error.message);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro inesperado.');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
    // RouteGuard cuida do redirecionamento pós-login.
  };

  const handleTestLogin = () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ─────────────────────────────────────────────── */}
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
              <RNText style={styles.brandName}>Ágora</RNText>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* ── Títulos ────────────────────────────────────────────── */}
          <View style={styles.titleSection}>
            <RNText style={styles.welcomeTitle}>Bem-vindo(a) de volta</RNText>
            <RNText style={styles.welcomeSubtitle}>Entre na sua conta para continuar.</RNText>
            
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <RNText style={styles.errorText}>{errorMsg}</RNText>
              </View>
            ) : null}
          </View>

          {/* ── Formulário ─────────────────────────────────────────── */}
          <View style={styles.form}>
            <Input
              placeholder="seu@email.com"
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
              iconRight={
                showPassword
                  ? <EyeOff color={colors.textMuted} size={20} />
                  : <Eye  color={colors.textMuted} size={20} />
              }
              onIconRightPress={() => setShowPassword(!showPassword)}
            />

            {/* Esqueci a senha */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <RNText style={styles.forgotText}>Esqueci a senha</RNText>
            </TouchableOpacity>

            {/* Botão principal */}
            <Button
              title={isLoading ? 'Acessando...' : 'ENTRAR'}
              variant="primary"
              onPress={handleLogin}
              disabled={isLoading}
              style={{ height: 56 }}
            />

            {/* Botão DEV */}
            {__DEV__ && (
              <TouchableOpacity style={styles.devButton} onPress={handleTestLogin}>
                <RNText style={styles.devButtonText}>
                  {'🧪 Preencher login de teste'}
                </RNText>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Divisor ────────────────────────────────────────────── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <RNText style={styles.dividerText}>{'OU CONTINUE COM'}</RNText>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Botões Sociais ──────────────────────────────────────── */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <RNText style={styles.socialText}>{'G  Google'}</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <RNText style={styles.socialText}>{'  Apple'}</RNText>
            </TouchableOpacity>
          </View>

          {/* ── Rodapé ─────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>{'Novo no Ágora? '}</RNText>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <RNText style={styles.footerLink}>Criar conta</RNText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll:    { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  logoCenter: { alignItems: 'center' },
  logoImage:  { width: 48, height: 48, marginBottom: 2 },
  brandName: {
    fontSize: 18, fontWeight: '700', color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold, letterSpacing: -0.5,
  },

  // Titles
  titleSection: { marginTop: spacing.xl, marginBottom: spacing.xl },
  welcomeTitle: {
    fontSize: 28, fontWeight: '700', color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold, marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 15, color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  errorContainer: {
    marginTop: spacing.md, padding: spacing.sm,
    backgroundColor: '#FEE2E2', borderRadius: 8,
    borderWidth: 1, borderColor: '#F87171',
  },
  errorText: {
    color: '#B91C1C', fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },

  // Form
  form: { gap: spacing.md },
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: {
    fontSize: 14, color: colors.primary, fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
  },

  // DEV button
  devButton: {
    marginTop: spacing.xs, padding: spacing.sm,
    borderRadius: 8, borderWidth: 1, borderColor: '#444',
    borderStyle: 'dashed', alignItems: 'center',
  },
  devButtonText: {
    color: '#888', fontSize: 12, fontFamily: typography.fontFamily.regular,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surfaceBorder },
  dividerText: {
    marginHorizontal: spacing.md, fontSize: 11, color: colors.textMuted,
    fontFamily: typography.fontFamily.regular, letterSpacing: 1,
  },

  // Social
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialButton: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  socialText: {
    fontSize: 15, fontWeight: '500', color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },

  // Footer
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  footerText: {
    fontSize: 14, color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  footerLink: {
    fontSize: 14, color: colors.primary, fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
  },
});
