// mobile/src/components/map/AgoraMap.tsx
// Componente de mapa do Ágora
// Usa OSM por padrão; troca para Google Maps se a API key estiver no .env

import React, { forwardRef } from 'react';
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

export const AgoraMap = forwardRef<MapView, AgoraMapProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <MapView
        ref={ref}
        style={[styles.map, style]}
        provider={MAP_PROVIDER}
        customMapStyle={IS_GOOGLE_MAPS ? GOOGLE_DARK_STYLE : undefined}
        // Desabilitado: usamos nosso próprio marcador customizado abaixo
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsIndoors={false}
        {...props}
      >
        {}
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
);

AgoraMap.displayName = 'AgoraMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
