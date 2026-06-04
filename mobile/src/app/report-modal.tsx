/**
 * Ágora — Tela Modal de Reporte (RF-03)
 * Fluxo de Câmera e Formulário de Alerta.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera as CameraIcon, Check, RotateCcw } from 'lucide-react-native';

import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { RiskCategory } from '@/types';
import { storageService } from '@/services/storage';
import { supabase } from '@/services/supabase';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';

// Categorias disponíveis baseadas no Enum
const CATEGORIES: { id: RiskCategory; label: string }[] = [
  { id: 'furto', label: 'Furto/Roubo' },
  { id: 'assedio', label: 'Assédio' },
  { id: 'suspeito', label: 'Atit. Suspeita' },
  { id: 'iluminacao', label: 'Sem Luz' },
  { id: 'infraestrutura', label: 'Infra.' },
  { id: 'outro', label: 'Outro' },
];

export default function ReportModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // States do fluxo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<RiskCategory>('furto');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Garantir que temos a localização exata do momento do reporte
  const { location, loading: locLoading } = useLocation();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Passo 1: Tirar a foto
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) setPhotoUri(photo.uri);
    }
  };

  // Passo 2: Enviar denúncia (Upload da Foto + Banco de Dados)
  const submitAlert = async () => {
    if (!photoUri) {
      RNAlert.alert('Erro', 'A foto como evidência é obrigatória (RF-03).');
      return;
    }
    if (!description.trim()) {
      RNAlert.alert('Erro', 'Por favor, adicione uma breve descrição.');
      return;
    }
    if (!location) {
      RNAlert.alert('Erro', 'Aguarde o sinal de GPS para reportar.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Faz o upload e comprime (A validação de tolerância zero está dentro do serviço)
      const finalPhotoUrl = await storageService.uploadAlertPhoto(photoUri);

      // Inserção no banco PostGIS via WKT (Well-Known Text)
      const { error } = await supabase.from('alerts').insert({
        category,
        description,
        photo_url: finalPhotoUrl,
        // PostGIS aceita strings WKT direto: POINT(longitude latitude)
        location: `POINT(${location.longitude} ${location.latitude})`,
        user_id: user?.id, 
      });

      if (error) throw error;

      RNAlert.alert('Sucesso', 'Alerta registrado e em quarentena de verificação.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      RNAlert.alert('Erro no Envio', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>
          O Ágora precisa da sua câmera para registrar a evidência.
        </Text>
        <Button title="Conceder Permissão" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Novo Alerta</Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <X color={colors.textPrimary} size={28} />
        </TouchableOpacity>
      </View>

      {/* Viewport Principal (Câmera ou Preview+Form) */}
      {!photoUri ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing="back"
            animateShutter={false}
          />
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <View style={styles.previewHeader}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
              <RotateCcw color={colors.textPrimary} size={20} />
              <Text style={{ marginLeft: 8 }}>Tirar outra</Text>
            </TouchableOpacity>
          </View>

          <Text variant="body" style={styles.label}>Categoria do Risco</Text>
          <View style={styles.chipsContainer}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  category === cat.id && styles.chipActive
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text color={category === cat.id ? colors.background : colors.textPrimary}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text variant="body" style={styles.label}>Descrição Rápida</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Lâmpada do poste piscando e rua muito escura"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={140}
          />

          <View style={{ flex: 1 }} />

          <Button 
            title={isSubmitting ? "Enviando..." : "Reportar Risco"} 
            variant="primary"
            onPress={submitAlert}
            disabled={isSubmitting || locLoading}
          />
        </View>
      )}

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md }}>Processando e otimizando evidência...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl, // Espaço da safe area do modal
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  label: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
