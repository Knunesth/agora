/**
 * Ágora — Tela de Cadastro Renovada (Sprint 8)
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Mail, Phone, Lock, Eye, EyeOff, CheckSquare } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const handleRegister = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isLoadingRef.current) return;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Atenção', 'Você precisa aceitar os termos de uso para continuar.');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
          }
        }
      });

      if (error) {
        Alert.alert('Erro no Cadastro', error.message);
      } else {
        // Verificar se existe convite pendente e aceitar
        const pendingInvite = await AsyncStorage.getItem('pending_invite');
        if (pendingInvite) {
          await supabase.functions.invoke('accept-invite', {
            body: { invite_code: pendingInvite }
          });
          await AsyncStorage.removeItem('pending_invite');
        }

        router.push('/(auth)/success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header (Back) */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft color={colors.textPrimary} size={24} />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
            <View style={{ width: 40 }} />
          </View>

          {/* Titles */}
          <View style={styles.titleSection}>
            <Text variant="h2" style={styles.title}>Criar sua conta</Text>
            <Text variant="body" color={colors.textSecondary}>
              Junte-se à comunidade Ágora.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              iconLeft={<User color={colors.textMuted} size={20} />}
            />

            <Input
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeft={<Mail color={colors.textMuted} size={20} />}
            />

            <Input
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              iconLeft={<Phone color={colors.textMuted} size={20} />}
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

            <Input
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              iconLeft={<Lock color={colors.textMuted} size={20} />}
            />

            {/* Terms */}
            <TouchableOpacity 
              style={styles.termsRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              {acceptedTerms ? (
                <CheckSquare color={colors.primary} size={20} />
              ) : (
                <View style={styles.checkboxEmpty} />
              )}
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 8, flex: 1 }}>
                Aceito os <Text variant="caption" color={colors.primary}>Termos de Uso</Text> e a <Text variant="caption" color={colors.primary}>Política de Privacidade</Text>.
              </Text>
            </TouchableOpacity>

            <Button 
              title={isLoading ? 'Criando...' : 'CRIAR CONTA'} 
              variant="primary" 
              onPress={handleRegister} 
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={{ height: 40 }} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodySmall" color={colors.textSecondary}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
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
  titleSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  submitButton: {
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    marginTop: 'auto',
  },
});
