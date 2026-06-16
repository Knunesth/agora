import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function LocationScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Location.PermissionStatus | 'undetermined'>('undetermined');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
    setStatus(currentStatus);
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'web') {
      alert('Acesse as configurações do seu navegador para alterar a permissão de localização.');
      return;
    }
    Linking.openSettings();
  };

  const isGranted = status === 'granted';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Localização</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={[styles.iconBox, { backgroundColor: isGranted ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)' }]}>
            <MapPin color={isGranted ? '#00C853' : '#FF1744'} size={24} />
          </View>
          <View style={styles.statusTexts}>
            <Text variant="body" style={{ fontWeight: '600' }}>Permissão de GPS</Text>
            <Text variant="bodySmall" color={isGranted ? '#00C853' : '#FF1744'}>
              {isGranted ? 'Ativada' : 'Desativada'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            Sua localização é usada apenas para exibir alertas próximos e nunca é compartilhada sem sua autorização.
          </Text>
        </View>

        <Button 
          title="ABRIR CONFIGURAÇÕES DO CELULAR" 
          variant="secondary" 
          onPress={handleOpenSettings} 
          style={{ marginTop: spacing.xl }}
        />
      </View>
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
  statusCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', 
    borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.surfaceBorder 
  },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statusTexts: { marginLeft: spacing.md },
  infoBox: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
});
