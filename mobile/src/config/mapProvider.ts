// mobile/src/config/mapProvider.ts
// ─────────────────────────────────────────────────────────────
// Provedor de mapas do Ágora
//
// Padrão: OpenStreetMap (gratuito, sem cartão)
// Upgrade: Adicione EXPO_PUBLIC_GOOGLE_MAPS_API_KEY no .env
//          para ativar o Google Maps automaticamente.
// ─────────────────────────────────────────────────────────────

import { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const MAP_PROVIDER = GOOGLE_API_KEY ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
export const IS_GOOGLE_MAPS = !!GOOGLE_API_KEY;

// Tiles do OpenStreetMap com tema escuro (Stadia Maps — gratuito até 200k req/mês)
// Substitui o fundo padrão claro do OSM por um tema dark compatível com o design system
export const OSM_DARK_TILE_URL =
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png';

// Estilo dark do Google Maps (aplicado quando PROVIDER_GOOGLE está ativo)
// Baseado na paleta do Ágora: fundo #0A0A0A, estradas em cinza escuro, POIs suprimidos
export const GOOGLE_DARK_STYLE = [
  { elementType: 'geometry',        stylers: [{ color: '#1A1A1A' }] },
  { elementType: 'labels.text.fill',stylers: [{ color: '#A0A0A0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0A0A' }] },
  { featureType: 'road',            elementType: 'geometry', stylers: [{ color: '#2E2E2E' }] },
  { featureType: 'road.arterial',   elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'road.highway',    elementType: 'geometry', stylers: [{ color: '#3A3A3A' }] },
  { featureType: 'water',           elementType: 'geometry', stylers: [{ color: '#0D1117' }] },
  { featureType: 'poi',             stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',         stylers: [{ visibility: 'off' }] },
];
