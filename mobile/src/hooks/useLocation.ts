/**
 * Ágora — Hook de Geolocalização
 *
 * Gerencia permissões e provê a localização atual do usuário
 * para inicializar o mapa.
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { GeoCoords } from '@/types';

// Fallback para o centro de Brasília (caso negue localização ou demore muito)
export const DEFAULT_LOCATION: GeoCoords = {
  latitude: -15.7801,
  longitude: -47.9292,
};

export function useLocation() {
  const [location, setLocation] = useState<GeoCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function requestLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permissão de localização negada');
          setLocation(DEFAULT_LOCATION);
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (err) {
        setErrorMsg('Falha ao obter localização');
        setLocation(DEFAULT_LOCATION);
      } finally {
        setLoading(false);
      }
    }

    requestLocation();
  }, []);

  return { location, errorMsg, loading };
}
