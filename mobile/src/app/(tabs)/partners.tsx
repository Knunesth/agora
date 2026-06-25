import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Image,
  Modal, Dimensions} from 'react-native';
import { Text } from '@/components/ui';
import { useRouter } from 'expo-router';
import {
  ChevronLeft, Shield, MapPin, Phone, Clock,
  Star, Tag, X, CheckCircle} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/theme/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Product { name: string; price: string; tag: string; }
interface Store {
  id: number;
  name: string;
  category: string;
  description: string;
  features: string[];
  products: Product[];
  distance: string;
  rating: number;
  phone: string;
  hours: string;
  image: string;
  accent: string;
}

const STORES: Store[] = [
  {
    id: 1,
    name: 'Safety Trab',
    category: 'Equipamentos de Proteção',
    description: 'Especialistas em EPIs e soluções completas de proteção para ambientes de trabalho. Atendemos empresas e pessoas físicas com os melhores equipamentos do mercado.',
    features: ['Equipamentos de Proteção Individual', 'Calçados e uniformes', 'Sinalização de segurança', 'Treinamentos NR'],
    products: [
      { name: 'Capacete de Segurança', price: 'R$ 45,00', tag: 'Mais vendido' },
      { name: 'Colete Refletivo', price: 'R$ 28,00', tag: '' },
      { name: 'Bota de Segurança CA', price: 'R$ 189,00', tag: 'Destaque' },
      { name: 'Óculos de Proteção', price: 'R$ 12,90', tag: '' },
    ],
    distance: '780 m',
    rating: 4.8,
    phone: '(61) 3344-5566',
    hours: 'Seg–Sex: 8h–18h | Sáb: 8h–13h',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800',
    accent: '#00E676',
  },
  {
    id: 2,
    name: 'Alta Segurança',
    category: 'Câmeras e Alarmes',
    description: 'Líder em soluções de segurança eletrônica para residências e comércios. Instalação profissional com garantia e monitoramento 24h.',
    features: ['Câmeras de Monitoramento', 'Alarmes Residenciais', 'Alarmes Comerciais', 'Cercas Elétricas'],
    products: [
      { name: 'Kit 4 Câmeras HD', price: 'R$ 799,00', tag: 'Mais vendido' },
      { name: 'Alarme Residencial', price: 'R$ 349,00', tag: '' },
      { name: 'Câmera Dome IP', price: 'R$ 249,00', tag: 'Destaque' },
      { name: 'DVR 8 Canais', price: 'R$ 420,00', tag: '' },
    ],
    distance: '1,6 km',
    rating: 4.6,
    phone: '(61) 3211-7788',
    hours: 'Seg–Sex: 9h–18h | Sáb: 9h–14h',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
    accent: '#448AFF',
  },
  {
    id: 3,
    name: 'Vigora Segurança',
    category: 'Tecnologia e Proteção',
    description: 'Soluções integradas de segurança com tecnologia de ponta. Desde consultoria até instalação e suporte técnico especializado para sua tranquilidade.',
    features: ['Soluções de Segurança', 'Instalação Profissional', 'Suporte Técnico 24h', 'Manutenção preventiva'],
    products: [
      { name: 'Sistema de Controle de Acesso', price: 'R$ 1.200,00', tag: 'Destaque' },
      { name: 'Interfone HD', price: 'R$ 380,00', tag: '' },
      { name: 'Fechadura Biométrica', price: 'R$ 490,00', tag: 'Mais vendido' },
      { name: 'Cancela Automática', price: 'R$ 2.100,00', tag: '' },
    ],
    distance: '2,5 km',
    rating: 4.9,
    phone: '(61) 3388-9900',
    hours: 'Seg–Sex: 8h–19h | Sáb: 9h–15h',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    accent: '#FFD600',
  },
];

