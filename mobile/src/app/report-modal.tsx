import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert as RNAlert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ChevronLeft, Shield, Info, MapPin, Camera as CameraIcon, RotateCcw, X } from 'lucide-react-native';

import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { RiskCategory, GeoCoords } from '@/types';
import { storageService } from '@/services/storage';
import { supabase } from '@/services/supabase';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { AgoraMap } from '@/components/map/AgoraMap';
import { Marker } from '@/components/map/MapElements';

const CATEGORIES: { id: RiskCategory; label: string; icon: string }[] = [
  { id: 'iluminacao', label: 'Iluminação precária', icon: '🌑' },
  { id: 'suspeito', label: 'Atividade suspeita', icon: '👀' },
  { id: 'furto', label: 'Crime em progresso', icon: '🚨' },
];

export default function ReportModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // States do fluxo
  const [showCamera, setShowCamera] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<RiskCategory>('iluminacao');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States de localização
  const { location, errorMsg, loading: locLoading } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<GeoCoords | null>(null);
  const [address, setAddress] = useState<string>('Buscando localização...');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Inicializa o local selecionado com o GPS
  useEffect(() => {
    if (location && !selectedLocation) {
      setSelectedLocation(location);
    }
  }, [location]);

  // Reverse Geocode sempre que o local mudar
  useEffect(() => {
    async function fetchAddress() {
      if (!selectedLocation) return;
      setAddress('Buscando endereço...');
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const street = place.street || place.name || '';
          const number = place.streetNumber ? `, ${place.streetNumber}` : '';
          const district = place.district ? `, ${place.district}` : '';
          const city = place.city || place.subregion || '';
          const state = place.region || '';
          
          let formatted = `${street}${number}${district} - ${city}-${state}`;
          formatted = formatted.replace(/^[\s,-]+|[\s,-]+$/g, '').trim();
          
          if (!formatted || formatted === '-') {
             formatted = 'Localização selecionada no mapa';
          }
          setAddress(formatted);
        } else {
          setAddress('Endereço não encontrado');
        }
      } catch (e) {
        setAddress('Localização selecionada (GPS)');
      }
    }
    fetchAddress();
  }, [selectedLocation]);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setSelectedLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } else {
        RNAlert.alert('Aviso', 'Permissão de localização foi negada.');
      }
    } catch (e) {
      RNAlert.alert('Erro', 'Não foi possível solicitar a localização.');
    }
  };

  const submitAlert = async () => {
    if (!photoUri) {
      RNAlert.alert('Aviso', 'Anexar uma evidência fotográfica é recomendável para este alerta.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar sem foto', onPress: proceedSubmit }
      ]);
      return;
    }
    proceedSubmit();
  };

  const proceedSubmit = async () => {
    if (!description.trim()) {
      RNAlert.alert('Erro', 'Por favor, adicione uma breve descrição.');
      return;
    }
    if (!selectedLocation) {
      RNAlert.alert('Erro', 'Aguarde o sinal de GPS ou escolha o local no mapa.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = null;
      if (photoUri) {
        finalPhotoUrl = await storageService.uploadAlertPhoto(photoUri);
      }

      const { error } = await supabase.from('alerts').insert({
        category,
        description,
        photo_url: finalPhotoUrl,
        location: `POINT(${selectedLocation.longitude} ${selectedLocation.latitude})`,
        user_id: user?.id, 
      });

      if (error) throw error;

      RNAlert.alert('Sucesso', 'Alerta registrado e em quarentena de verificação.', [
        { text: 'OK', onPress: () => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
      ]);
    } catch (err: any) {
      RNAlert.alert('Erro no Envio', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!permission) return <View style={styles.container} />;

  // View da Câmera
  if (showCamera) {
    if (!permission.granted) {
      return (
        <View style={[styles.container, styles.center]}>
          <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>
            O Ágora precisa da sua câmera para registrar a evidência.
          </Text>
          <Button title="Conceder Permissão" onPress={requestPermission} />
          <Button title="Voltar" variant="secondary" onPress={() => setShowCamera(false)} style={{marginTop: 16}} />
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing="back"
          animateShutter={false}
        />
        <View style={styles.cameraTopBar}>
          <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.closeCameraButton}>
            <X color="#FFF" size={28} />
          </TouchableOpacity>
        </View>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // View do Mapa (Picker)
  if (showMapPicker && selectedLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.mapPickerHeader}>
          <Text variant="h3">Escolha o Local</Text>
          <TouchableOpacity onPress={() => setShowMapPicker(false)} style={styles.closeCameraButton}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
        <AgoraMap 
          style={{ flex: 1 }}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onPress={(e: any) => {
            if (e.nativeEvent?.coordinate) {
              setSelectedLocation(e.nativeEvent.coordinate);
            }
          }}
        >
          <Marker 
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude
            }} 
            draggable
            onDragEnd={(e: any) => {
              if (e.nativeEvent?.coordinate) {
                setSelectedLocation(e.nativeEvent.coordinate);
              }
            }}
          />
        </AgoraMap>
        <View style={styles.mapPickerFooter}>
           <Text style={styles.mapPickerAddress} numberOfLines={2}>{address}</Text>
           <Button title="Confirmar Local" onPress={() => setShowMapPicker(false)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Shield color={colors.primary} size={24} style={{ marginBottom: 12 }} />
          <Text style={styles.bannerTitle}>Alertas da sua{'\n'}região</Text>
          <Text style={styles.bannerSubtitle}>Seja os olhos da sua cidade — sua denúncia pode salvar vidas.</Text>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isSubmitting}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text variant="h3" style={{ marginLeft: 16 }}>Registrar novo alerta</Text>
        </View>

        {/* Category Selection */}
        <Text style={styles.sectionLabel}>TIPO DE OCORRÊNCIA</Text>
        <View style={styles.cardsContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.card,
                category === cat.id && styles.cardActive
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.cardEmoji}>{cat.icon}</Text>
              <Text style={styles.cardText}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        {category === 'iluminacao' && (
          <View style={styles.infoBox}>
            <Info color="#448AFF" size={20} style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={styles.infoText}>Alertas de iluminação são enviados à zeladoria pública e ajudam a priorizar reparos.</Text>
          </View>
        )}

        {/* Location */}
        <Text style={styles.sectionLabel}>LOCALIZAÇÃO</Text>
        <View style={styles.locationBox}>
          <MapPin color={colors.primary} size={20} style={{ marginRight: 12 }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locLoading && !selectedLocation ? 'Obtendo GPS...' : address}
          </Text>
          {errorMsg ? (
            <TouchableOpacity onPress={requestLocationPermission}>
              <Text style={styles.editLocationText}>Permitir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowMapPicker(true)}>
              <Text style={styles.editLocationText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>DESCRIÇÃO</Text>
        <TextInput
          style={styles.input}
          placeholder="Descreva o trecho sem iluminação, postes apagados, área afetada..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={200}
        />

        {/* Evidence */}
        <Text style={styles.sectionLabel}>ANEXAR EVIDÊNCIA</Text>
        <View style={styles.evidenceRow}>
          {photoUri ? (
            <View style={styles.evidencePreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.evidenceImage} />
              <TouchableOpacity style={styles.removeEvidenceButton} onPress={() => setPhotoUri(null)}>
                <X color="#FFF" size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addEvidenceButton} onPress={() => setShowCamera(true)}>
              <CameraIcon color={colors.textSecondary} size={24} style={{ marginBottom: 4 }} />
              <Text style={styles.addEvidenceText}>Adicionar</Text>
            </TouchableOpacity>
          )}
          <View style={styles.evidencePlaceholder} />
        </View>

        <View style={{ position: 'absolute', bottom: spacing.xxl, left: spacing.lg, right: spacing.lg }}>
          <Button 
            title="ALERTAR SITUAÇÃO" 
            onPress={submitAlert} 
            loading={isSubmitting}
            variant="primary"
            style={{ borderRadius: 16, paddingVertical: 18, backgroundColor: '#00E676' }}
          />
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: '#FFF' }}>Registrando alerta...</Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  headerBanner: {
    backgroundColor: '#0A331A',
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'Inter_800ExtraBold',
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  bannerSubtitle: {
    color: '#A0DCA0',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: spacing.lg,
    width: '47%',
  },
  cardActive: {
    backgroundColor: '#162330',
    borderColor: '#2D5070',
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  cardText: {
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#0F1A24',
    borderWidth: 1,
    borderColor: '#1C3145',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    color: '#A0B0C0',
    fontSize: 13,
    lineHeight: 18,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  locationText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  editLocationText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    padding: spacing.sm,
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
    marginBottom: spacing.xl,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  addEvidenceButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEvidenceText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  evidencePreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  removeEvidenceButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  evidencePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraTopBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  closeCameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl + 10,
    backgroundColor: colors.surface,
  },
  mapPickerFooter: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    paddingBottom: spacing.xl + 10,
  },
  mapPickerAddress: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    fontFamily: 'Inter_400Regular',
  }
});
