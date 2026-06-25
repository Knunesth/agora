import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [alertsNearby, setAlertsNearby] = useState(true);
  const [confirmations, setConfirmations] = useState(true);
  const [sosNetwork, setSosNetwork] = useState(true);
  const [news, setNews] = useState(true);

  useEffect(() => {
    if (user) loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    const { data } = await supabase.from('user_profiles').select('notification_preferences').eq('id', user?.id).single();
    if (data?.notification_preferences) {
      const prefs = data.notification_preferences;
      setAlertsNearby(prefs.alerts_nearby ?? true);
      setConfirmations(prefs.confirmations ?? true);
      setSosNetwork(prefs.sos_network ?? true);
      setNews(prefs.agora_news ?? true);
    }
  };

  const savePreferences = async (newPrefs: Record<string, boolean>) => {
    if (!user) return;

    // Mescla com o estado atual (evita sobrescrever outras chaves)
    const merged = {
      alerts_nearby: alertsNearby,
      confirmations,
      sos_network: sosNetwork,
      agora_news: news,
      ...newPrefs,
    };

    const { error } = await supabase
      .from('user_profiles')
      .update({ notification_preferences: merged })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Erro', 'Não foi possível salvar as preferências. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Alertas próximos</Text>
              <Text variant="caption" color={colors.textMuted}>Notifica quando um alerta aparece no raio de 5km</Text>
            </View>
            <Switch 
              value={alertsNearby} 
              onValueChange={(val) => { setAlertsNearby(val); savePreferences({ alerts_nearby: val }); }} 
              trackColor={{ true: colors.primary }} 
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Confirmações</Text>
              <Text variant="caption" color={colors.textMuted}>Notifica quando alguém confirma seu alerta</Text>
            </View>
            <Switch 
              value={confirmations} 
              onValueChange={(val) => { setConfirmations(val); savePreferences({ confirmations: val }); }} 
              trackColor={{ true: colors.primary }} 
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">SOS da rede</Text>
              <Text variant="caption" color={colors.textMuted}>Notifica quando alguém da sua rede aciona SOS</Text>
            </View>
            <Switch 
              value={sosNetwork} 
              onValueChange={(val) => { setSosNetwork(val); savePreferences({ sos_network: val }); }} 
              trackColor={{ true: colors.primary }} 
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Novidades do Ágora</Text>
              <Text variant="caption" color={colors.textMuted}>Comunicados gerais e atualizações</Text>
            </View>
            <Switch 
              value={news} 
              onValueChange={(val) => { setNews(val); savePreferences({ agora_news: val }); }} 
              trackColor={{ true: colors.primary }} 
            />
          </View>
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
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceBorder, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, justifyContent: 'space-between' },
  rowText: { flex: 1, paddingRight: spacing.md },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginHorizontal: spacing.lg },
});
