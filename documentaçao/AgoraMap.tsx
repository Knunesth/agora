// mobile/src/components/map/AgoraMap.tsx
// ─────────────────────────────────────────────────────────────
// Componente de mapa do Ágora
// Usa OSM por padrão; troca para Google Maps se a API key estiver no .env
// ─────────────────────────────────────────────────────────────

import React from 'react';
import MapView, { UrlTile, MapViewProps } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import {
  MAP_PROVIDER,
  IS_GOOGLE_MAPS,
  OSM_DARK_TILE_URL,
  GOOGLE_DARK_STYLE,
} from '../../config/mapProvider';

type AgoraMapProps = MapViewProps & {
  children?: React.ReactNode;
};

export function AgoraMap({ children, style, ...props }: AgoraMapProps) {
  return (
    <MapView
      style={[styles.map, style]}
      provider={MAP_PROVIDER}
      // Estilo dark — Google Maps usa customMapStyle, OSM usa UrlTile abaixo
      customMapStyle={IS_GOOGLE_MAPS ? GOOGLE_DARK_STYLE : undefined}
      // Configurações padrão
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterest={false}
      showsBuildings={false}
      showsIndoors={false}
      {...props}
    >
      {/* Tiles escuros do OSM — só renderiza quando Google Maps não está ativo */}
      {!IS_GOOGLE_MAPS && (
        <UrlTile
          urlTemplate={OSM_DARK_TILE_URL}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />
      )}

      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
