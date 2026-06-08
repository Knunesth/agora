import { Alert, GeoCoords } from '@/types';

export type RiskLevel = 'HIGH' | 'MEDIUM';

export interface RiskZone {
  coordinate: GeoCoords;
  radiusMeters: number;
  level: RiskLevel;
}

/**
 * Calcula a distância em metros entre dois pontos geográficos (Fórmula de Haversine).
 */
export function haversineDistance(coords1: GeoCoords, coords2: GeoCoords): number {
  const R = 6371e3; // Raio da Terra em metros
  const rad = Math.PI / 180;
  
  const lat1 = coords1.latitude * rad;
  const lat2 = coords2.latitude * rad;
  const deltaLat = (coords2.latitude - coords1.latitude) * rad;
  const deltaLon = (coords2.longitude - coords1.longitude) * rad;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Transforma alertas do banco em Zonas de Perigo circulares baseadas na gravidade.
 */
export function buildRiskZones(alerts: Alert[]): RiskZone[] {
  const zones: RiskZone[] = [];

  for (const alert of alerts) {
    if (alert.status !== 'verified' && alert.category !== 'sos') continue;

    let level: RiskLevel = 'MEDIUM';
    let radiusMeters = 150; // Padrão MÉDIO = 150m

    // Regra acordada para ALTO: SOS, furto, assédio ou > 5 confirmações
    if (
      alert.category === 'sos' ||
      alert.category === 'furto' ||
      alert.category === 'assedio' ||
      alert.confirmations > 5
    ) {
      level = 'HIGH';
      radiusMeters = 300;
    }

    zones.push({
      coordinate: alert.coordinate,
      radiusMeters,
      level,
    });
  }

  return zones;
}
