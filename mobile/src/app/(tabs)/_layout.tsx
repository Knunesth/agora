/**
 * Ágora — Tab Navigator Layout (Sprint 9 — Custom Tab Bar com SOS)
 */

import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index"   options={{ title: 'Início' }} />
      <Tabs.Screen name="map"     options={{ title: 'Mapa' }} />
      <Tabs.Screen name="alerts"  options={{ title: 'Alertas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="partners" options={{ href: null, title: 'Lojas parceiras' }} />
    </Tabs>
  );
}
