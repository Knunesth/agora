import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText, Image, Modal, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X, Home, Map, Bell, Flag, Building2,
  Settings, HelpCircle, LogOut, Phone, User
} from 'lucide-react-native';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { typography } from '@/theme/typography';

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !visible) return;
    supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setProfilePhotoUrl(data.avatar_url);
      });
  }, [user, visible]);

  const handleSignOut = async () => {
    onClose();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:190');
  };

  const handleNavigate = (route: any) => {
    onClose();
    router.push(route);
  };

  const avatarUrl = profilePhotoUrl || user?.user_metadata?.avatar_url;
  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'Meu Perfil';
  const email = user?.email || '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={onClose}>
        
        {/* Drawer container (interrompe o clique para não fechar quando clicado dentro) */}
        <TouchableOpacity activeOpacity={1} style={[styles.drawer, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24) }]}>
          
          {/* Botão Fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#8A8A8E" size={20} />
          </TouchableOpacity>

          {/* Avatar no Header — clicável para ir ao perfil */}
          <TouchableOpacity
            style={styles.header}
            onPress={() => handleNavigate('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <User color="#555" size={40} />
                )}
              </View>
            </View>
            <RNText style={styles.drawerUserName} numberOfLines={1}>{displayName}</RNText>
            <RNText style={styles.drawerUserEmail} numberOfLines={1}>{email}</RNText>
          </TouchableOpacity>

          {/* Menu Items */}
          <View style={styles.menuList}>
            
            {/* Início (Ativo - Fundo avermelhado) */}
            <TouchableOpacity style={styles.menuItemActive} onPress={() => handleNavigate('/(tabs)/index')}>
              <Home color="#FF1744" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabelActive}>Início</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/map')}>
              <Map color="#00C853" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Mapa</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/alerts')}>
              <Bell color="#FFD600" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Alertas</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/report-modal')}>
              <Flag color="#FF1744" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Reportar</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/partners')}>
              <Building2 color="#448AFF" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Lojas parceiras</RNText>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/(tabs)/profile')}>
              <Settings color="#8A8A8E" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Configurações</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('/settings/about')}>
              <HelpCircle color="#B388FF" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Ajuda e suporte</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut color="#8A8A8E" size={22} strokeWidth={2} />
              <RNText style={styles.menuLabel}>Sair</RNText>
            </TouchableOpacity>

          </View>

          {/* Rodapé: Card Emergência */}
          <View style={styles.emergencyWrapper}>
            <TouchableOpacity style={styles.emergencyCard} onPress={handleCallEmergency}>
              <View style={styles.emergencyIconBox}>
                <Phone color="#FFF" size={20} fill="#FFF" />
              </View>
              <View style={styles.emergencyTexts}>
                <RNText style={styles.emergencyTitle}>Emergência</RNText>
                <RNText style={styles.emergencySubtitle}>Ligar 190</RNText>
              </View>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  drawer: {
    width: '80%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: '#111111',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 10, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    }),
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  // Header com Avatar
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  drawerUserName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  drawerUserEmail: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  avatarGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Lista de Menus
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  menuItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
    backgroundColor: '#2A0B0B', // Dark red tint
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.1)',
  },
  menuLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  menuLabelActive: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 12,
    marginHorizontal: 16,
  },

  // Card de Emergência
  emergencyWrapper: {
    marginTop: 20,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#261212', // Darker red background
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.15)',
  },
  emergencyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTexts: {
    marginLeft: 16,
  },
  emergencyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencySubtitle: {
    color: '#FF1744',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
