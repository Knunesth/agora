/**
 * Ágora — Tab Navigator Layout
 *
 * 4 tabs do MVP:
 * 1. Mapa (tela principal - RF-01/RF-02)
 * 2. Alertas (feed de alertas da região)
 * 3. Reportar (RF-03 - registro de ocorrência)
 * 4. Perfil (RF-05 - XP, Trust Score, configurações)
 */

import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarAccessibilityLabel: 'Mapa de riscos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Seu perfil e pontuação',
        }}
      />
    </Tabs>
  );
}
