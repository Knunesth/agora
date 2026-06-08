import { GeoCoords } from '@/types';

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface GeocodedAddress {
  name: string;
  coordinate: GeoCoords;
}

export const searchAddress = async (query: string): Promise<GeocodedAddress[]> => {
  if (!query || query.length < 3) return [];

  try {
    // Adicionamos viewbox ou limitamos ao Brasil (countrycodes=br) para melhorar os resultados locais
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'AgoraSafetyApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao buscar endereço');
    }

    const data: NominatimResult[] = await response.json();

    return data.map((item) => ({
      name: item.display_name,
      coordinate: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      },
    }));
  } catch (error) {
    console.error('[Geocoding Error]:', error);
    return [];
  }
};
