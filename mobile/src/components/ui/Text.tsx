/**
 * Ágora Design System — Text Component
 *
 * Wrapper tipado sobre React Native Text com tokens
 * do design system pré-configurados.
 * Suporte completo a acessibilidade (accessibilityRole).
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useAccessibility } from '@/contexts/AccessibilityContext';

type TextVariant =
  | 'display'
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

const variantStyles = StyleSheet.create({
  display: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize.display,
    lineHeight: typography.fontSize.display * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  hero: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.hero,
    lineHeight: typography.fontSize.hero * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
  },
  h3: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    lineHeight: typography.fontSize.body * typography.lineHeight.normal,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide,
  },
  overline: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.extraWide,
    textTransform: 'uppercase',
  },
});

export function Text({
  variant = 'body',
  color = colors.textPrimary,
  align = 'left',
  bold,
  style,
  children,
  ...props
}: TextProps) {
  const { fontSizeMultiplier } = useAccessibility();
  const baseStyle = variantStyles[variant] as any;
  const scaledFontSize = baseStyle?.fontSize ? baseStyle.fontSize * fontSizeMultiplier : undefined;
  const scaledLineHeight = baseStyle?.lineHeight ? baseStyle.lineHeight * fontSizeMultiplier : undefined;

  return (
    <RNText
      style={[
        baseStyle,
        scaledFontSize ? { fontSize: scaledFontSize } : undefined,
        scaledLineHeight ? { lineHeight: scaledLineHeight } : undefined,
        { color, textAlign: align },
        bold && { fontFamily: typography.fontFamily.bold },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
