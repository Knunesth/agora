import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { X, MapPin, Search, CheckCircle2, Home, Briefcase } from 'lucide-react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AddressModalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const type = (params.type as string) || 'home'; // 'home' ou 'work'
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isHome = type === 'home';

  const searchAddress = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}, Brasília, Brasil&format=json&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {

    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedAddress) return;
    
    setIsSaving(true);
    try {
      const addressKey = isHome ? 'home_address' : 'work_address';
      const locationKey = isHome ? 'home_location' : 'work_location';
      const lat = parseFloat(selectedAddress.lat);
      const lon = parseFloat(selectedAddress.lon);

      // Save to user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .update({
          [addressKey]: selectedAddress.display_name,
          [locationKey]: `POINT(${lon} ${lat})`
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {

      alert('Erro ao salvar endereço.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {isHome ? (
                <Home color={colors.primary} size={28} />
              ) : (
                <Briefcase color={colors.primary} size={28} />
              )}
              <Text variant="h3" style={{ marginLeft: spacing.sm, color: colors.textPrimary }}>
                {isHome ? 'Endereço de Casa' : 'Endereço do Trabalho'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <X color={colors.textMuted} size={24} />
            </TouchableOpacity>
          </View>

          {!isSuccess ? (
            <>
              <View style={styles.searchBox}>
                <Search color={colors.textMuted} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Buscar endereço..."
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={searchAddress}
                  autoFocus
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSelectedAddress(null); }}>
                    <X color={colors.textMuted} size={20} />
                  </TouchableOpacity>
                )}
              </View>

              {isSearching && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />}

              {!selectedAddress ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.place_id.toString()}
                  style={styles.list}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.resultItem}
                      onPress={() => {
                        setSelectedAddress(item);
                        setQuery(item.display_name);
                        setResults([]);
                      }}
                    >
                      <MapPin color={colors.textSecondary} size={18} />
                      <Text style={styles.resultText} numberOfLines={2}>
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View style={styles.selectedBox}>
                  <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                    Endereço selecionado:
                  </Text>
                  <Text variant="body" color={colors.textPrimary}>
                    {selectedAddress.display_name}
                  </Text>
                </View>
              )}

              <View style={styles.actionContainer}>
                <Button 
                  title={`Salvar como ${isHome ? 'Casa' : 'Trabalho'}`}
                  onPress={handleSave}
                  disabled={!selectedAddress || isSaving}
                />
                <Button 
                  title="Cancelar" 
                  onPress={() => router.back()}
                  variant="secondary"
                  disabled={isSaving}
                />
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 color={colors.primary} size={48} />
              </View>
              <Text variant="h2" align="center" style={{ marginBottom: spacing.lg, color: colors.textPrimary }}>
                Endereço salvo!
              </Text>
              <Text variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                Seu endereço de {isHome ? 'casa' : 'trabalho'} foi configurado com sucesso.
              </Text>
              <Button 
                title="Fechar" 
                onPress={() => router.back()}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  content: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, minHeight: 400
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { padding: spacing.xs },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 50, borderWidth: 1, borderColor: colors.surfaceBorder
  },
  input: { flex: 1, marginLeft: spacing.sm, color: colors.textPrimary, fontSize: 16 },
  list: { maxHeight: 200, marginTop: spacing.md },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder
  },
  resultText: { color: colors.textPrimary, marginLeft: spacing.sm, flex: 1 },
  selectedBox: {
    backgroundColor: colors.primaryMuted, padding: spacing.md, borderRadius: borderRadius.md,
    marginTop: spacing.md, borderWidth: 1, borderColor: colors.primaryGlow
  },
  actionContainer: { gap: spacing.md, marginTop: spacing.xl },
  successContainer: { alignItems: 'center', paddingVertical: spacing.md },
  successIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryMuted,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg
  }
});
