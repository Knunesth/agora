import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Modal, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, UserPlus, Mail, Link as LinkIcon, Users } from 'lucide-react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { supabase } from '@/services/supabase';

type Contact = {
  id: string;
  display_name: string;
};

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contactsData, error: contactsError } = await supabase
        .from('trusted_contacts')
        .select('contact_user_id')
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      if (contactsData && contactsData.length > 0) {
        const contactIds = contactsData.map(c => c.contact_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .in('id', contactIds);

        if (profilesError) throw profilesError;

        if (profilesData) {
          setContacts(profilesData.map(p => ({
            id: p.id,
            display_name: p.display_name || 'Desconhecido'
          })));
        }
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar os contatos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    Alert.alert(
      'Em breve', 
      'Esta funcionalidade estará disponível na próxima versão do Ágora.',
      [{ text: 'OK' }]
    );
  };

  const handleAddByEmail = async () => {
    if (!emailToInvite) return;
    setLoadingInvite(true);
    try {
      const { data, error } = await supabase.rpc('add_trusted_contact_by_email', {
        email_query: emailToInvite.trim().toLowerCase()
      });

      if (error) throw error;

      if (data) {
        Alert.alert('Sucesso!', 'Contato adicionado com sucesso!');
        setModalVisible(false);
        setEmailToInvite('');
        loadContacts();
      } else {
        Alert.alert('Não encontrado', 'Usuário não encontrado. Que tal convidar pelo link?');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoadingInvite(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Contatos de Segurança</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Users color={colors.primary} size={32} style={{ marginBottom: spacing.md }} />
          <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            Estes contatos serão notificados automaticamente caso você acione um SOS. Construa sua rede de confiança.
          </Text>
        </View>

        {loading ? (
          <Text variant="body" style={{ textAlign: 'center', marginTop: spacing.xl }}>Carregando...</Text>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
              Nenhum contato adicionado ainda.
            </Text>
          </View>
        ) : (
          <View style={styles.contactList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.avatarSmall}>
                  <Text variant="body" color={colors.primary} style={{ fontWeight: 'bold' }}>
                    {contact.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text variant="h3" style={{ fontSize: 16 }}>{contact.display_name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="ADICIONAR CONTATO" 
          variant="primary" 
          onPress={() => setModalVisible(true)} 
          icon={<UserPlus color={colors.background} size={20} />}
        />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text variant="h3" style={{ marginBottom: spacing.lg, textAlign: 'center' }}>Adicionar Contato</Text>
            
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={handleGenerateLink}
              disabled={loadingInvite}
            >
              <View style={styles.actionIcon}>
                <LinkIcon color={colors.primary} size={24} />
              </View>
              <View style={styles.actionTexts}>
                <Text variant="body" style={{ fontWeight: 'bold' }}>Convidar pelo Link</Text>
                <Text variant="caption" color={colors.textSecondary}>Envia um link convite via WhatsApp, SMS, etc.</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={{ marginBottom: spacing.md }}>
              <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                Ou adicione um usuário JÁ ATIVO no Ágora:
              </Text>
              <Input
                placeholder="Email do usuário já cadastrado..."
                value={emailToInvite}
                onChangeText={setEmailToInvite}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                iconLeft={<Mail color={colors.textMuted} size={20} />}
              />
            </View>

            <Button 
              title={loadingInvite ? "Buscando..." : "BUSCAR E ADICIONAR"} 
              variant="secondary" 
              onPress={handleAddByEmail} 
              disabled={loadingInvite || !emailToInvite}
            />

            <TouchableOpacity style={{ marginTop: spacing.xl, padding: spacing.sm }} onPress={() => setModalVisible(false)}>
              <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: { fontSize: 18 },
  backButton: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: spacing.xl },
  infoBox: {
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(68, 138, 255, 0.2)',
  },
  emptyState: { paddingVertical: spacing.xxl },
  contactList: { gap: spacing.md },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },
  avatarSmall: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  actionIcon: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(68, 138, 255, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  actionTexts: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.surfaceBorder, marginVertical: spacing.md }
});
