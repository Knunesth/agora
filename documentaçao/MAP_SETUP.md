# Sistema de Mapa Dual Provider — Ágora

## Como funciona

O Ágora detecta automaticamente qual provedor usar baseado no `.env`:

| Situação                          | Provedor       | Tema escuro        |
|-----------------------------------|----------------|--------------------|
| Sem API key (padrão)              | OpenStreetMap  | Stadia Maps Dark   |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps    | Custom JSON style  |

---

## Arquivos criados

```
mobile/src/
├── config/
│   └── mapProvider.ts       ← lógica de detecção + estilos
└── components/
    └── map/
        └── AgoraMap.tsx     ← componente pronto para usar
```

---

## Como usar na tela do mapa (RF-01)

```tsx
// mobile/app/(tabs)/index.tsx
import { AgoraMap } from '../../src/components/map/AgoraMap';
import { Marker } from 'react-native-maps';

export default function MapScreen() {
  return (
    <AgoraMap
      initialRegion={{
        latitude: -15.7801,
        longitude: -47.9292,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* Markers de alertas vão aqui (RF-01) */}
      <Marker coordinate={{ latitude: -15.7801, longitude: -47.9292 }} />
    </AgoraMap>
  );
}
```

---

## Para ativar Google Maps (quando quiser)

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Ative **Maps SDK for Android** e **Maps SDK for iOS**
3. Crie uma chave de API
4. Adicione no `.env`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

5. No `app.config.js`, certifique-se de que a key está referenciada:

```js
android: {
  config: {
    googleMaps: {
      apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
},
```

Nenhuma alteração de código necessária — o `AgoraMap` detecta automaticamente.

---

## Limites do tier gratuito do OSM (Stadia Maps)

- 200.000 requisições de tile/mês no plano gratuito
- Suficiente para desenvolvimento e MVP em produção com escala pequena
- Upgrade disponível em [stadiamaps.com](https://stadiamaps.com) se necessário
