import React, { useMemo, useRef, useState, useEffect } from 'react';

export interface CircleProps {
  center?: { latitude: number; longitude: number };
  radius?: number;
  strokeColor?: string;
  fillColor?: string;
}

export const Circle = (props: CircleProps) => {
  const [LeafletCircle, setLeafletCircle] = useState<any>(null);

  useEffect(() => {
    import('react-leaflet').then(rl => setLeafletCircle(() => rl.Circle));
  }, []);

  if (!props.center || !LeafletCircle) return null;

  return (
    <LeafletCircle 
      center={[props.center.latitude, props.center.longitude]} 
      radius={props.radius || 100}
      pathOptions={{ 
        color: props.strokeColor || '#3388ff', 
        fillColor: props.fillColor || '#3388ff',
        fillOpacity: 0.2 
      }}
    />
  );
};

export interface MarkerProps {
  coordinate?: { latitude: number; longitude: number };
  draggable?: boolean;
  onDragEnd?: (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
}

export const Marker = (props: MarkerProps) => {
  const [LeafletMarker, setLeafletMarker] = useState<any>(null);
  const [CustomIcon, setCustomIcon] = useState<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
      setLeafletMarker(() => rl.Marker);
      setCustomIcon(() => L.default ? L.default.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #00E676; width: 20px; height: 20px; border-radius: 10px; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); transform: translate(-10px, -10px);"></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }) : L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #00E676; width: 20px; height: 20px; border-radius: 10px; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); transform: translate(-10px, -10px);"></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }));
    });
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          if (props.onDragEnd) {
            props.onDragEnd({ nativeEvent: { coordinate: { latitude: latLng.lat, longitude: latLng.lng } } });
          }
        }
      },
    }),
    [props.onDragEnd]
  );

  if (!props.coordinate || !LeafletMarker || !CustomIcon) return null;

  return (
    <LeafletMarker 
      position={[props.coordinate.latitude, props.coordinate.longitude]}
      draggable={props.draggable}
      eventHandlers={eventHandlers}
      ref={markerRef}
      icon={CustomIcon}
    />
  );
};
