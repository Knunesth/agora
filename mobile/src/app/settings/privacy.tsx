import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function PrivacyScreen() {
  const router = useRouter();
  const [showToGuardians, setShowToGuardians] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Atenção',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirmação final', 'Confirmar exclusão permanente da conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sim, Excluir', style: 'destructive', onPress: () => console.log('Account deleted') }
            ]);
          }
        }
      ]
    );
  };

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
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>VISIBILIDADE DO PERFIL</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Mostrar meu perfil para Guardiões</Text>
              <Text variant="caption" color={colors.textMuted}>Permite que socorristas próximos vejam sua localização em emergências (SOS).</Text>
            </View>
            <Switch value={showToGuardians} onValueChange={setShowToGuardians} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Compartilhar localização em tempo real</Text>
              <Text variant="caption" color={colors.textMuted}>Mantém sua última localização atualizada para alertas de segurança próximos.</Text>
            </View>
            <Switch value={shareLocation} onValueChange={setShareLocation} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>DADOS DA CONTA</Text>
        <View style={styles.card}>
          <Button 
            title="EXCLUIR MINHA CONTA" 
            variant="secondary" 
            onPress={handleDeleteAccount} 
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
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
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceBorder, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, justifyContent: 'space-between' },
  rowText: { flex: 1, paddingRight: spacing.md },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginHorizontal: spacing.lg },
  deleteButton: { borderColor: colors.danger, backgroundColor: 'rgba(255,23,68,0.05)', margin: spacing.lg },
});
