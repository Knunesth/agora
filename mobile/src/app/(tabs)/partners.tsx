import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/theme/typography';

const STORES = [
  {
    id: 1,
    name: 'Safety Trab',
    category: 'Soluções de segurança:',
    features: ['Equipamentos de Proteção', 'Calçados e uniformes', 'Sinalização de segurança'],
    distance: '780 m',
    image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    name: 'Alta Segurança',
    category: 'Sistemas de Segurança:',
    features: ['Câmeras de Monitoramento', 'Alarmes Residenciais', 'Alarmes Comerciais'],
    distance: '1,6 km',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 3,
    name: 'Vigora Segurança',
    category: 'Tecnologia e Proteção:',
    features: ['Soluções de Segurança', 'Instalação Profissional', 'Suporte Técnico'],
    distance: '2,5 km',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
  }
];

export default function PartnersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} // 100 to clear the tab bar
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backIconCircle}>
            <ChevronLeft color="#FFF" size={20} strokeWidth={2.5} />
          </View>
          <Text style={styles.backText}>Voltar ao menu</Text>
        </TouchableOpacity>

        {/* Hero Card */}
        <LinearGradient 
          colors={['#1B5E20', '#0A2B10']} 
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Shield color="#00E676" size={20} strokeWidth={2} style={{ marginBottom: 12 }} />
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>Lojas parceiras</Text>
          </View>
          <Text style={styles.heroSubtitle}>As melhores lojas de segurança da região</Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Lojas próximas a você:</Text>

        {/* Stores List */}
        {STORES.map((store) => (
          <View key={store.id} style={styles.card}>
            <Image source={{ uri: store.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{store.name}</Text>
              </View>
              <Text style={styles.cardCategory}>{store.category}</Text>
              
              <View style={styles.features}>
                {store.features.map(f => (
                  <View key={f} style={styles.featureRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.featureItem}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.distanceRow}>
                <MapPin size={12} color="#888" />
                <Text style={styles.distanceText}>{store.distance}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11131A', // Darkest blue/black
  },
  scrollContent: {
    padding: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E222D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  
  heroCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  heroTitleContainer: {
    transform: [{ scaleX: 1.2 }],
    alignItems: 'flex-start',
    marginLeft: 16, // Compensate for scale expansion
    marginBottom: 8,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: typography.fontFamily.black,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 16,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1C24',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    height: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardImage: {
    width: '40%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    width: '60%',
    padding: 14,
  },
  cardTitleContainer: {
    transform: [{ scaleX: 1.15 }],
    alignItems: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#FFF',
    fontFamily: typography.fontFamily.black,
    fontSize: 15,
  },
  cardCategory: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: 6,
  },
  features: {
    marginBottom: 8,
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 3,
    height: 3,
    backgroundColor: '#FFF',
    marginRight: 6,
    borderRadius: 1.5,
  },
  featureItem: {
    color: '#E0E0E0',
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  distanceText: {
    color: '#888',
    fontSize: 11,
    marginLeft: 4,
    fontFamily: typography.fontFamily.medium,
  },
});
