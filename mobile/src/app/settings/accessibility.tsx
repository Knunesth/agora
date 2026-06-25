import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function AccessibilityScreen() {
  const router = useRouter();
  const {
    fontSizeMultiplier, setFontSizeMultiplier,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    largeTouchTargets, setLargeTouchTargets,
    imageDescriptions, setImageDescriptions
  } = useAccessibility();

  const handleOpenAccessibilitySettings = () => {
    Alert.alert(
      'Em breve', 
      'Esta funcionalidade estará disponível na próxima versão do Ágora.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Acessibilidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>TAMANHO DO TEXTO</Text>
        <View style={styles.card}>
          <View style={styles.scaleRow}>
            <TouchableOpacity onPress={() => setFontSizeMultiplier(0.85)} style={[styles.scaleBtn, fontSizeMultiplier === 0.85 && styles.scaleActive]}>
              <Text variant="bodySmall">Pequeno</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSizeMultiplier(1)} style={[styles.scaleBtn, fontSizeMultiplier === 1 && styles.scaleActive]}>
              <Text variant="bodySmall">Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSizeMultiplier(1.2)} style={[styles.scaleBtn, fontSizeMultiplier === 1.2 && styles.scaleActive]}>
              <Text variant="bodySmall">Grande</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>OPÇÕES VISUAIS E DE MOVIMENTO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Alto contraste</Text>
              <Text variant="caption" color={colors.textMuted}>Aumenta distinção visual de fundos e bordas</Text>
            </View>
            <Switch value={highContrast} onValueChange={setHighContrast} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Reduzir animações</Text>
              <Text variant="caption" color={colors.textMuted}>Desativa animações de movimento</Text>
            </View>
            <Switch value={reduceMotion} onValueChange={setReduceMotion} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Alvos de toque ampliados</Text>
              <Text variant="caption" color={colors.textMuted}>Aumenta o tamanho de todos os botões (56px)</Text>
            </View>
            <Switch value={largeTouchTargets} onValueChange={setLargeTouchTargets} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="body">Descrições de imagem</Text>
              <Text variant="caption" color={colors.textMuted}>Ativa textos descritivos adicionais para leitores de tela nas fotos</Text>
            </View>
            <Switch value={imageDescriptions} onValueChange={setImageDescriptions} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>LEITURA DE TELA</Text>
        <View style={styles.card}>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
            O aplicativo Ágora é otimizado para o TalkBack (Android) e VoiceOver (iOS). Para ativar ou desativar o leitor de tela do seu sistema, acesse as configurações do dispositivo.
          </Text>
          <TouchableOpacity onPress={handleOpenAccessibilitySettings} style={styles.linkBtn}>
            <Text variant="body" color={colors.primary}>Abrir Configurações do Sistema</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  scaleRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  scaleBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: 8 },
  scaleActive: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  linkBtn: { alignItems: 'center', paddingVertical: spacing.sm },
});
