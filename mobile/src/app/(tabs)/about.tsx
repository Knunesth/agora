/**
 * Ágora — Tela Sobre o Ágora
 *
 * Apresenta informações sobre o aplicativo, sua missão,
 * versão e os créditos da equipe.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Shield,
  MapPin,
  Users,
  Bell,
  Heart,
  ExternalLink,
  Code2,
  Star,
} from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';


const APP_VERSION = '1.0.0';
const APP_BUILD   = '2025.1';

const FEATURES = [
  {
    icon: MapPin,
    color: colors.primary,
    bg: colors.primaryMuted,
    title: 'Alertas em Tempo Real',
    description: 'Visualize e reporte situações de risco na sua região com geolocalização precisa.',
  },
  {
    icon: Users,
    color: colors.info,
    bg: colors.infoMuted,
    title: 'Rede de Confiança',
    description: 'Conecte-se com vizinhos verificados e forme uma rede comunitária de segurança.',
  },
  {
    icon: Bell,
    color: colors.warning,
    bg: colors.warningMuted,
    title: 'Sistema de Votação',
    description: 'Alertas são validados pela comunidade, garantindo informações confiáveis.',
  },
  {
    icon: Shield,
    color: colors.danger,
    bg: colors.dangerMuted,
    title: 'Botão SOS',
    description: 'Em situações de emergência, acione ajuda e notifique seus contatos de confiança.',
  },
];

const TEAM = [
  { name: 'Kauã Thierry',  role: 'Desenvolvedor Mobile' },
  { name: 'Cesar',          role: 'Desenvolvedor Mobile' },
];

const LINKS = [
  {
    id: 'github',
    icon: Code2,
    label: 'Repositório no GitHub',
    url: 'https://github.com',
  },
  {
    id: 'privacy',
    icon: Shield,
    label: 'Política de Privacidade',
    url: 'https://agora.app/privacidade',
  },
  {
    id: 'terms',
    icon: ExternalLink,
    label: 'Termos de Uso',
    url: 'https://agora.app/termos',
  },
];


export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Sobre o Ágora</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {}
        <View style={styles.heroCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo-transparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroAppName}>Ágora</Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.heroTagline}>
            Segurança comunitária colaborativa
          </Text>

          {}
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>v{APP_VERSION}</Text>
            </View>
            <View style={styles.buildBadge}>
              <Text style={styles.buildBadgeText}>Build {APP_BUILD}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
            NOSSA MISSÃO
          </Text>
          <View style={styles.missionCard}>
            <Text variant="body" color={colors.textSecondary} style={styles.missionText}>
              O Ágora nasce do desejo de transformar comunidades em redes ativas de segurança.
              Acreditamos que, quando cidadãos se conectam e compartilham informações em tempo real,
              criam-se vizinhanças mais seguras, resilientes e solidárias.
            </Text>
            <View style={styles.missionDivider} />
            <View style={styles.missionStat}>
              <Heart color={colors.primary} size={16} />
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: spacing.sm }}>
                Feito com propósito, para a comunidade.
              </Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
            PRINCIPAIS FUNCIONALIDADES
          </Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feat, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconBox, { backgroundColor: feat.bg }]}>
                  <feat.icon color={feat.color} size={20} />
                </View>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text variant="caption" color={colors.textMuted} style={styles.featureDesc}>
                  {feat.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
            EQUIPE
          </Text>
          <View style={styles.teamCard}>
            {TEAM.map((member, index) => (
              <React.Fragment key={member.name}>
                <View style={styles.teamRow}>
                  <View style={styles.teamAvatar}>
                    <Text style={styles.teamInitials}>
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text variant="body" style={styles.teamName}>{member.name}</Text>
                    <Text variant="caption" color={colors.textMuted}>{member.role}</Text>
                  </View>
                </View>
                {index < TEAM.length - 1 && <View style={styles.teamDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
            LINKS
          </Text>
          <View style={styles.linksCard}>
            {LINKS.map((link, index) => (
              <React.Fragment key={link.id}>
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => Linking.openURL(link.url)}
                >
                  <link.icon color={colors.textSecondary} size={18} />
                  <Text variant="body" style={styles.linkLabel}>{link.label}</Text>
                  <ExternalLink color={colors.textMuted} size={14} />
                </TouchableOpacity>
                {index < LINKS.length - 1 && <View style={styles.teamDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {}
        <View style={styles.footer}>
          <View style={styles.footerStars}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} color={colors.primary} size={14} fill={colors.primary} />
            ))}
          </View>
          <Text variant="caption" color={colors.textMuted} style={styles.footerText}>
            © {new Date().getFullYear()} Ágora. Todos os direitos reservados.
          </Text>
          <Text variant="caption" color={colors.textMuted} style={styles.footerSubText}>
            Construído com React Native • Expo • Supabase
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


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

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Hero
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryMuted,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  heroAppName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  heroTagline: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  versionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  versionBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  versionBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buildBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  buildBadgeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Seção genérica
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },

  // Missão
  missionCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
  },
  missionText: {
    lineHeight: 22,
  },
  missionDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.md,
  },
  missionStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Funcionalidades
  featuresGrid: {
    gap: spacing.sm,
  },
  featureCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    lineHeight: 18,
  },

  // Equipe
  teamCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  teamDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: spacing.lg,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: colors.primary + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInitials: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  teamName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Links
  linksCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  linkLabel: {
    flex: 1,
    color: colors.textPrimary,
  },

  // Rodapé
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  footerStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
  },
  footerText: {
    textAlign: 'center',
  },
  footerSubText: {
    textAlign: 'center',
    fontSize: 11,
  },
});
