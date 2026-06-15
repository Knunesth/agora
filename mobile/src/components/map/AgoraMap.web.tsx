import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

export function AgoraMap({ children, style, initialRegion, onPress }: any) {
  const [MapModule, setMapModule] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([rl]) => {
      setMapModule({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        useMapEvents: rl.useMapEvents
      });
    }).catch(console.error);
  }, []);

  const center = initialRegion 
    ? [initialRegion.latitude, initialRegion.longitude] 
    : [-15.7801, -47.9292];

  if (!MapModule) {
    return (
      <View style={[styles.map, style, styles.center]}>
        <Text style={{ color: '#fff' }}>Carregando mapa interativo...</Text>
      </View>
    );
  }

  const { MapContainer, TileLayer, useMapEvents } = MapModule;

  function MapEventsHandler() {
    useMapEvents({
      click(e: any) {
        if (onPress) {
          onPress({ nativeEvent: { coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } } });
        }
      },
    });
    return null;
  }

  return (
    <View style={[styles.map, style]}>
      <MapContainer 
        center={center} 
        zoom={16} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler />
        {children}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: '#141414' },
  center: { justifyContent: 'center', alignItems: 'center' }
});
