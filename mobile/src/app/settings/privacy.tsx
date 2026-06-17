import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Modal, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export default function PrivacyScreen() {
  const router = useRouter();
  
  // States: Visibilidade do Perfil
  const [showToGuardians, setShowToGuardians] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);
  
  // States: Dados e Privacidade
  const [storeLocationHistory, setStoreLocationHistory] = useState(false);
  const [shareDataWithPartners, setShareDataWithPartners] = useState(false);

  // States: Loading & Modal
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_preferences, share_realtime_location, store_location_history, share_data_with_partners')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // notification_preferences might contain showToGuardians? 
        // We will just use the ones we have dedicated columns for now
        setShareLocation(data.share_realtime_location || false);
        setStoreLocationHistory(data.store_location_history || false);
        setShareDataWithPartners(data.share_data_with_partners || false);
        // showToGuardians logic could be in notification_preferences.sos_network, mapping it to true for now as requested.
        setShowToGuardians(data.notification_preferences?.sos_network ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileField = async (field: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err.message);
    }
  };

  const handleToggleShareLocation = (val: boolean) => {
    setShareLocation(val);
    updateProfileField('share_realtime_location', val);
  };

  const handleToggleStoreLocation = (val: boolean) => {
    setStoreLocationHistory(val);
    updateProfileField('store_location_history', val);
  };

  const handleToggleSharePartners = (val: boolean) => {
    setShareDataWithPartners(val);
    updateProfileField('share_data_with_partners', val);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As novas senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      Alert.alert('Erro', 'A nova senha deve ter no mínimo 8 caracteres e pelo menos 1 número.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Usuário não encontrado');

      // Validate current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta.');
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) throw updateError;

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOutOthers = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      Alert.alert('Sucesso', 'Todas as outras sessões foram encerradas.');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, alertsRes, votesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('alerts').select('*').eq('user_id', user.id).limit(1000),
        supabase.from('alert_votes').select('*').eq('user_id', user.id).limit(1000)
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: profileRes.data,
        alerts: alertsRes.data,
        votes: votesRes.data
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(jsonString);
        Alert.alert('Dados copiados!', 'Como você está na web, seus dados foram copiados para a área de transferência.');
      } else {
        const fileUri = FileSystem.documentDirectory + 'agora_data_export.json';
        await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Exportar Meus Dados' });
      }
    } catch (err: any) {
      Alert.alert('Erro ao exportar', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Tem certeza?',
      'Esta ação é irreversível e apagará todos os seus dados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirmação Final',
              'Digite "EXCLUIR" para confirmar a exclusão permanente da sua conta.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Confirmar', 
                  style: 'destructive',
                  onPress: async (text?: string) => {
                    if (text === 'EXCLUIR') {
                      executeDeleteAccount();
                    } else {
                      Alert.alert('Erro', 'Texto incorreto. Exclusão cancelada.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;

      await supabase.auth.signOut();
      router.replace('/(auth)/welcome');
    } catch (err: any) {
      Alert.alert('Erro ao excluir', err.message);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Privacidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* VISIBILIDADE DO PERFIL */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>VISIBILIDADE DO PERFIL</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Mostrar meu perfil para Guardiões</Text>
              <Text variant="caption" color={colors.textMuted}>Permite que Guardiões verificados próximos sejam notificados quando você acionar o SOS.</Text>
            </View>
            <Switch 
              value={showToGuardians} 
              onValueChange={(val) => {
                setShowToGuardians(val);
                // Placeholder para salvar no JSON de preferences
              }} 
              trackColor={{ true: colors.primary }} 
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Compartilhar localização em tempo real</Text>
              <Text variant="caption" color={colors.textMuted}>Mantém sua última localização atualizada para alertas de segurança próximos.</Text>
            </View>
            <Switch value={shareLocation} onValueChange={handleToggleShareLocation} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {/* SEGURANÇA DA CONTA */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>SEGURANÇA DA CONTA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowItem} onPress={() => setPasswordModalVisible(true)}>
            <Text variant="body" color={colors.textPrimary}>Alterar senha</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={[styles.row, { paddingVertical: spacing.md }]}>
            <View style={styles.rowText}>
              <Text variant="body">Sessões ativas</Text>
              <Text variant="caption" color={colors.textMuted}>Você está conectado neste dispositivo.</Text>
            </View>
            <Button title="Encerrar outras" variant="secondary" size="sm" onPress={handleSignOutOthers} />
          </View>
        </View>

        {/* DADOS E PRIVACIDADE */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>DADOS E PRIVACIDADE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Histórico de localização</Text>
              <Text variant="caption" color={colors.textMuted}>Permite que o Ágora armazene seu histórico de localização para melhorar alertas na sua região. Dados anonimizados.</Text>
            </View>
            <Switch value={storeLocationHistory} onValueChange={handleToggleStoreLocation} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Compartilhar dados com parceiros B2B</Text>
              <Text variant="caption" color={colors.textMuted}>Permite que estabelecimentos parceiros (Pontos Seguros) vejam alertas agregados da sua região.</Text>
            </View>
            <Switch value={shareDataWithPartners} onValueChange={handleToggleSharePartners} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={{ padding: spacing.lg }}>
            <Button 
              title={isExporting ? "Gerando JSON..." : "Exportar meus dados"} 
              variant="secondary" 
              onPress={handleExportData} 
              disabled={isExporting}
            />
          </View>
        </View>

        {/* DADOS DA CONTA */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>DADOS DA CONTA</Text>
        <View style={styles.card}>
          <Button 
            title={isDeleting ? "EXCLUINDO..." : "EXCLUIR MINHA CONTA"} 
            variant="secondary" 
            onPress={handleDeleteAccount} 
            style={styles.deleteButton}
            disabled={isDeleting}
          />
        </View>
      </ScrollView>

      {/* Bottom Sheet Modal: Change Password */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <Text variant="h3" style={{ marginBottom: spacing.lg }}>Alterar senha</Text>
            
            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>Senha atual</Text>
            <Input 
              secureTextEntry
              placeholder="Digite a senha atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              containerStyle={{ marginBottom: spacing.md }}
            />

            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>Nova senha (mín. 8 caracteres, 1 número)</Text>
            <Input 
              secureTextEntry
              placeholder="Digite a nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              containerStyle={{ marginBottom: spacing.md }}
            />

            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>Confirmar nova senha</Text>
            <Input 
              secureTextEntry
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              containerStyle={{ marginBottom: spacing.xl }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Button 
                title="Cancelar" 
                variant="ghost" 
                onPress={() => setPasswordModalVisible(false)} 
                style={{ flex: 1 }}
              />
              <Button 
                title={isChangingPassword ? "SALVANDO..." : "SALVAR"} 
                variant="primary" 
                onPress={handleChangePassword} 
                style={{ flex: 1 }}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  content: { padding: spacing.lg, paddingBottom: 100 },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { backgroundColor: '#1A1A1A', borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.surfaceBorder, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, justifyContent: 'space-between' },
  rowItem: { padding: spacing.lg },
  rowText: { flex: 1, paddingRight: spacing.md },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginHorizontal: spacing.lg },
  deleteButton: { borderColor: colors.danger, backgroundColor: 'rgba(255,23,68,0.05)', margin: spacing.lg },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  }
});
