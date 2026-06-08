import { GeoCoords } from '@/types';
import { RiskZone, haversineDistance } from './riskZones';

export type TransportMode = 'foot' | 'bike' | 'car';

export interface RouteInfo {
  coordinates: GeoCoords[];
  distanceMeters: number;
  durationSeconds: number;
  riskScore: number;
  dangerZonesAvoided: number;
  isAlternative: boolean;
}

/**
 * Busca rotas no OSRM e avalia a segurança delas com base nas zonas de perigo.
 */
export async function getSafeRoutes(
  origin: GeoCoords,
  destination: GeoCoords,
  mode: TransportMode,
  zones: RiskZone[]
): Promise<RouteInfo[]> {
  try {
    // OSRM espera {longitude},{latitude}
    const coordsStr = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${mode}/${coordsStr}?alternatives=true&geometries=geojson&overview=full`
    );

    if (!response.ok) {
      throw new Error('Serviço de roteamento (OSRM) indisponível no momento.');
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('Nenhuma rota encontrada.');
    }

    // Processar e pontuar as rotas
    const processedRoutes: RouteInfo[] = data.routes.map((route: any, index: number) => {
      // GeoJSON LineString coordinates: [longitude, latitude][]
      const coords: GeoCoords[] = route.geometry.coordinates.map((c: number[]) => ({
        longitude: c[0],
        latitude: c[1],
      }));

      // Calcular o score de risco dessa rota específica
      const { score, zonesIntercepted } = calculateRouteRiskScore(coords, zones);

      return {
        coordinates: coords,
        distanceMeters: route.distance,
        durationSeconds: route.duration,
        riskScore: score,
        dangerZonesAvoided: 0, // Vamos preencher isso depois comparando com a pior rota
        isAlternative: index !== 0,
      };
    });

    // Encontrar a pior rota para calcular quantas zonas a melhor rota evitou
    const worstScore = Math.max(...processedRoutes.map(r => r.riskScore));

    processedRoutes.forEach(r => {
      r.dangerZonesAvoided = worstScore - r.riskScore;
    });

    // Ordenar: Primeiro pela menor pontuação de risco. Se empatar, pela menor distância.
    processedRoutes.sort((a, b) => {
      if (a.riskScore !== b.riskScore) {
        return a.riskScore - b.riskScore;
      }
      return a.distanceMeters - b.distanceMeters;
    });

    // O primeiro agora é o mais seguro
    processedRoutes[0].isAlternative = false;
    for (let i = 1; i < processedRoutes.length; i++) {
      processedRoutes[i].isAlternative = true;
    }

    return processedRoutes;
  } catch (error) {
    console.error('[Routing Error]:', error);
    throw error;
  }
}

/**
 * Calcula a pontuação de risco de uma rota. 
 * Quanto maior a pontuação, mais perigosa a rota.
 * Para cada ponto da rota, verifica se está dentro de alguma zona de perigo.
 */
function calculateRouteRiskScore(routeCoords: GeoCoords[], zones: RiskZone[]): { score: number; zonesIntercepted: number } {
  let score = 0;
  
  // Set para não contar a mesma zona duas vezes se a rota passar por vários pontos dentro dela
  const interceptedZones = new Set<RiskZone>();

  // Para performance, testamos pulando alguns pontos se a rota for gigante
  // OSRM full overview tem muitos pontos. Analisar 1 a cada 5 pontos já dá uma ótima precisão para zonas de 150m+
  const step = Math.max(1, Math.floor(routeCoords.length / 100));

  for (let i = 0; i < routeCoords.length; i += step) {
    const point = routeCoords[i];

    for (const zone of zones) {
      if (interceptedZones.has(zone)) continue;

      const dist = haversineDistance(point, zone.coordinate);
      if (dist <= zone.radiusMeters) {
        interceptedZones.add(zone);
        // Penalidade maior para áreas de ALTO risco
        score += zone.level === 'HIGH' ? 3 : 1;
      }
    }
  }

  return { score, zonesIntercepted: interceptedZones.size };
}
