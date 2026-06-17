import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { X, ShieldAlert, Users, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';

export default function SOSConfirmModalScreen() {
  const router = useRouter();
  const { location: userLocation } = useLocation();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ 
    contacts_notified: number; 
    guardians_notified: number;
    tracking_url: string;
  } | null>(null);

  const [hasContacts, setHasContacts] = useState<boolean | null>(null);
  const [triggerEnabled, setTriggerEnabled] = useState(false);

  useEffect(() => {
    // Só habilita o botão após 1 segundo para evitar acidente
    const timer = setTimeout(() => {
      setTriggerEnabled(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkContacts() {
      if (!user) return;
      const { data } = await supabase
        .from('trusted_contacts')
        .select('id')
        .eq('user_id', user.id);
      setHasContacts((data && data.length > 0) ? true : false);
    }
    checkContacts();
  }, [user]);

  const handleTriggerSOS = async () => {
    if (!user || !userLocation) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('sos-alert', {
        body: { location: userLocation, user_id: user.id }
      });
      
      if (error) throw error;
      
      setSuccessData({
        contacts_notified: data.contacts_notified ?? 0,
        guardians_notified: data.guardians_notified ?? 0,
        tracking_url: data.tracking_url ?? ''
      });
    } catch (error) {
      console.error('SOS error:', error);
      // Nenhuma menção a 190. Mantendo foco na rede privada.
      alert('Não foi possível acionar a rede. Verifique sua conexão e tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!successData?.tracking_url) return;
    try {
      await Share.share({
        message: `Preciso de ajuda! Acompanhe minha localização em tempo real: ${successData.tracking_url}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ShieldAlert color={colors.danger} size={28} />
              <Text variant="h3" style={{ marginLeft: spacing.sm, color: colors.danger }}>
                Acionar Rede de Segurança?
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <X color={colors.textMuted} size={24} />
            </TouchableOpacity>
          </View>

          {!successData ? (
            <>
              {hasContacts === false ? (
                <View style={styles.warningBox}>
                  <AlertTriangle color={colors.warning} size={24} style={{ marginBottom: spacing.xs }} />
                  <Text variant="bodySmall" color={colors.warning} style={{ fontWeight: 'bold' }}>
                    Você ainda não tem contatos de confiança.
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                    Guardiões verificados próximos serão notificados, mas recomendamos adicionar pessoas de confiança para emergências.
                  </Text>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text variant="body" color={colors.textPrimary} style={{ marginBottom: spacing.md }}>
                    Ao confirmar, o Ágora irá:
                  </Text>
                  <View style={styles.bulletItem}>
                    <Users color={colors.danger} size={18} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.bulletText}>
                      Notificar seus contatos de confiança
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <ShieldAlert color={colors.danger} size={18} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.bulletText}>
                      Alertar Guardiões verificados num raio de 2km
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <Navigation color={colors.danger} size={18} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.bulletText}>
                      Compartilhar sua localização atual com eles
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <AlertTriangle color={colors.danger} size={18} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.bulletText}>
                      Criar um link de rastreamento por 30 minutos
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.actionContainer}>
                {hasContacts === false && (
                  <Button 
                    title="Adicionar contatos" 
                    onPress={() => { router.back(); router.push('/settings/contacts'); }}
                    variant="secondary"
                    disabled={isSubmitting}
                  />
                )}
                
                <TouchableOpacity 
                  style={[
                    styles.triggerBtn, 
                    (!triggerEnabled || isSubmitting) && { opacity: 0.5 }
                  ]}
                  onPress={handleTriggerSOS}
                  disabled={!triggerEnabled || isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.textPrimary} />
                  ) : (
                    <Text style={styles.triggerBtnText}>
                      {hasContacts === false ? 'Acionar mesmo assim' : 'ACIONAR AGORA'}
                    </Text>
                  )}
                </TouchableOpacity>
                
                <Button 
                  title="Cancelar" 
                  onPress={() => router.back()}
                  variant="secondary"
                  disabled={isSubmitting}
                  style={styles.cancelBtn}
                />
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 color={colors.danger} size={48} />
              </View>
              <Text variant="h2" align="center" style={{ marginBottom: spacing.lg, color: colors.danger }}>
                Rede acionada!
              </Text>
              
              <View style={styles.successMetrics}>
                <Text variant="body" color={colors.textSecondary} style={styles.metricText}>
                  👥 {successData.contacts_notified} contatos de confiança notificados
                </Text>
                <Text variant="body" color={colors.textSecondary} style={styles.metricText}>
                  🛡️ {successData.guardians_notified} Guardiões próximos alertados
                </Text>
                <Text variant="body" color={colors.textSecondary} style={styles.metricText}>
                  📍 Sua localização foi compartilhada
                </Text>
              </View>

              <View style={styles.trackingInfo}>
                <Text variant="caption" align="center" color={colors.dangerLight}>
                  Link de rastreamento ativo por 30 min.
                </Text>
              </View>
              
              <View style={{ gap: spacing.sm, width: '100%' }}>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Text style={styles.shareBtnText}>Compartilhar link</Text>
                </TouchableOpacity>
                <Button 
                  title="Fechar" 
                  onPress={() => router.back()}
                  variant="secondary"
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.85)', // Fundo com transparência conforme especificado
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.dangerMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: spacing.xs,
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dangerMuted,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 214, 0, 0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 0, 0.3)',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bulletText: {
    marginLeft: spacing.sm,
  },
  actionContainer: {
    gap: spacing.md,
  },
  triggerBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    borderColor: colors.surfaceBorder,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dangerMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successMetrics: {
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dangerMuted,
  },
  metricText: {
    fontWeight: '500',
  },
  trackingInfo: {
    marginBottom: spacing.xl,
    backgroundColor: colors.dangerMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  shareBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  }
});
