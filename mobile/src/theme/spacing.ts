import { Platform } from 'react-native';
/**
 * Ágora Design System — Spacing & Layout Tokens
 *
 * Base 4px grid system para consistência visual.
 * Inclui tokens de border radius e shadow.
 */

export const spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 48px */
  xxxl: 48,
  /** 64px */
  huge: 64,
} as const;

export const borderRadius = {
  /** 4px — Tags, badges pequenos */
  xs: 4,
  /** 8px — Inputs, botões menores */
  sm: 8,
  /** 12px — Cards */
  md: 12,
  /** 16px — Modais, bottom sheets */
  lg: 16,
  /** 24px — Cards de destaque */
  xl: 24,
  /** 9999px — Botões pill, avatars */
  full: 9999,
} as const;

export const shadow = {
  sm: {
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    }),
    elevation: 2,
  },
  md: {
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }),
    elevation: 6,
  },
  lg: {
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
    }),
    elevation: 12,
  },
  glow: (color: string) => ({
    ...(Platform.OS !== 'web' && {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
    }),
    elevation: 8,
  }),
} as const;

export type SpacingToken = keyof typeof spacing;
