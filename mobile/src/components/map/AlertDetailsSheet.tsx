/**
 * Ágora — Painel de Detalhes do Alerta (RN-02)
 *
 * Exibe a foto expandida da denúncia e fornece o painel de votação (Consenso)
 * para alertas em quarentena. Impede auto-voto se user_id for o autor.
 */

import { forwardRef, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Alert as RNAlert, Platform } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ThumbsUp, ThumbsDown, ShieldAlert, CheckCircle, Clock, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Alert } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';

interface AlertDetailsSheetProps {
  alert: Alert | null;
  onVote: (vote: 'confirm' | 'reject') => Promise<void>;
  isVoting: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export const AlertDetailsSheet = forwardRef<BottomSheet, AlertDetailsSheetProps>(
  ({ alert, onVote, isVoting, onClose, onDeleteSuccess }, ref) => {
    const { user } = useAuth();
    const [address, setAddress] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Busca endereço legível por geocodificação reversa
    useEffect(() => {
      if (!alert) { setAddress(null); return; }
      Location.reverseGeocodeAsync(alert.coordinate)
        .then(([r]) => {
          if (!r) return;
          const parts = [r.street, r.streetNumber, r.district, r.city].filter(Boolean);
          setAddress(parts.join(', ') || null);
        })
        .catch(() => setAddress(null));
    }, [alert?.id]);
    
    const snapPoints = useMemo(() => ['50%', '85%'], []);

    // Proteção de UX da Regra de Negócio: não mostrar botões se o alerta for da própria pessoa
    const isOwnAlert = user?.id === alert?.userId;

    if (!alert) return null;

    const isVerified = alert.status === 'verified';

    const handleDeleteAlert = async () => {
      const executeDelete = async () => {
        setIsDeleting(true);
        try {
          const { error } = await supabase.from('alerts').delete().eq('id', alert.id);
          if (error) throw error;
          if (Platform.OS !== 'web') {
            RNAlert.alert('Sucesso', 'Alerta apagado com sucesso.');
          } else {
            window.alert('Alerta apagado com sucesso.');
          }
          onClose();
          if (onDeleteSuccess) onDeleteSuccess();
        } catch (err: any) {
          if (Platform.OS !== 'web') {
            RNAlert.alert('Erro', 'Falha ao apagar alerta.');
          } else {
            window.alert('Falha ao apagar alerta.');
          }
        } finally {
          setIsDeleting(false);
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm('Tem certeza que deseja apagar este alerta? Esta ação não pode ser desfeita.')) {
          executeDelete();
        }
      } else {
        RNAlert.alert(
          'Cancelar Alerta',
          'Tem certeza que deseja apagar este alerta? Esta ação não pode ser desfeita.',
          [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim, apagar', style: 'destructive', onPress: executeDelete }
          ]
        );
      }
    };
    
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          
          {/* Header Visual */}
          <View style={styles.headerRow}>
            {isVerified ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
                <CheckCircle size={16} color={colors.background} />
                <Text variant="bodySmall" color={colors.background} style={styles.statusText}>VERIFICADO</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
                <Clock size={16} color={colors.background} />
                <Text variant="bodySmall" color={colors.background} style={styles.statusText}>QUARENTENA</Text>
              </View>
            )}
            
            <Text variant="overline" color={colors.textSecondary}>
              {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <Text variant="h2" style={styles.title}>
            {alert.category.toUpperCase()}
          </Text>
          
          <Text variant="body" color={colors.textSecondary} style={styles.description}>
            {alert.description}
          </Text>

          {/* Localidade */}
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.primary} />
            <Text variant="bodySmall" color={colors.textSecondary} style={{ flex: 1, marginLeft: 6 }}>
              {address ??
                `${alert.coordinate.latitude.toFixed(5)}, ${alert.coordinate.longitude.toFixed(5)}`}
            </Text>
          </View>

          {/* Foto (Evidência) */}
          {alert.photoUrl ? (
            <Image source={{ uri: alert.photoUrl }} style={styles.evidenceImage} />
          ) : (
            <View style={styles.noEvidence}>
              <ShieldAlert size={32} color={colors.textMuted} />
              <Text color={colors.textMuted} style={{ marginTop: spacing.sm }}>Sem evidência fotográfica</Text>
            </View>
          )}

          {/* Seção de Consenso (Votação) */}
          <View style={styles.consensusSection}>
            <Text variant="h3" align="center">Consenso da Comunidade</Text>
            <Text variant="bodySmall" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
              Confirmações atuais: {alert.confirmations} / 3
            </Text>

            {isOwnAlert ? (
              <View style={styles.ownAlertMessage}>
                {!isVerified && (
                  <Text variant="bodySmall" align="center" color={colors.primary} style={{ marginBottom: spacing.md }}>
                    Este é o seu reporte. Aguarde os votos da comunidade.
                  </Text>
                )}
                <Button 
                  title={isDeleting ? 'Apagando...' : 'Excluir Meu Alerta'} 
                  variant="secondary" 
                  onPress={handleDeleteAlert} 
                  disabled={isDeleting || isVoting}
                  style={{ borderColor: colors.danger, borderWidth: 1 }}
                  textStyle={{ color: colors.danger }}
                />
              </View>
            ) : isVerified ? (
              <View style={styles.ownAlertMessage}>
                <Text variant="bodySmall" align="center" color={colors.textSecondary}>
                  Este alerta já foi confirmado pela rede e atingiu a credibilidade máxima.
                </Text>
              </View>
            ) : (
              <View style={styles.votingRow}>
                <Button 
                  title="Falso" 
                  variant="secondary" 
                  onPress={() => onVote('reject')} 
                  disabled={isVoting}
                  style={styles.voteBtn}
                  // icon={<ThumbsDown size={20} color={colors.danger} />} -> Opcional se Button aceitar icon
                />
                <Button 
                  title={isVoting ? 'Validando...' : 'Confirmar'} 
                  variant="primary" 
                  onPress={() => onVote('confirm')} 
                  disabled={isVoting}
                  style={styles.voteBtn}
                />
              </View>
            )}
          </View>

        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontWeight: 'bold',
  },
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  evidenceImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: spacing.lg,
    backgroundColor: '#000',
  },
  noEvidence: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
  },
  consensusSection: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  votingRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  voteBtn: {
    flex: 1,
  },
  ownAlertMessage: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  }
});
