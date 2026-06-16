/**
 * Ágora Design System — Input Component
 * 
 * Componente customizado de input suportando ícones à esquerda e direita.
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface InputProps extends TextInputProps {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  iconLeft,
  iconRight,
  onIconRightPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused,
      containerStyle,
    ]}>
      {iconLeft && (
        <View style={styles.iconLeftContainer}>
          {iconLeft}
        </View>
      )}
      
      <TextInput
        style={[
          styles.input,
          iconLeft ? { paddingLeft: spacing.sm } : undefined,
          iconRight ? { paddingRight: spacing.sm } : undefined,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />

      {iconRight && (
        <TouchableOpacity
          style={styles.iconRightContainer}
          onPress={onIconRightPress}
          disabled={!onIconRightPress}
        >
          {iconRight}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    borderRadius: borderRadius.md,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  containerFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  iconLeftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
