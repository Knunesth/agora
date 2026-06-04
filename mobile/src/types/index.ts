/**
 * Ágora — Global Type Definitions
 */

/** Status de um alerta no sistema */
export type AlertStatus = 'pending' | 'verified' | 'expired' | 'rejected';

/** Categorias de risco para denúncias (RF-03) */
export type RiskCategory =
  | 'furto'
  | 'iluminacao'
  | 'infraestrutura'
  | 'assedio'
  | 'suspeito'
  | 'outro'
  | 'sos';

/** Modelo de um alerta */
export interface Alert {
  id: string;
  category: RiskCategory;
  description: string;
  status: AlertStatus;
  coordinate: GeoCoords;
  confirmations: number;
  createdAt: string;
  expiresAt: string;
  photoUrl?: string;
  userId: string;
}

/** Modelo do perfil do usuário */
export interface UserProfile {
  id: string;
  displayName: string;
  xp: number;
  trustScore: number; // 0-100
  level: number;
  totalReports: number;
  totalImpact: number;
  createdAt: string;
}

/** Coordenadas geográficas */
export interface GeoCoords {
  latitude: number;
  longitude: number;
}
