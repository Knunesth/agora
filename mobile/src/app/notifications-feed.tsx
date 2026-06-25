/**
 * Ágora — Feed de Notificações
 *
 * Exibe notificações recebidas enquanto o app estava ativo (foreground)
 * e notificações ainda presentes na bandeja do sistema.
 *
 * Tipos mapeados:
 *   sos    → ícone vermelho 🚨
 *   alert  → ícone amarelo ⚠️
 *   (outro) → ícone padrão 🔔
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, BellRing, ShieldAlert, AlertTriangle, Bell } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';


interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'sos' | 'alert' | 'other';
  receivedAt: Date;
}

function toNotificationItem(n: Notifications.Notification): NotificationItem {
  const content = n.request.content;
  const data = content.data as Record<string, unknown> | null;
  const rawType = typeof data?.type === 'string' ? data.type : 'other';
  const type: NotificationItem['type'] =
    rawType === 'sos' ? 'sos' : rawType === 'alert' ? 'alert' : 'other';

  return {
    id: n.request.identifier,
    title: content.title ?? 'Notificação',
    body: content.body ?? '',
    type,
    receivedAt: new Date(n.date),
  };
}


function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  if (type === 'sos') return <ShieldAlert color={colors.danger} size={22} />;
  if (type === 'alert') return <AlertTriangle color={colors.warning} size={22} />;
  return <Bell color={colors.primary} size={22} />;
}


function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  return date.toLocaleDateString('pt-BR');
}


export default function NotificationsFeedScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  // Carrega notificações presentes na bandeja ao montar
  useEffect(() => {
    async function loadPresented() {
      try {
        const presented = await Notifications.getPresentedNotificationsAsync();
        const mapped = presented.map(toNotificationItem).sort(
          (a, b) => b.receivedAt.getTime() - a.receivedAt.getTime()
        );
        setItems(mapped);
      } catch {
        // Silencia erros — pode falhar em Expo Go
      } finally {
        setLoading(false);
      }
    }

    loadPresented();

    // Listener em tempo real para notificações recebidas enquanto a tela está aberta
    listenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
      const item = toNotificationItem(notification);
      setItems((prev) => [item, ...prev]);
    });

    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        
        <ScrollView contentContainerStyle={[styles.content, styles.center]}>
          <View style={styles.iconBox}>
            <BellRing color={colors.textMuted} size={48} />
          </View>
          <Text variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
            Tudo tranquilo por aqui!
          </Text>
          <Text variant="body" align="center" color={colors.textSecondary}>
            Você ainda não tem novas notificações. Quando houver algum alerta
            importante ou atualização na sua rede, avisaremos você.
          </Text>
        </ScrollView>
      ) : (
        
        <ScrollView contentContainerStyle={styles.content}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                item.type === 'sos' && styles.cardSos,
                item.type === 'alert' && styles.cardAlert,
              ]}
            >
              <View style={styles.cardIcon}>
                <NotificationIcon type={item.type} />
              </View>
              <View style={styles.cardBody}>
                <Text
                  variant="body"
                  style={[
                    styles.cardTitle,
                    item.type === 'sos' && { color: colors.danger },
                    item.type === 'alert' && { color: colors.warning },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!!item.body && (
                  <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
                    {item.body}
                  </Text>
                )}
              </View>
              <Text variant="caption" color={colors.textMuted} style={styles.cardTime}>
                {timeAgo(item.receivedAt)}
              </Text>
            </View>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  cardSos: {
    borderColor: colors.danger + '40',
    backgroundColor: colors.dangerMuted,
  },
  cardAlert: {
    borderColor: colors.warning + '40',
    backgroundColor: 'rgba(255, 214, 0, 0.06)',
  },
  cardIcon: {
    paddingTop: 2,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardTime: {
    paddingTop: 2,
    minWidth: 52,
    textAlign: 'right',
  },
});
