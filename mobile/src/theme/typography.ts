/**
 * Ágora Design System — Typography Tokens
 *
 * Fonte principal: Inter (Google Fonts)
 * Escolhida por legibilidade em mobile, suporte a acessibilidade (WCAG 2.1 AA)
 * e ampla cobertura de pesos.
 */

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    body: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34,
    display: 42,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    extraWide: 1.5,
  },
} as const;

export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
