/**
 * Ágora — Hook de Alertas (Supabase RPC)
 *
 * Busca alertas no banco de dados baseando-se na coordenada do usuário.
 * Utiliza o RPC `get_alerts_within_radius` para aproveitar a extensão PostGIS.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { Alert, GeoCoords } from '@/types';

// Raio padrão de busca: 5km (5000 metros)
const DEFAULT_RADIUS_METERS = 5000;

export function useAlerts(userLocation: GeoCoords | null) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      // Chamar a Stored Procedure (RPC) com PostGIS
      const { data, error } = await supabase.rpc('get_alerts_within_radius', {
        usr_lat: userLocation.latitude,
        usr_lng: userLocation.longitude,
        radius_meters: DEFAULT_RADIUS_METERS,
      });

      if (error) throw error;

      // Mapear o retorno do banco para o schema TypeScript local
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
      }));

      setAlerts(formattedAlerts);
    } catch (err: any) {
      console.error('[Supabase] Erro ao buscar alertas:', err.message);
      setErrorMsg('Falha ao sincronizar alertas da região.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchAlerts();
    
    // TODO Sprint 3/4: Implementar realtime subscription do Supabase
    // para atualizar markers conforme confirmações/votos acontecem na hora.
  }, [fetchAlerts]);

  return { alerts, loading, errorMsg, refetch: fetchAlerts };
}