export default function PartnersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft color="#FFF" size={22} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Lojas Parceiras</Text>
          <View style={{ width: 40 }} />
        </View>

        {}
        <LinearGradient
          colors={['#0D3320', '#071A10']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroBadge}>
            <Shield color="#00E676" size={14} />
            <Text style={styles.heroBadgeText}>PONTOS SEGUROS VERIFICADOS</Text>
          </View>
          <Text style={styles.heroTitle}>Lojas de{'\n'}confiança perto{'\n'}de você</Text>
          <Text style={styles.heroSubtitle}>Estabelecimentos parceiros que garantem sua segurança e bem-estar.</Text>
        </LinearGradient>

        {}
        <Text style={styles.sectionTitle}>Próximas a você</Text>

        {STORES.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.card}
            onPress={() => setSelectedStore(store)}
            activeOpacity={0.85}
          >
            {}
            <View style={styles.cardImageWrapper}>
              <Image source={{ uri: store.image }} style={styles.cardImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.cardImageOverlay}
              />
              <View style={styles.cardImageBadge}>
                <MapPin size={11} color="#FFF" />
                <Text style={styles.cardImageBadgeText}>{store.distance}</Text>
              </View>
            </View>

            {}
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{store.name}</Text>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{store.category}</Text>
                  </View>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#FFD600" fill="#FFD600" />
                  <Text style={styles.ratingText}>{store.rating}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc} numberOfLines={2}>{store.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardHours}>
                  <Clock size={11} color="#888" /> {store.hours.split('|')[0]}
                </Text>
                <View style={[styles.verifiedBadge, { borderColor: '#448AFF' }]}>
                  <CheckCircle size={11} color="#448AFF" />
                  <Text style={[styles.verifiedText, { color: '#448AFF' }]}>Verificado</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {}
      <Modal
        visible={!!selectedStore}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStore(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setSelectedStore(null)} />
          {selectedStore && (
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {}
              <View style={styles.sheetHandle} />

              {}
              <TouchableOpacity style={styles.sheetClose} onPress={() => setSelectedStore(null)}>
                <X color="#888" size={20} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                {}
                <View style={styles.sheetHeroWrapper}>
                  <Image source={{ uri: selectedStore.image }} style={styles.sheetHeroImage} />
                  <LinearGradient colors={['transparent', 'rgba(18,18,18,0.95)']} style={styles.sheetHeroGrad} />
                  <View style={styles.sheetHeroContent}>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#FFD600" fill="#FFD600" />
                      <Text style={styles.ratingText}>{selectedStore.rating}</Text>
                    </View>
                    <Text style={styles.sheetName}>{selectedStore.name}</Text>
                    <Text style={styles.sheetCategory}>{selectedStore.category}</Text>
                  </View>
                </View>

                <View style={styles.sheetBody}>
                  {}
                  <Text style={styles.sheetDesc}>{selectedStore.description}</Text>

                  {}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MapPin size={16} color="#00E676" />
                      <Text style={styles.infoText}>{selectedStore.distance}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Phone size={16} color="#448AFF" />
                      <Text style={styles.infoText}>{selectedStore.phone}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Clock size={16} color="#FFD600" />
                    <Text style={styles.infoText}>{selectedStore.hours}</Text>
                  </View>

                  {}
                  <Text style={styles.sheetSectionTitle}>Serviços oferecidos</Text>
                  <View style={styles.featuresGrid}>
                    {selectedStore.features.map((f) => (
                      <View key={f} style={[styles.featureChip, { borderColor: '#448AFF44' }]}>
                        <CheckCircle size={13} color="#448AFF" />
                        <Text style={styles.featureChipText}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  {}
                  <Text style={styles.sheetSectionTitle}>Produtos em destaque</Text>
                  {selectedStore.products.map((p) => (
                    <View key={p.name} style={styles.productRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{p.name}</Text>
                        {p.tag ? (
                          <View style={styles.productTagBadge}>
                            <Tag size={10} color="#FFD600" />
                            <Text style={styles.productTagText}>{p.tag}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.productPrice, { color: '#448AFF' }]}>{p.price}</Text>
                    </View>
                  ))}

                  <View style={{ height: 16 }} />
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { color: '#FFF', fontSize: 17, fontFamily: typography.fontFamily.bold },

  // Hero
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 28 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  heroBadgeText: { color: '#00E676', fontSize: 11, fontFamily: typography.fontFamily.bold, letterSpacing: 0.8 },
  heroTitle: { color: '#FFF', fontSize: 30, fontFamily: typography.fontFamily.extraBold, lineHeight: 36, marginBottom: 12 },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: typography.fontFamily.medium, lineHeight: 20 },

  // Section
  sectionTitle: { color: '#888', fontSize: 12, fontFamily: typography.fontFamily.bold, letterSpacing: 0.8, marginBottom: 14, textTransform: 'uppercase' },

  // Card
  card: { backgroundColor: '#1A1A1A', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardImageWrapper: { height: 160, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  cardImageBadge: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  cardImageBadgeText: { color: '#FFF', fontSize: 11, fontFamily: typography.fontFamily.semiBold },
  cardBody: { padding: 16 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardName: { color: '#FFF', fontSize: 18, fontFamily: typography.fontFamily.bold, marginBottom: 4 },
  categoryPill: { backgroundColor: '#2A2A2A', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  categoryPillText: { color: '#AAA', fontSize: 11, fontFamily: typography.fontFamily.medium },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,214,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ratingText: { color: '#FFD600', fontSize: 12, fontFamily: typography.fontFamily.bold },
  cardDesc: { color: '#888', fontSize: 13, fontFamily: typography.fontFamily.regular, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHours: { color: '#666', fontSize: 11, fontFamily: typography.fontFamily.medium },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 11, fontFamily: typography.fontFamily.semiBold },

  // Modal
  modalOverlay: { flex: 1 },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: { backgroundColor: '#121212', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: SCREEN_HEIGHT * 0.88, overflow: 'hidden' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  sheetClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  // Sheet content
  sheetHeroWrapper: { height: 200, position: 'relative' },
  sheetHeroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  sheetHeroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  sheetHeroContent: { position: 'absolute', bottom: 16, left: 20 },
  sheetName: { color: '#FFF', fontSize: 24, fontFamily: typography.fontFamily.extraBold },
  sheetCategory: { color: '#AAA', fontSize: 13, fontFamily: typography.fontFamily.medium, marginTop: 2 },

  sheetBody: { paddingHorizontal: 20, paddingTop: 20 },
  sheetDesc: { color: '#BBBBBB', fontSize: 14, fontFamily: typography.fontFamily.regular, lineHeight: 22, marginBottom: 20 },

  infoRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  infoText: { color: '#CCC', fontSize: 13, fontFamily: typography.fontFamily.medium },

  sheetSectionTitle: { color: '#FFF', fontSize: 15, fontFamily: typography.fontFamily.bold, marginTop: 20, marginBottom: 12 },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1A1A1A' },
  featureChipText: { color: '#CCC', fontSize: 12, fontFamily: typography.fontFamily.medium },

  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  productName: { color: '#EEE', fontSize: 14, fontFamily: typography.fontFamily.medium, marginBottom: 4 },
  productTagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productTagText: { color: '#FFD600', fontSize: 11, fontFamily: typography.fontFamily.medium },
  productPrice: { fontSize: 15, fontFamily: typography.fontFamily.bold },
});
