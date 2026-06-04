/**
 * Ágora Design System — Card Component
 *
 * Card com fundo surface, border radius e sombra sutil.
 * Base para AlertCard, ProfileCard, etc.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius, spacing, shadow } from '@/theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  style,
  accessibilityLabel,
}: CardProps) {
  const cardStyle = [
    styles.base,
    variantStyles[variant],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});

const variantStyles: Record<string, ViewStyle> = {
  default: {
    backgroundColor: colors.surface,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadow.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
};
