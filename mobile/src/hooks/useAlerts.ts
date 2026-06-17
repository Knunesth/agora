/**
 * Ágora — Hook de Alertas (Supabase RPC)
 *
 * Busca alertas no banco de dados baseando-se na coordenada do usuário.
 * Utiliza o RPC `get_alerts_within_radius` para aproveitar a extensão PostGIS.
 * Re-fetch automático a cada 30s para novos relatórios aparecerem logo.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { Alert, GeoCoords } from '@/types';

// Raio padrão de busca: 5km (5000 metros)
const DEFAULT_RADIUS_METERS = 5000;
// Re-fetch automático a cada 30 segundos
const REFETCH_INTERVAL_MS = 30_000;

export function useAlerts(userLocation: GeoCoords | null) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastFetchedLocation = useRef<GeoCoords | null>(null);
  const lastFetchedAt = useRef<number>(0);

  const fetchAlerts = useCallback(async (force = false) => {
    if (!userLocation) return;

    const now = Date.now();
    const timeSinceLast = now - lastFetchedAt.current;

    // Debounce de posição (~100m) E de tempo (30s)
    // Se "force" for true, ignora o debounce (chamado após submeter um alerta)
    if (!force && lastFetchedLocation.current) {
      const latDiff = Math.abs(userLocation.latitude - lastFetchedLocation.current.latitude);
      const lngDiff = Math.abs(userLocation.longitude - lastFetchedLocation.current.longitude);
      const didntMove = latDiff < 0.001 && lngDiff < 0.001;
      const tooSoon = timeSinceLast < REFETCH_INTERVAL_MS;
      if (didntMove && tooSoon) return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.rpc('get_alerts_within_radius', {
        usr_lat: userLocation.latitude,
        usr_lng: userLocation.longitude,
        radius_meters: DEFAULT_RADIUS_METERS,
      });

      if (error) throw error;

      const formattedAlerts: Alert[] = (data || []).map((row: any) => ({
        id: row.id,
        category: row.category,
        description: row.description,
        status: row.status,
        coordinate: {
          latitude: row.latitude,
          longitude: row.longitude,
        },
        confirmations: row.confirmations,
        photoUrl: row.photo_url,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        userId: row.user_id,
        userName: row.user_name,
      }));

      setAlerts(formattedAlerts);
      lastFetchedLocation.current = userLocation;
      lastFetchedAt.current = Date.now();
    } catch (err: any) {
      console.error('[Supabase] Erro ao buscar alertas:', err.message);
      setErrorMsg('Falha ao sincronizar alertas da região.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Busca inicial
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Re-fetch automático a cada 30s
  useEffect(() => {
    const interval = setInterval(() => fetchAlerts(), REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const refetch = useCallback(() => fetchAlerts(true), [fetchAlerts]);

  return { alerts, loading, errorMsg, refetch };
}
