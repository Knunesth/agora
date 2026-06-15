/**
 * Ágora — Tela de Contatos de Confiança
 *
 * Permite ao usuário adicionar, visualizar, editar e remover
 * contatos de confiança. Apenas frontend (sem integração backend).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  X,
  Edit3,
  Trash2,
  Users,
  Check,
} from 'lucide-react-native';
import { Text, Input, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius, shadow } from '@/theme/spacing';

// ─── Tipo ────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// ─── Estado inicial (demonstração) ───────────────────────────────────────────

const INITIAL_CONTACTS: Contact[] = [];

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ContactsScreen() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // ── Abrir modal para novo contato ────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setEmail('');
    setPhone('');
    setModalVisible(true);
  };

  // ── Abrir modal para editar contato ─────────────────────────────────────
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone);
    setModalVisible(true);
  };

  // ── Salvar (criar ou atualizar) ──────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) return;

    if (editingContact) {
      // Atualizar existente
      setContacts(prev =>
        prev.map(c =>
          c.id === editingContact.id
            ? { ...c, name: name.trim(), email: email.trim(), phone: phone.trim() }
            : c
        )
      );
    } else {
      // Criar novo
      const newContact: Contact = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      setContacts(prev => [...prev, newContact]);
    }

    setModalVisible(false);
  };

  // ── Remover contato ──────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // ── Fechar modal ─────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Contatos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
          <UserPlus color={colors.primary} size={22} />
        </TouchableOpacity>
      </View>

      {/* ── Lista de contatos ────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Contador */}
        <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
          {contacts.length === 0
            ? 'NENHUM CONTATO ADICIONADO'
            : `${contacts.length} CONTATO${contacts.length > 1 ? 'S' : ''}`}
        </Text>

        {/* Estado vazio */}
        {contacts.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Users color={colors.textMuted} size={40} />
            </View>
            <Text variant="body" color={colors.textSecondary} style={styles.emptyTitle}>
              Nenhum contato de confiança
            </Text>
            <Text variant="caption" color={colors.textMuted} style={styles.emptySubtitle}>
              Adicione pessoas de confiança para serem notificadas em situações de emergência.
            </Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleOpenAdd}>
              <UserPlus color={colors.primary} size={18} />
              <Text style={styles.emptyAddText}>Adicionar contato</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cards de contatos */}
        {contacts.map(contact => (
          <View key={contact.id} style={styles.contactCard}>
            {/* Avatar */}
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitials}>
                {contact.name
                  .split(' ')
                  .slice(0, 2)
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.contactInfo}>
              <Text variant="body" style={styles.contactName}>{contact.name}</Text>
              {contact.email ? (
                <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {contact.email}
                </Text>
              ) : null}
              {contact.phone ? (
                <Text variant="caption" color={colors.textMuted}>
                  {contact.phone}
                </Text>
              ) : null}
            </View>

            {/* Ações */}
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleOpenEdit(contact)}
                accessibilityLabel={`Editar contato ${contact.name}`}
              >
                <Edit3 color={colors.textSecondary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => handleDelete(contact.id)}
                accessibilityLabel={`Remover contato ${contact.name}`}
              >
                <Trash2 color={colors.danger} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Botão flutuante de adicionar ────────────────────────────────── */}
      {contacts.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleOpenAdd}>
          <UserPlus color={colors.textInverse} size={22} />
        </TouchableOpacity>
      )}

      {/* ── Modal de adicionar / editar ──────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Título */}
            <View style={styles.sheetHeader}>
              <Text variant="h3" style={styles.sheetTitle}>
                {editingContact ? 'Editar contato' : 'Novo contato'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModal}>
                <X color={colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <Input
                placeholder="Nome completo *"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                iconLeft={<User color={colors.textMuted} size={20} />}
              />
              <Input
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                iconLeft={<Mail color={colors.textMuted} size={20} />}
              />
              <Input
                placeholder="Telefone / WhatsApp"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                iconLeft={<Phone color={colors.textMuted} size={20} />}
              />
            </View>

            {/* Botão salvar */}
            <Button
              title={editingContact ? 'Salvar alterações' : 'Adicionar contato'}
              variant="primary"
              onPress={handleSave}
              disabled={!name.trim()}
              style={styles.saveButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    backgroundColor: '#0A0A0A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Lista
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  emptyAddText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },

  // Card de contato
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: colors.primary + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitials: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger + '30',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.lg,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceBorder,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Formulário
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  saveButton: {
    height: 56,
  },
});
