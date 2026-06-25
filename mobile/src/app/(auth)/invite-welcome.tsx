import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldCheck } from 'lucide-react-native';

export default function InviteWelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inviterName, setInviterName] = useState('Alguém');
  const [inviterInitials, setInviterInitials] = useState('A');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async () => {
    try {
      const inviteCode = await AsyncStorage.getItem('pending_invite');
      if (!inviteCode) {
        router.replace('/(auth)/welcome');
        return;
      }

      const { data, error } = await supabase.rpc('get_invite_info', { code: inviteCode });
      
      if (error || !data || data.length === 0) {
        // Invite might be invalid or expired
        await AsyncStorage.removeItem('pending_invite');
        setErrorMsg('Este convite expirou ou não é mais válido.');
        setLoading(false);
        return;
      }

      setInviterName(data[0].inviter_name || 'Alguém');
      setInviterInitials(data[0].inviter_initials || 'A');
      setLoading(false);
    } catch (err) {

      setErrorMsg('Erro ao carregar o convite.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text variant="body" color={colors.textSecondary}>Carregando convite...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text variant="h2" style={{ marginBottom: spacing.md, textAlign: 'center' }}>Ops!</Text>
          <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginBottom: spacing.xl }}>{errorMsg}</Text>
          <Button title="IR PARA INÍCIO" onPress={() => router.replace('/(auth)/welcome')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.iconContainer}>
          <ShieldCheck color={colors.primary} size={48} />
        </View>

        <View style={styles.avatar}>
          <Text variant="h1" color={colors.primary}>{inviterInitials}</Text>
        </View>

        <Text variant="h2" style={styles.title}>
          {inviterName} te convidou para ser seu contato de segurança no Ágora
        </Text>
        
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Se {inviterName.split(' ')[0]} precisar de ajuda, você será notificado imediatamente.
        </Text>

      </View>

      <View style={styles.footer}>
        <Button 
          title="ACEITAR E CRIAR CONTA" 
          variant="primary" 
          onPress={() => router.push('/(auth)/register')} 
          style={{ marginBottom: spacing.md }}
        />
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.secondaryButton}>
          <Text variant="body" color={colors.primary} style={{ textAlign: 'center', fontWeight: '600' }}>
            Já tenho conta — fazer login
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    borderRadius: 50,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  secondaryButton: {
    padding: spacing.md,
  }
});
