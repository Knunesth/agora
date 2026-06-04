/**
 * Ágora Design System — Color Tokens
 *
 * Paleta extraída da identidade visual oficial (logo verde neon + dark mode).
 * IMPORTANTE: O token `danger` é isolado e dedicado exclusivamente ao SOS.
 * Nenhum componente genérico deve herdar dele.
 */

export const colors = {
  // ═══════════════════════════════════════════
  // PRIMARY (Verde Ágora — Identidade Principal)
  // ═══════════════════════════════════════════
  primary: '#00E676',
  primaryDark: '#00C853',
  primaryLight: '#69F0AE',
  primaryGlow: 'rgba(0, 230, 118, 0.3)',
  primaryMuted: 'rgba(0, 230, 118, 0.12)',

  // ═══════════════════════════════════════════
  // BACKGROUNDS (Dark Mode Nativo)
  // ═══════════════════════════════════════════
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  surfaceBorder: '#2A2A2A',

  // ═══════════════════════════════════════════
  // TEXT
  // ═══════════════════════════════════════════
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textInverse: '#0A0A0A',

  // ═══════════════════════════════════════════
  // DANGER (SOS) — COMPLETAMENTE ISOLADO
  // Não herda de nenhum outro token.
  // Usado EXCLUSIVAMENTE pelo SOSButton e
  // componentes de emergência.
  // ═══════════════════════════════════════════
  danger: '#FF1744',
  dangerDark: '#D50000',
  dangerLight: '#FF5252',
  dangerGlow: 'rgba(255, 23, 68, 0.35)',
  dangerMuted: 'rgba(255, 23, 68, 0.12)',

  // ═══════════════════════════════════════════
  // STATUS (Alertas, Validação, Info)
  // ═══════════════════════════════════════════
  warning: '#FFD600',
  warningDark: '#F9A825',
  warningMuted: 'rgba(255, 214, 0, 0.12)',
  info: '#448AFF',
  infoDark: '#2962FF',
  infoMuted: 'rgba(68, 138, 255, 0.12)',
  success: '#00E676', // Intencional: mesma cor que primary

  // ═══════════════════════════════════════════
  // MAPA (Overlay e Clusters de Risco)
  // ═══════════════════════════════════════════
  mapOverlay: 'rgba(0, 0, 0, 0.6)',
  mapClusterHot: '#FF1744',    // Alta densidade de alertas
  mapClusterWarm: '#FFD600',   // Média densidade
  mapClusterCool: '#00E676',   // Baixa densidade / seguro

  // ═══════════════════════════════════════════
  // GAMIFICAÇÃO
  // ═══════════════════════════════════════════
  xpGold: '#FFD700',
  trustHigh: '#00E676',
  trustMedium: '#FFD600',
  trustLow: '#FF1744',
} as const;

export type ColorToken = keyof typeof colors;
