/**
 * Ágora — Hook de Alertas com Supabase Realtime
 *
 * Estratégia:
 *  1. Fetch inicial via RPC `get_alerts_within_radius` (carrega histórico existente)
 *  2. Canal Realtime `alerts-realtime` ouve INSERT/UPDATE/DELETE na tabela `alerts`
 *     - INSERT: dispara re-fetch completo (a linha Realtime retorna `location` como
 *       WKB opaco — PostGIS não é extraído automaticamente; refetch é mais seguro)
 *     - UPDATE: atualiza o alerta no estado local diretamente (status, confirmations, etc.)
 *       Se status === 'expired' ou 'rejected', remove do estado local
 *     - DELETE: remove do estado local pelo id
 *  3. `lastUpdated` é exportado para a UI exibir "Atualizado agora" / timestamp
 *
 * ⚠️  PRÉ-REQUISITO no Supabase:
 *     A tabela `alerts` deve estar na publicação `supabase_realtime`.
 *     Isso é feito pela migration: 00000000000012_enable_alerts_realtime.sql
 *     Ou manualmente no painel: Database → Replication → Tables → alerts ✓
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { Alert, AlertStatus, GeoCoords, RiskCategory } from '@/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Raio padrão de busca: 5km (5000 metros)
const DEFAULT_RADIUS_METERS = 5000;

// O payload do Realtime reflete a estrutura REAL da tabela (colunas snake_case,
// `location` como texto WKB — não tem lat/lng extraídos pelo PostGIS).
// Por isso o INSERT usa re-fetch, e UPDATE/DELETE operam diretamente no estado.

interface AlertRow {
  id: string;
  category: RiskCategory;
  description: string;
  status: AlertStatus;
  location: string; // geometry WKB — não usamos diretamente
  confirmations: number;
  photo_url: string | null;
  created_at: string;
  expires_at: string;
  user_id: string;
}


export function useAlerts(userLocation: GeoCoords | null) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ref para evitar re-subscrição desnecessária quando userLocation muda poucos metros
  const lastFetchedLocation = useRef<GeoCoords | null>(null);
  // Ref para o canal ativo — necessário para cleanup correto
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  // Guard: impede subscrição dupla ao Realtime quando o efeito remonta
  const isSubscribed = useRef(false);

  const fetchAlerts = useCallback(async (location: GeoCoords, force = false) => {
    // Debounce de posição (~100m): evita re-fetch se o usuário não se moveu
    if (!force && lastFetchedLocation.current) {
      const latDiff = Math.abs(location.latitude - lastFetchedLocation.current.latitude);
      const lngDiff = Math.abs(location.longitude - lastFetchedLocation.current.longitude);
      if (latDiff < 0.001 && lngDiff < 0.001) return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.rpc('get_alerts_within_radius', {
        usr_lat: location.latitude,
        usr_lng: location.longitude,
        radius_meters: DEFAULT_RADIUS_METERS,
      });

      if (error) throw error;

      const formatted: Alert[] = (data ?? []).map((row: {
        id: string;
        category: RiskCategory;
        description: string;
        status: AlertStatus;
        latitude: number;
        longitude: number;
        confirmations: number;
        photo_url: string | null;
        created_at: string;
        expires_at: string;
        user_id: string;
        user_name: string | null;
      }) => ({
        id: row.id,
        category: row.category,
        description: row.description,
        status: row.status,
        coordinate: { latitude: row.latitude, longitude: row.longitude },
        confirmations: row.confirmations,
        photoUrl: row.photo_url ?? undefined,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        userId: row.user_id,
        userName: row.user_name ?? undefined,
      }));

      setAlerts(formatted);
      lastFetchedLocation.current = location;
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useAlerts] Erro ao buscar alertas:', message);
      setErrorMsg('Falha ao sincronizar alertas da região.');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!userLocation) return;

    // Guard: sai imediatamente se o canal já foi criado (evita double-subscribe)
    if (isSubscribed.current) return;
    isSubscribed.current = true;

    // 1. Fetch inicial para carregar alertas existentes
    fetchAlerts(userLocation, true);

    // 2. Subscrição Realtime
    const channel = supabase
      .channel('alerts-realtime')
      .on<AlertRow>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload: RealtimePostgresChangesPayload<AlertRow>) => {
          setLastUpdated(new Date());

          if (payload.eventType === 'INSERT') {
            // O INSERT não tem lat/lng extraídos pelo PostGIS no payload Realtime.
            // Re-fetch completo garante que só alertas dentro do raio apareçam.
            fetchAlerts(userLocation, true);

          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new;
            const removableStatuses: AlertStatus[] = ['expired', 'rejected'];

            setAlerts((prev) => {
              // Se o alerta virou expired/rejected, remove do estado
              if (removableStatuses.includes(updated.status)) {
                return prev.filter((a) => a.id !== updated.id);
              }

              // Se já está no estado, atualiza os campos
              const exists = prev.some((a) => a.id === updated.id);
              if (exists) {
                return prev.map((a) =>
                  a.id === updated.id
                    ? {
                        ...a,
                        status: updated.status,
                        confirmations: updated.confirmations,
                        // photo_url pode ter sido adicionado depois
                        photoUrl: updated.photo_url ?? a.photoUrl,
                      }
                    : a
                );
              }

              // Alerta não estava no estado (ex: acabou de entrar no raio após UPDATE)
              // Re-fetch para garantir dados completos com lat/lng
              fetchAlerts(userLocation, true);
              return prev;
            });

          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setAlerts((prev) => prev.filter((a) => a.id !== deletedId));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useAlerts] Realtime conectado ✓');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useAlerts] Erro no canal Realtime — verifique se a tabela alerts está na publicação supabase_realtime');
        }
      });

    channelRef.current = channel;

    // Cleanup: cancela a subscrição ao desmontar e libera o guard para nova montagem
    return () => {
      isSubscribed.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userLocation, fetchAlerts]);

  // `refetch` exposto para a UI forçar uma atualização manual (ex: após criar alerta)
  const refetch = useCallback(() => {
    if (userLocation) fetchAlerts(userLocation, true);
  }, [userLocation, fetchAlerts]);

  return { alerts, loading, errorMsg, refetch, lastUpdated };
}
