import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Navigation, Crosshair } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

export default function LocationScreen() {
  const router = useRouter();
  const [foregroundStatus, setForegroundStatus] = useState<Location.PermissionStatus | 'undetermined'>('undetermined');
  const [backgroundStatus, setBackgroundStatus] = useState<Location.PermissionStatus | 'undetermined'>('undetermined');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status: currentForeground } = await Location.getForegroundPermissionsAsync();
    setForegroundStatus(currentForeground);

    if (Platform.OS !== 'web') {
      const { status: currentBackground } = await Location.getBackgroundPermissionsAsync();
      setBackgroundStatus(currentBackground);
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'web') {
      alert('Acesse as configurações do seu navegador para alterar a permissão de localização.');
      return;
    }
    Linking.openSettings();
  };

  const isForegroundGranted = foregroundStatus === 'granted';
  const isBackgroundGranted = backgroundStatus === 'granted';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Localização</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>PERMISSÕES DO SISTEMA</Text>
        
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.iconBox, { backgroundColor: isForegroundGranted ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)' }]}>
              <MapPin color={isForegroundGranted ? '#00C853' : '#FF1744'} size={24} />
            </View>
            <View style={styles.statusTexts}>
              <Text variant="body" style={{ fontWeight: '600' }}>Durante o uso (GPS)</Text>
              <Text variant="bodySmall" color={isForegroundGranted ? '#00C853' : '#FF1744'}>
                {isForegroundGranted ? 'Ativada' : 'Desativada'}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusRow}>
            <View style={[styles.iconBox, { backgroundColor: isBackgroundGranted ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)' }]}>
              <Navigation color={isBackgroundGranted ? '#00C853' : '#FF1744'} size={24} />
            </View>
            <View style={styles.statusTexts}>
              <Text variant="body" style={{ fontWeight: '600' }}>Segundo Plano (SOS)</Text>
              <Text variant="bodySmall" color={isBackgroundGranted ? '#00C853' : '#FF1744'}>
                {isBackgroundGranted ? 'Ativada' : 'Desativada'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ textAlign: 'center', lineHeight: 20 }}>
            Para que seus contatos de segurança acompanhem você em tempo real caso acione o SOS mesmo com o celular no bolso, ative a permissão "O Tempo Todo" nas configurações.
          </Text>
        </View>

        <View style={{ marginTop: spacing.xxl }}>
          <Button 
            title="GERENCIAR NO CELULAR" 
            variant="secondary" 
            onPress={handleOpenSettings} 
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
  content: { flex: 1, padding: spacing.lg },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { backgroundColor: '#1A1A1A', borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.surfaceBorder, overflow: 'hidden' },
  statusRow: { 
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
  },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginHorizontal: spacing.lg },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statusTexts: { marginLeft: spacing.md, flex: 1 },
  infoBox: { marginTop: spacing.lg, paddingHorizontal: spacing.sm },
});
