import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function unmask(value: string) {
  return value.replace(/\D/g, '');
}

function maskPhone(value: string) {
  const r = value.replace(/\D/g, '');
  if (r.length > 10) {
    return r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (r.length > 5) {
    return r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (r.length > 2) {
    return r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
  }
  return r;
}

function maskDate(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  
  const [birthDateText, setBirthDateText] = useState('');

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase.from('user_profiles').select('*').eq('id', user?.id).single();
      if (data) {
        setName(data.display_name || user?.user_metadata?.display_name || '');
        setPhone(maskPhone(data.phone || ''));
        setCpf(maskCPF(data.cpf_number || ''));
        setNeighborhood(data.neighborhood || '');
        if (data.birth_date) {
          const [year, month, day] = data.birth_date.split('-');
          setBirthDateText(`${day}/${month}/${year}`);
        }
      }
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (unmask(cpf).length !== 11 && unmask(cpf).length > 0) return 'CPF deve ter 11 dígitos';
    if (unmask(phone).length < 10 && unmask(phone).length > 0) return 'Telefone inválido';
    if (birthDateText.length > 0 && birthDateText.length !== 10) return 'Data de nascimento incompleta';
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setSaving(true);
    try {
      let dateString = null;
      if (birthDateText.length === 10) {
        const [day, month, year] = birthDateText.split('/');
        dateString = `${year}-${month}-${day}`;
      }
      
      await supabase.from('user_profiles').update({
        display_name: name.trim(),
        phone: unmask(phone),
        cpf_number: unmask(cpf),
        birth_date: dateString,
        neighborhood: neighborhood.trim()
      }).eq('id', user?.id);
      
      // Update Auth metadata as well so session is in sync
      await supabase.auth.updateUser({
        data: { display_name: name.trim() }
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/profile');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/profile');
            }}
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text variant="h3" style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text variant="h1" color={colors.primary}>{initials || 'CD'}</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <Text variant="bodySmall" color={colors.danger} style={{ textAlign: 'center', marginBottom: spacing.md }}>
              {errorMsg}
            </Text>
          ) : null}

          <View style={styles.formGroup}>
            <Text variant="label" color={colors.textSecondary} style={styles.label}>Nome completo</Text>
            <Input 
              value={name} 
              onChangeText={setName} 
              placeholder="Digite seu nome" 
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text variant="label" color={colors.textSecondary} style={styles.label}>Telefone</Text>
            <Input 
              value={phone} 
              onChangeText={(val) => setPhone(maskPhone(val))} 
              placeholder="(00) 00000-0000" 
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.formGroup}>
            <Text variant="label" color={colors.textSecondary} style={styles.label}>CPF</Text>
            <Input 
              value={cpf} 
              onChangeText={(val) => setCpf(maskCPF(val))} 
              placeholder="000.000.000-00" 
              keyboardType="numeric"
              maxLength={14}
            />
            <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
              Usado para verificação de identidade em denúncias oficiais.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text variant="label" color={colors.textSecondary} style={styles.label}>Data de Nascimento</Text>
            <Input 
              value={birthDateText} 
              onChangeText={(val) => setBirthDateText(maskDate(val))} 
              placeholder="DD/MM/AAAA" 
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.formGroup}>
            <Text variant="label" color={colors.textSecondary} style={styles.label}>Bairro / Região</Text>
            <Input 
              value={neighborhood} 
              onChangeText={setNeighborhood} 
              placeholder="Ex: Asa Sul, Brasília-DF" 
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={styles.footer}>
          <Button 
            title="SALVAR ALTERAÇÕES" 
            variant="primary" 
            onPress={handleSave} 
            loading={saving}
            disabled={loading || saving}
          />
        </View>
      </KeyboardAvoidingView>
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
  content: { padding: spacing.lg },
  avatarContainer: { alignItems: 'center', marginVertical: spacing.xl },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(68, 138, 255, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
  cameraBtn: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0D0D0D' },
  formGroup: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm },
  dateSelector: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 8, padding: 14 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.surfaceBorder, backgroundColor: '#0D0D0D' },
});
